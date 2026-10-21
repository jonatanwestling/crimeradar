from contextlib import asynccontextmanager
from datetime import date
from fastapi import FastAPI, Depends
from pydantic import BaseModel

try:
    from db import get_conn, pool
except ImportError:
    from app.db import get_conn, pool


# connect to DB at startup, close at exit
@asynccontextmanager
async def lifespan(app: FastAPI):
    pool.open()
    yield
    pool.close()


app = FastAPI(lifespan=lifespan)


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


@app.post("/incidents/county")
def county_incidents(request: CountyIncidentRequest, conn=Depends(get_conn)):
    validate_date_range(request.start_date, request.end_date)

    # County types in DB are "xxx län" use ILIKE to query by just "stockholm"
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
            public.police_events
        WHERE
            location_name ILIKE %s
            AND (datetime AT TIME ZONE 'Europe/Stockholm')::date
            BETWEEN %s AND %s
        ORDER BY
             datetime DESC
        """,
        (
            request.county,
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
            public.police_events
        WHERE (datetime AT TIME ZONE 'Europe/Stockholm')::date
              BETWEEN %s AND %s
        ORDER BY datetime DESC
        """,
        (request.start_date, request.end_date),
    ).fetchall()

    return rows


@app.post("/incidents/national/type")
def national_incidents_by_type(request: NationalIncidentTypeRequest):
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
        FROM public.police_events
        WHERE type ILIKE %s
          AND (datetime AT TIME ZONE 'Europe/Stockholm')::date
              BETWEEN %s AND %s
        ORDER BY datetime DESC
        """,
        (
            request.incident_type,
            request.start_date,
            request.end_date,
        ),
    ).fetchall()

    return rows
