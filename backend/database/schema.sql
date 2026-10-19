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

CREATE INDEX IF NOT EXISTS idx_police_events_url ON police_events(url);

-- Table to store the additional text information for a police event
CREATE TABLE IF NOT EXISTS police_event_details (
    url varchar(255) PRIMARY KEY,
    title varchar(255) NOT NULL,
    short_description TEXT,
    description TEXT,
    text_by varchar(255),
    published_text varchar(255),
    updated_text varchar(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

