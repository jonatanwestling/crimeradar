import sys
from pathlib import Path
from typing import Any

# Ensure backend/api directory is on sys.path
sys.path.append(str(Path(__file__).resolve().parent))

from mcp.server.mcpserver import MCPServer
from db import pool



mcp_server = MCPServer("CrimeRadarSweden")


def _serialize_event(row: dict[str, Any]) -> dict[str, Any]:
    dt = row.get("datetime")
    lat = row.get("latitude")
    lon = row.get("longitude")
    return {
        "id": row.get("id"),
        "datetime": dt.isoformat() if hasattr(dt, "isoformat") else (str(dt) if dt else None),
        "name": row.get("name"),
        "summary": row.get("summary"),
        "url": row.get("url"),
        "type": row.get("type"),
        "location_name": row.get("location_name"),
        "latitude": float(lat) if lat is not None else None,
        "longitude": float(lon) if lon is not None else None,
    }


@mcp_server.tool(
    name="search_events",
    description=(
        "Search and filter Swedish police incident events. Supports filtering by location "
        "(e.g. 'Stockholm'), incident type (e.g. 'Stöld', 'Rån'), date (YYYY-MM-DD) or date range, "
        "and free-text query in the event name or summary. Returns results sorted newest first."
    ),
)
def search_events(
    location: str | None = None,
    incident_type: str | None = None,
    date: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    query: str | None = None,
    limit: int = 25,
    offset: int = 0,
) -> list[dict[str, Any]]:
    conditions: list[str] = []
    params: dict[str, Any] = {}

    if location and location.strip():
        conditions.append("location_name ILIKE %(location)s")
        params["location"] = f"%{location.strip()}%"

    if incident_type and incident_type.strip():
        conditions.append("type ILIKE %(incident_type)s")
        params["incident_type"] = f"%{incident_type.strip()}%"

    # Single date or date range
    if date:
        conditions.append("(datetime AT TIME ZONE 'Europe/Stockholm')::date = %(date)s")
        params["date"] = date
    else:
        if start_date:
            conditions.append("(datetime AT TIME ZONE 'Europe/Stockholm')::date >= %(start_date)s")
            params["start_date"] = start_date
        if end_date:
            conditions.append("(datetime AT TIME ZONE 'Europe/Stockholm')::date <= %(end_date)s")
            params["end_date"] = end_date


    if query and query.strip():
        conditions.append("(name ILIKE %(query)s OR summary ILIKE %(query)s)")
        params["query"] = f"%{query.strip()}%"

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    params["limit"] = max(1, min(limit, 100))
    params["offset"] = max(0, offset)

    sql = f"""
        SELECT id, datetime, name, summary, url, type,
               location_name, longitude, latitude
        FROM public.police_events
        {where_clause}
        ORDER BY datetime DESC
        LIMIT %(limit)s OFFSET %(offset)s
    """

    with pool.connection() as conn:
        rows = conn.execute(sql, params).fetchall()

    return [_serialize_event(r) for r in rows]


@mcp_server.tool(
    name="list_incident_types",
    description=(
        "List all unique Swedish police incident types currently available in the database "
        "(e.g. 'Stöld', 'Rån', 'Trafikolycka', 'Brand'). Returns a flat list of category names."
    ),
)
def list_incident_types() -> list[str]:
    sql = """
        SELECT DISTINCT type
        FROM public.police_events
        WHERE type IS NOT NULL AND type <> ''
        ORDER BY type ASC
    """
    with pool.connection() as conn:
        rows = conn.execute(sql).fetchall()

    return [row["type"] for row in rows if row.get("type")]


from mcp.server.transport_security import TransportSecuritySettings


def get_mcp_sse_app():
    security = TransportSecuritySettings(enable_dns_rebinding_protection=False)
    return mcp_server.sse_app(transport_security=security)


if __name__ == "__main__":

    import asyncio
    pool.open()
    try:
        asyncio.run(mcp_server.run_stdio_async())
    finally:
        pool.close()



