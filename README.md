# BFF for AmakrushAI

This allows for creation and mangement of flows of the building blocks I/O for AKAI.

### TODO

- [ ] Add an OpenAPI spec for the API

### Setting up the server

1. Setup

```sh
# Setup DB and Hasura
docker-compose up -d

# Migrate Database
npx prisma migrate dev

# Start dev server
yarn start:dev
```
