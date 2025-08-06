// migration.js - Script to run D1 database migrations
// This can be executed within the container to set up your schema

const schema = `
CREATE TABLE IF NOT EXISTS names (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

// This script can be run manually if needed:
// wrangler d1 execute names_db --local --command="CREATE TABLE IF NOT EXISTS names (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
console.log("Run this migration with: wrangler d1 execute names_db --local --file=./migration.js");
