// api/db.js — MongoDB connection helper (reuses connection across warm invocations)
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.warn('[DB] MONGODB_URI is not set. API will not work until it is configured in Vercel.');
}

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set.');
  }

  // Return cached connection if available (Vercel keeps functions warm)
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });

  await client.connect();
  const db = client.db('universalSweets');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

module.exports = { connectToDatabase };
