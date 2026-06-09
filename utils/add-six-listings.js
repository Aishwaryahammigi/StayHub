const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Listing = require('../models/listing');
const User = require('../models/user');
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

const newListings = [
  {
    title: "Sunset View Villa in Anjuna",
    description: "A beautiful contemporary villa perched on the cliffs of Anjuna. Offers breathtaking sunset views over the sea and a private plunge pool.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" },
    price: 7000,
    location: "Anjuna, Goa",
    country: "India"
  },
  {
    title: "Lakeside Heritage Villa in Kumarakom",
    description: "A traditional Kerala-style wooden villa on the banks of Vembanad Lake. Features private gardens, hammocks, and authentic Ayurvedic treatments.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80" },
    price: 6800,
    location: "Kumarakom, Kerala",
    country: "India"
  },
  {
    title: "Mountain Valley Villa in Mahabaleshwar",
    description: "A spacious villa nestled in the valleys of Mahabaleshwar, surrounded by strawberry fields and mist-covered forest trails.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80" },
    price: 6000,
    location: "Mahabaleshwar, Maharashtra",
    country: "India"
  },
  {
    title: "Forest Edge Cottage in Chikmagalur",
    description: "A peaceful cottage located at the edge of a lush coffee plantation and evergreen forests. Perfect for trekking and birdwatching.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80" },
    price: 4500,
    location: "Chikmagalur, Karnataka",
    country: "India"
  },
  {
    title: "Luxury Houseboat on Dal Lake",
    description: "Stay in a traditional carved cedar houseboat on the quiet waters of Dal Lake. Features stunning views of the Pir Panjal mountains and Shikara rides.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80" },
    price: 8500,
    location: "Srinagar, Jammu and Kashmir",
    country: "India"
  },
  {
    title: "Apple Orchard Cottage in Dharamshala",
    description: "A quaint stone cottage surrounded by apple orchards, offering panoramic views of the Dhauladhar range. Cozy interiors with wooden beams.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80" },
    price: 4000,
    location: "Dharamshala, Himachal Pradesh",
    country: "India"
  }
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

async function addListings(url, dbName) {
  console.log(`Connecting to database: ${dbName}...`);
  const conn = await mongoose.createConnection(url, {
    tlsAllowInvalidCertificates: true
  }).asPromise();

  const AddListing = conn.model('Listing', Listing.schema);
  const AddUser = conn.model('User', User.schema);

  console.log(`Finding active user in database: ${dbName}...`);
  let user = await AddUser.findOne({});
  if (!user) {
    console.error(`Error: No active user found in ${dbName}.`);
    await conn.close();
    return;
  }
  console.log(`Using owner: ${user.username} (${user._id})`);

  const geocodedListings = [];

  for (let data of newListings) {
    const query = `${data.location}, ${data.country}`;
    console.log(`Geocoding "${data.title}" for location: "${query}"...`);
    const geometry = await geocodeAddress(query);

    const listingObj = {
      ...data,
      owner: user._id,
      geometry: geometry || {
        type: "Point",
        coordinates: [77.2090, 28.6139] // Fallback
      }
    };

    geocodedListings.push(listingObj);
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`Adding ${geocodedListings.length} new listings to database: ${dbName}...`);
  await AddListing.insertMany(geocodedListings);
  console.log(`Add successful for ${dbName}!\n`);

  await conn.close();
}

async function main() {
  try {
    await addListings(dbUrls[0], 'wanderlust');
    await addListings(dbUrls[1], 'test');
    console.log("All 6 listings successfully added!");
  } catch (err) {
    console.error("Failed to add listings:", err);
  }
}

main();
