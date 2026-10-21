from contextlib import asynccontextmanager
from datetime import date
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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

# Enable CORS for local frontend development and external API consumers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    incident_type: str
    start_date: date
    end_date: date


def validate_date_range(start_date: date, end_date: date):
    if start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date cannot be later then end_date",
        )


# Endpoints
@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/incidents/statistics")
def daily_event_statistics(
    start_date: date,
    end_date: date,
    incident_type: str | None = None,
    conn=Depends(get_conn),
):
    validate_date_range(start_date, end_date)

    sql = """
        SELECT date, type, number_of_events
        FROM public.daily_event_statistics
        WHERE date BETWEEN %s AND %s
    """
    params = [start_date, end_date]

    if incident_type is not None:
        sql += " AND type = %s"
        params.append(incident_type)

    sql += " ORDER BY date, type"
    return conn.execute(sql, params).fetchall()


@app.post("/incidents/county")
def county_incidents(request: CountyIncidentRequest, conn=Depends(get_conn)):
    validate_date_range(request.start_date, request.end_date)

    # County types in DB are often "xxx län", allow substring/case-insensitive match
    county_param = (
        request.county
        if "%" in request.county
        else f"%{request.county.strip()}%"
    )
    rows = conn.execute(
        """
        SELECT
            id,
            datetime,
            name,
            summary,
            url,
            type,
            location_name,
            longitude,
            latitude
        FROM 
            v_police_events
        WHERE
            (location_name ILIKE %s OR raw_location_name ILIKE %s)
            AND (datetime AT TIME ZONE 'Europe/Stockholm')::date
            BETWEEN %s AND %s
        ORDER BY
             datetime DESC
        """,
        (
            county_param,
            county_param,
            request.start_date,
            request.end_date,
        ),
    ).fetchall()

    return rows


@app.post("/incidents/national")
def national_incidents(request: NationalIncidentsRequest, conn=Depends(get_conn)):
    validate_date_range(request.start_date, request.end_date)

    rows = conn.execute(
        """
        SELECT 
            id,
            datetime,
            name,
            summary,
            url,
            type,
            location_name,
            longitude,
            latitude
        FROM
            v_police_events
        WHERE (datetime AT TIME ZONE 'Europe/Stockholm')::date
              BETWEEN %s AND %s
        ORDER BY datetime DESC
        """,
        (request.start_date, request.end_date),
    ).fetchall()

    return rows


@app.post("/incidents/national/type")
def national_incidents_by_type(
    request: NationalIncidentTypeRequest, conn=Depends(get_conn)
):
    validate_date_range(request.start_date, request.end_date)

    type_param = (
        request.incident_type
        if "%" in request.incident_type
        else f"%{request.incident_type.strip()}%"
    )
    rows = conn.execute(
        """
        SELECT
            id,
            datetime,
            name,
            summary,
            url,
            type,
            location_name,
            longitude,
            latitude
        FROM v_police_events
        WHERE type ILIKE %s
          AND (datetime AT TIME ZONE 'Europe/Stockholm')::date
              BETWEEN %s AND %s
        ORDER BY datetime DESC
        """,
        (
            type_param,
            request.start_date,
            request.end_date,
        ),
    ).fetchall()

    return rows
