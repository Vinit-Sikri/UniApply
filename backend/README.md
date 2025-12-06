# UniApply Backend API

RESTful API backend for the Unified University Application Platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (see `.env.example`)

3. Create PostgreSQL database:
```bash
createdb uniapply_db
```

4. Start server:
```bash
npm run dev
```

## Database Models

All models are defined using Sequelize ORM. The database will be automatically synced in development mode.

## API Documentation

See main README.md for API endpoint documentation.

