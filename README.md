# Crime-Radar-Sweden

Title: CRIME RADAR SWEDEN

Abstract: For this project our plan is to implement of a web application
for visualizing police reported incidents across Sweden using an
interactive map. The application combines real-time and historical data,
allowing users to explore incidents based on factors such as incident
type, location, and time period.

The primary data source is the Swedish Police Events API
(https://polisen.se/api/events), which provides information about
recently reported incidents but is limited to the 500 most recent
events. To overcome this limitation, a backend service periodically
retrieves new events from the API and stores them in a PostgreSQL
database. This creates a persistent archive of police-reported events
and enables the application to provide historical queries beyond the
retention limit of the API.

In addition to police reported events, historical crime statistics will
be scraped from Brå (https://bra.se/) and then injected into the
database. These data sources allow the application to present both
individual incidents and aggregated crime statistics. Users can select
incidents on the map to view additional information, while a separate
statistics interface provides an overview of crime trends and other
aggregated data.

## Connect to the database

```bash
psql -U radar_user -d crime_radar -h localhost -W
```

Now enter the password for the radar_user when prompted (the password is located in the .env file).
