# Cloudflare Worker with D1 Database - GitHub Deployment

This project contains a Cloudflare Worker that provides an API for storing and retrieving names in a Cloudflare D1 database. It's designed to be deployed directly from GitHub to Cloudflare Workers.

## Features

- REST API with endpoints to add and retrieve names
- API key authentication for secure access
- Cloudflare D1 database integration
- Interactive API documentation with Swagger UI
- CORS support for web applications
- Direct deployment from GitHub to Cloudflare

## API Documentation

Once deployed, visit `/docs` endpoint to access the interactive Swagger UI documentation:
- Production: `https://your-worker.workers.dev/docs`

## Deployment Instructions

### Option 1: Direct Deployment from Cloudflare Dashboard (Recommended)

1. **Push this code to a GitHub repository**

2. **Go to Cloudflare Workers Dashboard:**
   - Visit [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to Workers & Pages
   - Click "Create application" > "Pages" > "Connect to Git"

3. **Connect your GitHub repository:**
   - Authorize Cloudflare to access your GitHub
   - Select this repository
   - Configure build settings:
     - Framework preset: None
     - Build command: `npm install`
     - Build output directory: `/` (leave empty)

4. **Set up Environment Variables:**
   - In your Pages project settings, add:
     - `CLOUDFLARE_API_TOKEN`: Your API token
     - `CLOUDFLARE_ACCOUNT_ID`: Your account ID

5. **Create D1 Database:**
   - In Cloudflare dashboard, go to D1
   - Create a new database named `names_db`
   - Note the database ID and update `wrangler.toml`

6. **Deploy:**
   - Your worker will auto-deploy on every push to main branch
   - Visit your worker URL to test

### Option 2: Using GitHub Actions (Alternative)

The repository includes GitHub Actions workflow that will:
- Install dependencies
- Deploy to Cloudflare Workers on every push to main

**Setup:**
1. Add these secrets to your GitHub repository:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID

2. Push to main branch to trigger deployment

## API Endpoints

### Authentication
All endpoints require `X-API-Key` header with value: `I-xWjCZ7gWnZ85gqf0zuYf8KnOKdRBYOUjGZiOlS`

### Endpoints

#### GET /api/names
Retrieve all stored names (ordered by newest first)

**Response:**
```json
{
  "success": true,
  "names": [
    {
      "id": 1,
      "name": "John Doe",
      "created_at": "2024-08-06 10:30:00"
    }
  ]
}
```

#### POST /api/names
Add a new name to the database

**Request:**
```json
{
  "name": "Jane Smith"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Name added successfully",
  "id": 2
}
```

## Database Schema

```sql
CREATE TABLE names (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Local Development (Optional)

If you want to test locally before deployment:

```bash
npm install
npx wrangler dev
```

## Notes

- The API key is hardcoded for demo purposes. In production, use environment variables
- CORS is enabled for all origins - restrict this for production use
- Database migrations run automatically on first deployment
