# MinHome

Internal tool for tracking real-estate transactions and the
source-of-truth around them. Coordinators use MinHome to manage
transactions through their lifecycle: from initial address capture
through closing, with structured fields edited as facts are confirmed.

MinHome serves multiple brokerage customers. Every transaction belongs
to a customer, and each customer has its own set of task definitions —
the rules that fire when source-of-truth fields change. Seeding creates
three customers with transactions and rules to poke at.

## Stack

- BE: Express, TypeScript, Mongoose
- FE: Vite, React, TypeScript, MUI
- Storage: MongoDB

## Setup

    docker compose up -d
    cp server/.env.example server/.env
    cp web/.env.example web/.env
    cd server && npm install && npm run seed && npm run dev
    # in another terminal:
    cd web && npm install && npm run dev

The API is at http://localhost:4000, the web app at http://localhost:5173.

## Project structure

- `server/` — Express API + Mongoose models + service layer
- `web/` — React app
- `docker-compose.yml` — local infra

## Running tests

    cd server && npm test

Tests run against the Mongo container; they use a separate `minhome-test`
database that's wiped per test file.

## Common tasks

    npm run seed              # reseed the database
    npm run dev               # starts both server and web
    npm run docker:up         # docker compose up -d
    npm run docker:down       # docker compose down
