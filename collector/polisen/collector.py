import os
import requests
import psycopg

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

def main():
    raw_events = fetch_police_events()
    normalized_events = [normalize_event(event) for event in raw_events]

    print(normalized_events[1])



if __name__=="__main__":
    main()