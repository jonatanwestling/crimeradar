# Crime-Radar-Sweden

Title: CRIME RADAR SWEDEN

Abstract: For this project our plan is to implement of a web application
for visualizing police reported incidents across Sweden using an
interactive map. The application combines real-time and historical data,
allowing users to explore incidents based on factors such as incident
type, location, and time period.

The primary data source is the Swedish Police Events API
(<https://polisen.se/api/events>), which provides information about
recently reported incidents but is limited to the 500 most recent
events. To overcome this limitation, a backend service periodically
retrieves new events from the API and stores them in a PostgreSQL
database. This creates a persistent archive of police-reported events
and enables the application to provide historical queries beyond the
retention limit of the API.

In addition to police reported events, historical crime statistics will
be scraped from Brå (<https://bra.se/>) and then injected into the
database. These data sources allow the application to present both
individual incidents and aggregated crime statistics. Users can select
incidents on the map to view additional information, while a separate
statistics interface provides an overview of crime trends and other
aggregated data.

## Setup

The database runs outside Docker. Create the environment file before
running production services or the collector:

```bash
cp .env.example .env
```

Then edit `.env` and point `DB_URL` at the external PostgreSQL database:

```bash
DB_URL=postgresql://USER:PASSWORD@HOST:5432/crime_radar
```

On the VPS, production containers use host networking, so `localhost` points at
the VPS itself. That means a local Postgres database can use
`localhost:5432` in `DB_URL`.

## Running on the VPS

Deploy the full production stack (Frontend, Backend, and Nginx reverse proxy) with one command:

```bash
./run.sh deploy
```

This starts:
- **Frontend**: Port `3000` in Docker (compiled React served via internal Nginx)
- **Backend API**: Port `8000` in Docker (FastAPI)
- **Collector**: Background service in Docker
- **Host Nginx**: Port `80` (reverse proxies `/` to 3000, and `/incidents` to 8000)

Useful production commands:

```bash
./run.sh prod        # Start both frontend & backend in Docker
./run.sh prod-logs   # View live container logs
./run.sh prod-down   # Stop all containers
```

## Running Locally for Debugging

Run the API and frontend together:

```bash
./run.sh dev
```

The API runs at <http://127.0.0.1:8000> and the frontend runs through Vite.

You can also run only one side:

```bash
./run.sh dev-api
./run.sh dev-frontend
```

To run the collector once against the database in `.env`:

```bash
./run.sh collector-once
```

## Connect to the database

```bash
psql -U radar_user -d crime_radar -h localhost -W
```

Now enter the password for the radar_user when prompted. The database
connection string is configured in `.env`.
