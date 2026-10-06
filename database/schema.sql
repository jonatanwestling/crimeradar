
CREATE TABLE IF NOT EXISTS police_events (
    id BIGINT PRIMARY KEY,
    datetime TIMESTAMP NOT NULL,
    name varchar(255) NOT NULL,
    summary TEXT,
    url varchar(255) NOT NULL,
    type varchar(255) NOT NULL,
    location_name varchar(100) NOT NULL,
    longitude DECIMAL(9,6),
    latitude DECIMAL(9,6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);