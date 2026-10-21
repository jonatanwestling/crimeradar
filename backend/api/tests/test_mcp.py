import asyncio
from datetime import datetime
from decimal import Decimal
from unittest.mock import MagicMock, patch

from backend.api.mcp_server import mcp_server, search_events, list_incident_types, _serialize_event


def test_serialize_event():
    raw_event = {
        "id": 12345,
        "datetime": datetime(2026, 10, 14, 14, 30, 0),
        "name": "14 oktober 14:30, Stöld, Stockholm",
        "summary": "Cykelstöld",
        "url": "/aktuellt/handelser/1",
        "type": "Stöld",
        "location_name": "Stockholm",
        "latitude": Decimal("59.329300"),
        "longitude": Decimal("18.068600"),
    }
    serialized = _serialize_event(raw_event)
    assert serialized["id"] == 12345
    assert serialized["datetime"] == "2026-10-14T14:30:00"
    assert serialized["latitude"] == 59.3293
    assert serialized["longitude"] == 18.0686
    assert serialized["type"] == "Stöld"


def test_search_events_query_building():
    mock_cursor = MagicMock()
    mock_cursor.fetchall.return_value = [
        {
            "id": 1,
            "datetime": datetime(2026, 10, 14, 10, 0, 0),
            "name": "Test incident",
            "summary": "Summary text",
            "url": "/url1",
            "type": "Stöld",
            "location_name": "Stockholm",
            "latitude": Decimal("59.33"),
            "longitude": Decimal("18.06"),
        }
    ]
    mock_conn = MagicMock()
    mock_conn.execute.return_value = mock_cursor

    with patch("backend.api.mcp_server.pool.connection") as mock_conn_context:
        mock_conn_context.return_value.__enter__.return_value = mock_conn

        results = search_events(
            location="Stockholm",
            incident_type="Stöld",
            date="2026-10-14",
            query="cykel",
            limit=10,
            offset=0,
        )

        assert len(results) == 1
        assert results[0]["type"] == "Stöld"
        assert results[0]["location_name"] == "Stockholm"

        args, _ = mock_conn.execute.call_args
        sql = args[0]
        params = args[1]
        assert "location_name ILIKE %(location)s" in sql
        assert "type ILIKE %(incident_type)s" in sql
        assert "(datetime AT TIME ZONE 'Europe/Stockholm')::date = %(date)s" in sql
        assert "(name ILIKE %(query)s OR summary ILIKE %(query)s)" in sql
        assert params["location"] == "%Stockholm%"
        assert params["incident_type"] == "%Stöld%"
        assert params["date"] == "2026-10-14"
        assert params["query"] == "%cykel%"
        assert params["limit"] == 10
        assert params["offset"] == 0

        # Also verify range filtering when start_date and end_date are passed
        search_events(start_date="2026-10-01", end_date="2026-10-15")
        range_args, _ = mock_conn.execute.call_args
        range_sql = range_args[0]
        range_params = range_args[1]
        assert "(datetime AT TIME ZONE 'Europe/Stockholm')::date >= %(start_date)s" in range_sql
        assert "(datetime AT TIME ZONE 'Europe/Stockholm')::date <= %(end_date)s" in range_sql
        assert range_params["start_date"] == "2026-10-01"
        assert range_params["end_date"] == "2026-10-15"



def test_list_incident_types():
    mock_cursor = MagicMock()
    mock_cursor.fetchall.return_value = [
        {"type": "Brand"},
        {"type": "Misshandel"},
        {"type": "Rån"},
        {"type": "Stöld"},
        {"type": "Trafikolycka"},
    ]
    mock_conn = MagicMock()
    mock_conn.execute.return_value = mock_cursor

    with patch("backend.api.mcp_server.pool.connection") as mock_conn_context:
        mock_conn_context.return_value.__enter__.return_value = mock_conn

        types = list_incident_types()
        assert types == ["Brand", "Misshandel", "Rån", "Stöld", "Trafikolycka"]


def test_mcp_tools_registration():
    async def run_check():
        tools = await mcp_server.list_tools()
        tool_names = [t.name for t in tools]
        assert "search_events" in tool_names
        assert "list_incident_types" in tool_names

    asyncio.run(run_check())



if __name__ == "__main__":
    test_serialize_event()
    test_search_events_query_building()
    test_list_incident_types()
    test_mcp_tools_registration()
    print("ALL TESTS PASSED SUCCESSFULLY!")

