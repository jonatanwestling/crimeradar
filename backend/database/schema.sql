BEGIN;
-- Table to store reference locations (municipalities, cities, towns)
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    municipality VARCHAR(100),
    county VARCHAR(100),
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_locations_name_lower ON locations (LOWER(name));
-- Base table to store the data from the police events API
CREATE TABLE IF NOT EXISTS police_events (
    id BIGINT PRIMARY KEY,
    datetime TIMESTAMPTZ NOT NULL,
    name VARCHAR(255) NOT NULL,
    summary TEXT,
    url VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    location_name VARCHAR(100) NOT NULL,
    longitude DECIMAL(9, 6),
    latitude DECIMAL(9, 6),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
-- Pause event writes until the trigger and existing counts are ready.
LOCK TABLE police_events IN SHARE ROW EXCLUSIVE MODE;
CREATE INDEX IF NOT EXISTS idx_police_events_url ON police_events (url);
CREATE INDEX IF NOT EXISTS idx_police_events_datetime ON police_events (datetime);
CREATE INDEX IF NOT EXISTS idx_police_events_type ON police_events (type);
CREATE INDEX IF NOT EXISTS idx_police_events_location_name ON police_events (location_name);
-- Extension table to store resolved geolocation (1-to-1 extension of police_events)
CREATE TABLE IF NOT EXISTS police_events_geo (
    event_id BIGINT PRIMARY KEY REFERENCES police_events(id) ON DELETE CASCADE,
    city VARCHAR(100) NOT NULL,
    municipality VARCHAR(100),
    county VARCHAR(100),
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    confidence VARCHAR(20) DEFAULT 'city',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_police_events_geo_city ON police_events_geo (city);
-- Compatibility alias view
CREATE OR REPLACE VIEW police_event_geo AS
SELECT *
FROM police_events_geo;
-- Trigger Function: Automatically resolves location and inserts into police_events_geo
CREATE OR REPLACE FUNCTION trg_populate_police_events_geo() RETURNS TRIGGER AS $$
DECLARE parsed_place TEXT;
cleaned_place TEXT;
loc_record RECORD;
name_parts TEXT [];
BEGIN -- 1. Extract candidate place from event name (last comma-separated part)
name_parts := string_to_array(NEW.name, ',');
IF array_length(name_parts, 1) >= 2 THEN parsed_place := trim(name_parts [array_length(name_parts, 1)]);
ELSE parsed_place := trim(NEW.name);
END IF;
-- 2. Strip common directional qualifiers (centrala, östra, västra, norra, södra, inre, yttre)
cleaned_place := regexp_replace(
    parsed_place,
    '^(centrala|östra|västra|norra|södra|inre|yttre)\s+',
    '',
    'i'
);
-- 3. Lookup in locations table (case-insensitive)
SELECT name,
    municipality,
    county,
    latitude,
    longitude INTO loc_record
FROM locations
WHERE LOWER(name) = LOWER(parsed_place)
    OR LOWER(name) = LOWER(cleaned_place)
ORDER BY (LOWER(name) = LOWER(parsed_place)) DESC
LIMIT 1;
-- 4. Upsert into police_events_geo
IF FOUND THEN
INSERT INTO police_events_geo (
        event_id,
        city,
        municipality,
        county,
        latitude,
        longitude,
        confidence,
        updated_at
    )
VALUES (
        NEW.id,
        loc_record.name,
        loc_record.municipality,
        loc_record.county,
        loc_record.latitude,
        loc_record.longitude,
        'city',
        CURRENT_TIMESTAMP
    ) ON CONFLICT (event_id) DO
UPDATE
SET city = EXCLUDED.city,
    municipality = EXCLUDED.municipality,
    county = EXCLUDED.county,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    confidence = EXCLUDED.confidence,
    updated_at = CURRENT_TIMESTAMP;
ELSE -- Fallback to raw police coordinates
INSERT INTO police_events_geo (
        event_id,
        city,
        municipality,
        county,
        latitude,
        longitude,
        confidence,
        updated_at
    )
VALUES (
        NEW.id,
        NEW.location_name,
        NULL,
        NEW.location_name,
        COALESCE(NEW.latitude, 0.0),
        COALESCE(NEW.longitude, 0.0),
        'county_fallback',
        CURRENT_TIMESTAMP
    ) ON CONFLICT (event_id) DO
UPDATE
SET city = EXCLUDED.city,
    municipality = EXCLUDED.municipality,
    county = EXCLUDED.county,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    confidence = EXCLUDED.confidence,
    updated_at = CURRENT_TIMESTAMP;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Attach trigger to police_events table
DROP TRIGGER IF EXISTS trg_police_events_enrich_geo ON police_events;
CREATE TRIGGER trg_police_events_enrich_geo
AFTER
INSERT
    OR
UPDATE OF name,
    location_name,
    latitude,
    longitude ON police_events FOR EACH ROW EXECUTE FUNCTION trg_populate_police_events_geo();
-- Unified view combining base events with resolved geolocation
CREATE OR REPLACE VIEW v_police_events AS
SELECT e.id,
    e.datetime,
    e.name,
    e.summary,
    e.url,
    e.type,
    COALESCE(g.city, e.location_name) AS location_name,
    COALESCE(g.longitude, e.longitude) AS longitude,
    COALESCE(g.latitude, e.latitude) AS latitude,
    e.location_name AS raw_location_name,
    e.longitude AS raw_longitude,
    e.latitude AS raw_latitude,
    g.confidence,
    e.created_at
FROM police_events e
    LEFT JOIN police_events_geo g ON e.id = g.event_id;
-- Daily event statistics
CREATE TABLE IF NOT EXISTS daily_event_statistics (
    date DATE NOT NULL,
    type VARCHAR(255) NOT NULL,
    number_of_events BIGINT NOT NULL CHECK (number_of_events >= 0),
    PRIMARY KEY (date, type)
);
CREATE OR REPLACE FUNCTION maintain_daily_event_statistics() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO daily_event_statistics (date, type, number_of_events)
VALUES (
        (NEW.datetime AT TIME ZONE 'Europe/Stockholm')::date,
        NEW.type,
        1
    ) ON CONFLICT (date, type) DO
UPDATE
SET number_of_events = daily_event_statistics.number_of_events + 1;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_daily_event_statistics ON police_events;
CREATE TRIGGER update_daily_event_statistics
AFTER
INSERT ON police_events FOR EACH ROW EXECUTE FUNCTION maintain_daily_event_statistics();
-- Rebuild existing counts so running this file again does not double-count.
DELETE FROM daily_event_statistics;
INSERT INTO daily_event_statistics (date, type, number_of_events)
SELECT (datetime AT TIME ZONE 'Europe/Stockholm')::date,
    type,
    COUNT(*)
FROM police_events
GROUP BY (datetime AT TIME ZONE 'Europe/Stockholm')::date,
    type;
COMMIT;