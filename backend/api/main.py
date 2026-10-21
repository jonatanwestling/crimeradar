from contextlib import asynccontextmanager
from datetime import date
from fastapi import FastAPI, Depends
from pydantic import BaseModel

import sys
from pathlib import Path

# Ensure backend/api directory is on sys.path
sys.path.append(str(Path(__file__).resolve().parent))

from db import get_conn, pool
from rate_limiter import InMemoryRateLimiterMiddleware
from mcp_server import get_mcp_sse_app


# connect to DB at startup, close at exit
@asynccontextmanager
async def lifespan(app: FastAPI):
    pool.open()
    yield
    pool.close()

app = FastAPI(lifespan=lifespan)

# Rate limit /mcp endpoints to 10 req/min per IP
app.add_middleware(InMemoryRateLimiterMiddleware, prefix="/mcp")

# Mount MCP SSE application at /mcp
app.mount("/mcp", get_mcp_sse_app())


# Requesttypes
class CountyIncidentRequest(BaseModel):
    county: str
    start_date: date
    end_date: date


class NationalIncidentsRequest(BaseModel):
    start_date: date
    end_date: date





class NationalIncidentTypeRequest(BaseModel):
    indicent_type: str
    start_date: date
    end_date: date


# Endpoints
@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/incidents/county")
def county_incidents(request: CountyIncidentRequest):

    return {
        "county": request.county,
        "start_date": request.start_date,
        "end_date": request.end_date,
    }


@app.post("/incidents/national")
def national_incidents(request: NationalIncidentsRequest, conn=Depends(get_conn)):
    rows = conn.execute(
        """
        SELECT id, datetime, name, summary, url, type,
               location_name, longitude, latitude
        FROM public.police_events
        WHERE (datetime AT TIME ZONE 'Europe/Stockholm')::date
              BETWEEN %s AND %s
        ORDER BY datetime DESC
        """,
        (request.start_date, request.end_date),
    ).fetchall()

    return rows


@app.post("/incidents/national/type")
def national_incidents_by_type(request: NationalIncidentTypeRequest):
    return {
        "incident_type": request.incident_type,
        "start_date": request.start_date,
        "end_date": request.end_date,
    }
