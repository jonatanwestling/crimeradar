# Requirements Specification

This document outlines the core functional and non-functional requirements for the project.

## Data Ingestion & Persistence

- The system shall periodically fetch police-reported events from the Swedish Police Events API.
- The system shall store retrieved events persistently in a PostgreSQL database to overcome the 500-event API limit.
- The system shall prevent duplicate incident records during recurring ingestion cycles.

## Backend API & MCP Server

- The backend API shall provide endpoints to query incidents filtered by location, incident type and date range.
- The backend shall provide an MCP (Model Context Protocol) server to allow AI agents to query incident data and crime statistics.

## Frontend & User Interface

- The application shall display reported police incidents on an interactive map of Sweden.
- The application shall allow users to filter displayed incidents by date, location, and incident type.
- The application shall display detailed event information when a user selects an incident on the map.
