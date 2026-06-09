const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Listing = require('../models/listing');

const localUrl = "mongodb://127.0.0.1:27017/wanderlust";
const atlasUrl = process.env.ATLASDB_URL;

if (!atlasUrl) {
  console.error("Error: ATLASDB_URL not defined in .env file.");
  process.exit(1);
}

async function migrate() {
  try {
    console.log("Connecting to local MongoDB...");
    const localConn = await mongoose.createConnection(localUrl).asPromise();
    console.log("Connected to local database successfully.");
    
    const LocalListing = localConn.model('Listing', Listing.schema);
    
    console.log("Fetching listings from local database...");
    const listings = await LocalListing.find({});
    console.log(`Found ${listings.length} local listings.`);
    
    if (listings.length === 0) {
      console.log("No listings found to migrate.");
      await localConn.close();
      return;
    }
    
    console.log("Connecting to MongoDB Atlas...");
    const atlasConn = await mongoose.createConnection(atlasUrl, {
      tlsAllowInvalidCertificates: true
    }).asPromise();
    console.log("Connected to MongoDB Atlas successfully.");
    
    const AtlasListing = atlasConn.model('Listing', Listing.schema);
    
    console.log("Checking and migrating listings to Atlas...");
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (let listing of listings) {
      const exists = await AtlasListing.findOne({
        title: listing.title,
        location: listing.location
      });
      
      if (!exists) {
        const listingObj = listing.toObject();
        
        // Ensure geometry field is present and valid
        if (!listingObj.geometry || !listingObj.geometry.type || !listingObj.geometry.coordinates || listingObj.geometry.coordinates.length === 0) {
          listingObj.geometry = {
            type: 'Point',
            coordinates: [77.2090, 28.6139] // Fallback to coordinates (e.g. New Delhi)
          };
        }
        
        await AtlasListing.create(listingObj);
        migratedCount++;
      } else {
        skippedCount++;
      }
    }
    
    console.log(`Migration complete! Migrated: ${migratedCount}, Skipped (already exist): ${skippedCount}`);
    
    await localConn.close();
    await atlasConn.close();
    console.log("Database connections closed.");
  } catch (err) {
    console.error("Migration failed with error:", err);
  }
}

migrate();
