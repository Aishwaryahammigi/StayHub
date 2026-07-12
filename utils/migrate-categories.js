const mongoose = require('mongoose');
require('dotenv').config();
const Listing = require('../models/listing');

const atlasUrl = process.env.ATLASDB_URL;
if (!atlasUrl) {
  console.error("Error: ATLASDB_URL not defined in .env file.");
  process.exit(1);
}

const dbUrls = [
  "mongodb://127.0.0.1:27017/wanderlust", // Local DB
  atlasUrl, // Atlas wanderlust database
  atlasUrl.replace('/wanderlust', '/test') // Atlas test database
];

function getCategory(title, location) {
  const text = `${title} ${location}`.toLowerCase();
  
  if (text.includes("mountain") || text.includes("hill") || text.includes("peaks") || 
      text.includes("himalayan") || text.includes("manali") || text.includes("shimla") || 
      text.includes("dharamshala") || text.includes("gulmarg") || text.includes("pahalgam") || 
      text.includes("mahabaleshwar")) {
    return "Mountains";
  }
  if (text.includes("pool") || text.includes("beachfront") || text.includes("resort") || 
      text.includes("calangute") || text.includes("anjuna") || text.includes("lonavala")) {
    return "Amazing Pools";
  }
  if (text.includes("shack") || text.includes("room") || text.includes("loft") || 
      text.includes("apartment") || text.includes("palolem")) {
    return "Rooms";
  }
  if (text.includes("houseboat") || text.includes("city") || text.includes("mumbai") || 
      text.includes("srinagar") || text.includes("panaji") || text.includes("haveli") || 
      text.includes("boutique") || text.includes("agra") || text.includes("udaipur") || 
      text.includes("new york") || text.includes("florence") || text.includes("historic")) {
    return "Iconic Cities";
  }
  if (text.includes("camp") || text.includes("safari") || text.includes("tent") || 
      text.includes("mulshi") || text.includes("jaisalmer") || text.includes("rishikesh")) {
    return "Camping";
  }
  if (text.includes("farm") || text.includes("estate") || text.includes("plantation") || 
      text.includes("homestay") || text.includes("coorg") || text.includes("chikmagalur") || 
      text.includes("kumarakom") || text.includes("treehouse") || text.includes("wayanad") || 
      text.includes("tuscany")) {
    return "Farms";
  }
  if (text.includes("snowy") || text.includes("arctic") || text.includes("glacier") || 
      text.includes("sonamarg") || text.includes("aspen")) {
    return "Arctic";
  }
  if (text.includes("dome") || text.includes("cabin") || text.includes("cottage") || 
      text.includes("madikeri") || text.includes("secluded") || text.includes("treehouse")) {
    return "Domes";
  }
  
  return "Trending";
}

async function migrateDb(url, name) {
  console.log(`Connecting to ${name} database: ${url}...`);
  try {
    const conn = await mongoose.createConnection(url, {
      tlsAllowInvalidCertificates: true
    }).asPromise();
    
    const MigListing = conn.model('Listing', Listing.schema);
    const listings = await MigListing.find({});
    console.log(`Found ${listings.length} listings in ${name}.`);
    
    let updatedCount = 0;
    for (let listing of listings) {
      const cat = getCategory(listing.title, listing.location);
      listing.category = cat;
      await listing.save();
      updatedCount++;
    }
    
    console.log(`Successfully migrated ${updatedCount} listings in ${name}!\n`);
    await conn.close();
  } catch (err) {
    console.error(`Migration failed for ${name} database: ${err.message}\n`);
  }
}

async function run() {
  await migrateDb(dbUrls[0], "LOCAL");
  await migrateDb(dbUrls[1], "ATLAS WANDERLUST");
  await migrateDb(dbUrls[2], "ATLAS TEST");
  console.log("Category migration completed successfully!");
}

run();
