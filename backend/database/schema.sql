BEGIN;

-- Table to store the data from the police events API
CREATE TABLE IF NOT EXISTS police_events (
    id BIGINT PRIMARY KEY,
    datetime TIMESTAMPTZ NOT NULL,
    name varchar(255) NOT NULL,
    summary TEXT,
    url varchar(255) NOT NULL,
    type varchar(255) NOT NULL,
    location_name varchar(100) NOT NULL,
    longitude DECIMAL(9,6),
    latitude DECIMAL(9,6),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Pause event writes until the trigger and existing counts are ready.
LOCK TABLE police_events IN SHARE ROW EXCLUSIVE MODE;

CREATE TABLE IF NOT EXISTS daily_event_statistics (
    date DATE NOT NULL,
    type VARCHAR(255) NOT NULL,
    number_of_events BIGINT NOT NULL CHECK (number_of_events >= 0),
    PRIMARY KEY (date, type)
);

CREATE OR REPLACE FUNCTION maintain_daily_event_statistics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO daily_event_statistics (date, type, number_of_events)
    VALUES (
        (NEW.datetime AT TIME ZONE 'Europe/Stockholm')::date,
        NEW.type,
        1
    )
    ON CONFLICT (date, type) DO UPDATE
    SET number_of_events = daily_event_statistics.number_of_events + 1;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_daily_event_statistics ON police_events;
CREATE TRIGGER update_daily_event_statistics
AFTER INSERT ON police_events
FOR EACH ROW EXECUTE FUNCTION maintain_daily_event_statistics();

-- Rebuild existing counts so running this file again does not double-count.
DELETE FROM daily_event_statistics;
INSERT INTO daily_event_statistics (date, type, number_of_events)
SELECT
    (datetime AT TIME ZONE 'Europe/Stockholm')::date,
    type,
    COUNT(*)
FROM police_events
GROUP BY (datetime AT TIME ZONE 'Europe/Stockholm')::date, type;

COMMIT;

