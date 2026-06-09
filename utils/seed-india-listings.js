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

const listingsData = [
  {
    title: "Heritage Haveli in Udaipur",
    description: "Experience royal hospitality in this 200-year-old haveli overlooking Lake Pichola. Features traditional Mewari architecture and modern amenities.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1598977123418-45f04b615a0e?auto=format&fit=crop&w=800&q=80" },
    price: 6500,
    location: "Udaipur, Rajasthan",
    country: "India"
  },
  {
    title: "Royal Palace Suite in Jaipur",
    description: "Live like kings in this beautifully decorated apartment in the Pink City with view of the City Palace. Styled with traditional Rajasthani block prints.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80" },
    price: 4500,
    location: "Jaipur, Rajasthan",
    country: "India"
  },
  {
    title: "Desert Luxury Camp in Jaisalmer",
    description: "Stay in luxury swiss tents amidst the Sam Sand Dunes. Experience camel safaris, traditional folk dance, and dining under the starlit desert sky.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80" },
    price: 5500,
    location: "Jaisalmer, Rajasthan",
    country: "India"
  },
  {
    title: "Luxury Houseboat on Vembanad Lake",
    description: "Cruise through the serene backwaters of Kerala on a luxury wooden Kettuvallam. Includes private chef, viewing deck, and modern ensuite bedrooms.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80" },
    price: 9500,
    location: "Alleppey, Kerala",
    country: "India"
  },
  {
    title: "Hilltop Tea Plantation Villa in Munnar",
    description: "Located atop a misty hill in Munnar, this private villa offers 360-degree views of vast tea gardens, custom treks, and a fireplace.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=800&q=80" },
    price: 4800,
    location: "Munnar, Kerala",
    country: "India"
  },
  {
    title: "Cliffside Ocean Resort in Varkala",
    description: "Enjoy spectacular views of the Arabian Sea from this cliffside resort. Offers yoga decks, direct beach access, and Ayurvedic massage therapies.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80" },
    price: 5800,
    location: "Varkala, Kerala",
    country: "India"
  },
  {
    title: "Beachfront Villa in Calangute",
    description: "Step right onto the golden sandy shores of North Goa from this private luxury villa. Includes a private pool, sun beds, and beachside dining.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80" },
    price: 8000,
    location: "Calangute, Goa",
    country: "India"
  },
  {
    title: "Heritage Indo-Portuguese Home in Panaji",
    description: "Live in a beautifully restored Portuguese-style villa in Panaji's Latin Quarter (Fontainhas). Features vintage furniture and tiled roofs.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80" },
    price: 4200,
    location: "Panaji, Goa",
    country: "India"
  },
  {
    title: "Cozy Beach Shack in Palolem",
    description: "A wooden cottage nestled under coconut palms directly on South Goa's quiet Palolem Beach. Fall asleep to the sound of crashing waves.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80" },
    price: 3200,
    location: "Palolem, Goa",
    country: "India"
  },
  {
    title: "Mountain Cabin in Manali",
    description: "A rustic wooden cabin surrounded by tall pine forests and snow-capped Himalayan peaks. Features outdoor bonfire spaces and a sun porch.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80" },
    price: 3500,
    location: "Manali, Himachal Pradesh",
    country: "India"
  },
  {
    title: "Himalayan Stone House in Kasol",
    description: "A unique stone and wood house beside the Parvati River. Ideal for trekking, exploring cafe culture, and enjoying mountain breezes.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" },
    price: 2800,
    location: "Kasol, Himachal Pradesh",
    country: "India"
  },
  {
    title: "Pine Wood Chalet in Shimla",
    description: "An elegant mountain chalet offering stunning views of the Shimla valley and forests. Fully equipped kitchen and outdoor terrace.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1518098268026-4e43a1a009de?auto=format&fit=crop&w=800&q=80" },
    price: 5000,
    location: "Shimla, Himachal Pradesh",
    country: "India"
  },
  {
    title: "Serene Coffee Estate Homestay in Coorg",
    description: "Wake up to the aroma of coffee in this peaceful estate homestay. Includes guided plantation walks and authentic local Kodava meals.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80" },
    price: 4000,
    location: "Coorg, Karnataka",
    country: "India"
  },
  {
    title: "Luxury River Lodge in Kabini",
    description: "Nestled on the edge of Kabini River and Nagarhole Forest. Perfect for wildlife safaris, birdwatching, and premium jungle relaxation.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=800&q=80" },
    price: 11000,
    location: "Kabini, Karnataka",
    country: "India"
  },
  {
    title: "Modern Sea-View Penthouse in Mumbai",
    description: "Experience luxury living in South Mumbai with panoramic views of the Arabian Sea. Close to major restaurants and historical sights.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80" },
    price: 12000,
    location: "Mumbai, Maharashtra",
    country: "India"
  },
  {
    title: "Cliff-View Luxury Villa in Lonavala",
    description: "A high-end private villa situated on a cliff overlooking Lonavala's valleys and waterfalls. Includes an infinity pool and game rooms.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80" },
    price: 9000,
    location: "Lonavala, Maharashtra",
    country: "India"
  },
  {
    title: "Riverside Yoga Camp in Rishikesh",
    description: "Sleep in premium tents right beside the clear waters of the Ganges. Includes organic meals, daily yoga, and white water rafting options.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80" },
    price: 3000,
    location: "Rishikesh, Uttarakhand",
    country: "India"
  },
  {
    title: "Taj View Boutique Suite in Agra",
    description: "Wake up to stunning, direct views of the Taj Mahal from your private balcony. Elegant Mughlai-inspired decor and modern comforts.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80" },
    price: 7500,
    location: "Agra, Uttar Pradesh",
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

async function seedDatabase(url, dbName) {
  console.log(`Connecting to database: ${dbName}...`);
  const conn = await mongoose.createConnection(url, {
    tlsAllowInvalidCertificates: true
  }).asPromise();

  const SeedListing = conn.model('Listing', Listing.schema);
  const SeedUser = conn.model('User', User.schema);

  console.log(`Clearing existing listings in database: ${dbName}...`);
  await SeedListing.deleteMany({});

  console.log(`Finding active user in database: ${dbName}...`);
  let user = await SeedUser.findOne({});
  if (!user) {
    console.log("No user found. Creating a default admin user...");
    user = new SeedUser({
      username: "Aishwarya Hammigi",
      email: "aishwarya@stayhub.com"
    });
    await user.setPassword("stayhubadmin123");
    await user.save();
    console.log(`Created default user: ${user.username} (${user._id})`);
  } else {
    console.log(`Using owner: ${user.username} (${user._id})`);
  }

  const listingsWithGeocoding = [];

  for (let data of listingsData) {
    const query = `${data.location}, ${data.country}`;
    console.log(`Geocoding "${data.title}" for location: "${query}"...`);
    const geometry = await geocodeAddress(query);

    const listingObj = {
      ...data,
      owner: user._id,
      geometry: geometry || {
        type: "Point",
        coordinates: [77.2090, 28.6139] // New Delhi fallback if API fails
      }
    };

    listingsWithGeocoding.push(listingObj);
    // Add small delay to avoid Mapbox rate limits
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`Seeding ${listingsWithGeocoding.length} Indian listings in database: ${dbName}...`);
  await SeedListing.insertMany(listingsWithGeocoding);
  console.log(`Seeding successful for ${dbName}!\n`);

  await conn.close();
}

async function main() {
  try {
    await seedDatabase(dbUrls[0], 'wanderlust');
    await seedDatabase(dbUrls[1], 'test');
    console.log("Database localization and seeding finished successfully!");
  } catch (err) {
    console.error("Seeding process failed:", err);
  }
}

main();
