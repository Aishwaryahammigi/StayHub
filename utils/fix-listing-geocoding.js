const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Listing = require('../models/listing');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const mapToken = process.env.MAP_TOKEN;
if (!mapToken) {
  console.error("Error: MAP_TOKEN not defined in .env file.");
  process.exit(1);
}
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const atlasUrl = process.env.ATLASDB_URL;
if (!atlasUrl) {
  console.error("Error: ATLASDB_URL not defined in .env file.");
  process.exit(1);
}

const dbUrls = [
  atlasUrl, // wanderlust database
  atlasUrl.replace('/wanderlust', '/test') // test database
];

async function geocodeAddress(query) {
  try {
    const response = await geocodingClient.forwardGeocode({
      query: query,
      limit: 1,
    }).send();
    if (response && response.body && response.body.features && response.body.features.length > 0) {
      return response.body.features[0].geometry;
    }
  } catch (err) {
    console.error(`Error geocoding query "${query}":`, err.message);
  }
  return null;
}

async function fixDatabase(url, dbName) {
  console.log(`Connecting to database: ${dbName}...`);
  const conn = await mongoose.createConnection(url, {
    tlsAllowInvalidCertificates: true
  }).asPromise();
  const AtlasListing = conn.model('Listing', Listing.schema);

  // We find listings with fallback coordinates (New Delhi: longitude 77.2090, latitude 28.6139)
  // Or listings where geometry coordinates are exactly [77.2090, 28.6139] or [77.209, 28.6139]
  const listings = await AtlasListing.find({});
  console.log(`Checking ${listings.length} listings in database: ${dbName}...`);

  let updatedCount = 0;

  for (let listing of listings) {
    const coords = listing.geometry && listing.geometry.coordinates;
    const isDelhiFallback = coords && coords.length === 2 && 
      Math.abs(coords[0] - 77.2090) < 0.01 && 
      Math.abs(coords[1] - 28.6139) < 0.01;

    // Also check if geometry coordinates are missing or invalid
    const isInvalidGeometry = !listing.geometry || 
      !listing.geometry.type || 
      listing.geometry.type !== 'Point' || 
      !coords || 
      coords.length === 0;

    if (isDelhiFallback || isInvalidGeometry) {
      const query = `${listing.location}, ${listing.country}`;
      console.log(`Geocoding listing "${listing.title}" for location: "${query}"...`);
      
      const newGeometry = await geocodeAddress(query);
      if (newGeometry) {
        listing.geometry = newGeometry;
        await listing.save();
        console.log(`Updated "${listing.title}" to coordinates:`, newGeometry.coordinates);
        updatedCount++;
      } else {
        console.log(`Could not find coordinates for "${query}". Skipping.`);
      }
      // Add a small delay between Mapbox API calls to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  console.log(`Finished ${dbName}. Updated ${updatedCount} listings.\n`);
  await conn.close();
}

async function main() {
  try {
    await fixDatabase(dbUrls[0], 'wanderlust');
    await fixDatabase(dbUrls[1], 'test');
    console.log("Geocoding corrections finished successfully!");
  } catch (err) {
    console.error("Geocoding correction failed:", err);
  }
}

main();
