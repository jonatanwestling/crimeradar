from fastapi import FastAPI
from datetime import date
from pydantic import BaseModel


app = FastAPI()


# Requesttypes
class CountyIncidentRequest(BaseModel):
    county: str
    start_date: date
    end_date: date


class NationalIncidentsRequest(BaseModel):
    start_date: date
    end_date: date


class NationalIncidentTypeRequest(BaseModel):
    indicentType: str
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
def national_incidents(request: NationalIncidentsRequest):
    return {
        "start_date": request.start_date,
        "end_date": request.end_date,
    }


@app.post("/incidents/national/type")
def national_incidents_by_type(request: NationalIncidentTypeRequest):
    return {
        "incident_type": request.incident_type,
        "start_date": request.start_date,
        "end_date": request.end_date,
    }
