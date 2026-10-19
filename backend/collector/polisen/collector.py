import os
import requests
import psycopg
from dotenv import load_dotenv
from time import sleep


POLICE_EVENTS_URL = "https://polisen.se/api/events"

def fetch_police_events():
    headers = {
        'User-Agent': 'CrimeRadarSweden/1.0'
    }
    response = requests.get(POLICE_EVENTS_URL, headers=headers, timeout=10)
    response.raise_for_status()
    return response.json()

def normalize_event(event):
    gps = event.get("location", {}).get("gps", "") if event.get("location") else ""
    parts = gps.split(",") if gps else []
    lat = parts[0].strip() if len(parts) > 0 else None
    lon = parts[1].strip() if len(parts) > 1 else None

    return {
        "id": event["id"],
        "datetime": event["datetime"],
        "name": event["name"],
        "summary": event.get("summary"),
        "type": event["type"],
        "location_name": event.get("location", {}).get("name", "Okänd") if event.get("location") else "Okänd",
        "latitude": lat,
        "longitude": lon,
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
        try:
            with conn.transaction():
                cur.execute(sql, event)
        except psycopg.Error as e:
            print(f"Skipping event {event.get('id')} due to DB error: {e}", flush=True)

def main():
    while True:
        try:
            load_dotenv()
            database_url = os.getenv("DB_URL")
            if not database_url:
                print("Error: DB_URL environment variable is not set.", flush=True)
                sleep(10)
                continue

            raw_events = fetch_police_events()
            normalized_events = [normalize_event(event) for event in raw_events]

            with psycopg.connect(database_url) as conn:
                for event in normalized_events:
                    save_event(conn, event)
                conn.commit()

            print(f"Successfully processed {len(normalized_events)} events.", flush=True)

        except Exception as e:
            print(f"Error in collection cycle: {e}", flush=True)

        sleep(60)


if __name__ == "__main__":
    main()