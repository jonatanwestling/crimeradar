-- Migration: Extension Table Pattern with Trigger (police_events_geo)
-- Keeps police_events 100% untouched. Automatically populates police_events_geo via trigger.

-- 1. Create reference table for Swedish municipalities and localities
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    municipality VARCHAR(100),
    county VARCHAR(100),
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_locations_name_lower ON locations (LOWER(name));

-- 2. Create the extension table for resolved geolocation
CREATE TABLE IF NOT EXISTS police_events_geo (
    event_id BIGINT PRIMARY KEY REFERENCES police_events(id) ON DELETE CASCADE,
    city VARCHAR(100) NOT NULL,
    municipality VARCHAR(100),
    county VARCHAR(100),
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    confidence VARCHAR(20) DEFAULT 'city',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_police_events_geo_city ON police_events_geo (city);

-- Create compatibility view/alias for singular 'police_event_geo'
CREATE OR REPLACE VIEW police_event_geo AS SELECT * FROM police_events_geo;

-- 3. Trigger Function: Automatically resolves location and inserts into police_events_geo
CREATE OR REPLACE FUNCTION trg_populate_police_events_geo()
RETURNS TRIGGER AS $$
DECLARE
    parsed_place TEXT;
    cleaned_place TEXT;
    loc_record RECORD;
    name_parts TEXT[];
BEGIN
    -- 1. Extract candidate place from event name (last comma-separated part)
    -- e.g. "21 oktober 06.58, Trafikolycka, Malmö" -> "Malmö"
    -- e.g. "21 oktober 08.21, Trafikolycka, personskada, Vetlanda" -> "Vetlanda"
    name_parts := string_to_array(NEW.name, ',');
    IF array_length(name_parts, 1) >= 2 THEN
        parsed_place := trim(name_parts[array_length(name_parts, 1)]);
    ELSE
        parsed_place := trim(NEW.name);
    END IF;

    -- 2. Strip common directional qualifiers (centrala, östra, västra, norra, södra, inre, yttre)
    cleaned_place := regexp_replace(parsed_place, '^(centrala|östra|västra|norra|södra|inre|yttre)\s+', '', 'i');

    -- 3. Lookup in locations table (case-insensitive)
    SELECT name, municipality, county, latitude, longitude INTO loc_record
    FROM locations
    WHERE LOWER(name) = LOWER(parsed_place) OR LOWER(name) = LOWER(cleaned_place)
    ORDER BY (LOWER(name) = LOWER(parsed_place)) DESC
    LIMIT 1;

    -- 4. Upsert into police_events_geo
    IF FOUND THEN
        INSERT INTO police_events_geo (
            event_id, city, municipality, county, latitude, longitude, confidence, updated_at
        )
        VALUES (
            NEW.id, loc_record.name, loc_record.municipality, loc_record.county,
            loc_record.latitude, loc_record.longitude, 'city', CURRENT_TIMESTAMP
        )
        ON CONFLICT (event_id) DO UPDATE SET
            city = EXCLUDED.city,
            municipality = EXCLUDED.municipality,
            county = EXCLUDED.county,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            confidence = EXCLUDED.confidence,
            updated_at = CURRENT_TIMESTAMP;
    ELSE
        -- Fallback to raw police coordinates
        INSERT INTO police_events_geo (
            event_id, city, municipality, county, latitude, longitude, confidence, updated_at
        )
        VALUES (
            NEW.id, NEW.location_name, NULL, NEW.location_name,
            COALESCE(NEW.latitude, 0.0), COALESCE(NEW.longitude, 0.0), 'county_fallback', CURRENT_TIMESTAMP
        )
        ON CONFLICT (event_id) DO UPDATE SET
            city = EXCLUDED.city,
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

-- 4. Attach trigger to police_events table
DROP TRIGGER IF EXISTS trg_police_events_enrich_geo ON police_events;

CREATE TRIGGER trg_police_events_enrich_geo
AFTER INSERT OR UPDATE OF name, location_name, latitude, longitude ON police_events
FOR EACH ROW
EXECUTE FUNCTION trg_populate_police_events_geo();

-- 5. Unified view combining base events with resolved geolocation
CREATE OR REPLACE VIEW v_police_events AS
SELECT 
    e.id,
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

-- 6. Trigger backfill on all existing events
UPDATE police_events SET name = name;

