import os
import requests
import psycopg
from dotenv import load_dotenv


POLICE_EVENTS_URL = "https://polisen.se/api/events"

def fetch_police_events():
    response = requests.get(POLICE_EVENTS_URL, timeout=10)
    response.raise_for_status()
    return response.json()

def normalize_event(event):
    return {
        "police_id": event["id"],
        "datetime": event["datetime"],
        "name": event["name"],
        "summary": event["summary"],
        "type": event["type"],
        "location_name": event["location"]["name"],
        "latitude": event["location"]["gps"].split(",")[0],
        "longitude": event["location"]["gps"].split(",")[1],
        "url": event["url"],
    }

def save_event(conn, event):
    sql = """
        INSERT INTO police_events (
            id,
            datetime,
            name,
            summary,
            url,
            type,
            location_name,
            longitude,
            latitude
        )
        VALUES (
            %(id)s,
            %(datetime)s,
            %(name)s,
            %(summary)s,
            %(url)s,
            %(type)s,
            %(location_name)s,
            %(longitude)s,
            %(latitude)s
        )
        ON CONFLICT (id) DO NOTHING;
    """

    with conn.cursor() as cur:
        cur.execute(sql, event)

def main():
    load_dotenv()
    database_url = os.getenv("DATABASE_URL")

    raw_events = fetch_police_events()
    normalized_events = [normalize_event(event) for event in raw_events]

    with psycopg.connect(database_url) as conn:
        for event in normalized_events:
            save_event(conn, event)

        conn.commit()

    print(f"Collected {len(normalized_events)} police events")

    print(normalized_events[1])



if __name__=="__main__":
    main()