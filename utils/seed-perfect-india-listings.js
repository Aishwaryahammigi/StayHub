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
  // Goa (5)
  {
    title: "Sunset View Villa in Anjuna",
    description: "A beautiful contemporary villa perched on the cliffs of Anjuna. Offers breathtaking sunset views over the sea and a private plunge pool.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80" },
    price: 7000,
    location: "Anjuna, Goa",
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
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80" },
    price: 3200,
    location: "Palolem, Goa",
    country: "India"
  },
  {
    title: "Tropical Jungle Sanctuary in Candolim",
    description: "An eco-luxury forest villa nestled in the greenery of Candolim. Offers outdoor rain showers, stone paths, and absolute peace.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=800&q=80" },
    price: 9500,
    location: "Candolim, Goa",
    country: "India"
  },

  // Kerala (5)
  {
    title: "Luxury Houseboat on Vembanad Lake",
    description: "Cruise through the serene backwaters of Kerala on a luxury wooden Kettuvallam. Includes private chef, viewing deck, and modern ensuite bedrooms.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80" },
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
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80" },
    price: 5800,
    location: "Varkala, Kerala",
    country: "India"
  },
  {
    title: "Lakeside Heritage Villa in Kumarakom",
    description: "A traditional Kerala-style wooden villa on the banks of Vembanad Lake. Features private gardens, hammocks, and authentic Ayurvedic treatments.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&w=800&q=80" },
    price: 6800,
    location: "Kumarakom, Kerala",
    country: "India"
  },
  {
    title: "Treehouse Cabin in Wayanad Rainforest",
    description: "Live in a beautiful treehouse nestled high in the Wayanad rainforest canopy. Perfect for wildlife watching, nature treks, and organic meals.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80" },
    price: 7500,
    location: "Wayanad, Kerala",
    country: "India"
  },

  // Himachal Pradesh (4)
  {
    title: "Mountain Cabin in Manali",
    description: "A rustic wooden cabin surrounded by tall pine forests and snow-capped Himalayan peaks. Features outdoor bonfire spaces and a sun porch.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80" },
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
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&w=800&q=80" },
    price: 5000,
    location: "Shimla, Himachal Pradesh",
    country: "India"
  },
  {
    title: "Apple Orchard Cottage in Dharamshala",
    description: "A quaint stone cottage surrounded by apple orchards, offering panoramic views of the Dhauladhar range. Cozy interiors with wooden beams.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80" },
    price: 4000,
    location: "Dharamshala, Himachal Pradesh",
    country: "India"
  },

  // Jammu & Kashmir (4)
  {
    title: "Luxury Houseboat on Dal Lake",
    description: "Stay in a traditional carved cedar houseboat on the quiet waters of Dal Lake. Features stunning views of the Pir Panjal mountains and Shikara rides.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80" },
    price: 8500,
    location: "Srinagar, Jammu and Kashmir",
    country: "India"
  },
  {
    title: "Meadow Chalet in Gulmarg",
    description: "An alpine mountain cabin located near the Gulmarg meadows. Perfect for ski-in/ski-out stays, snowy peaks viewing, and hot cocoa by the hearth.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80" },
    price: 9000,
    location: "Gulmarg, Jammu and Kashmir",
    country: "India"
  },
  {
    title: "Pahalgam Riverfront Villa",
    description: "A gorgeous stone-and-wood villa situated directly on the banks of Lidder River in Pahalgam. Offers trout fishing and private pine forest walks.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80" },
    price: 7200,
    location: "Pahalgam, Jammu and Kashmir",
    country: "India"
  },
  {
    title: "Snowy Peaks Lodge in Sonamarg",
    description: "A premium mountain lodge nestled in Sonamarg. Features stone fireplaces, cedar walls, and direct trail access to Thajiwas Glacier.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80" },
    price: 6500,
    location: "Sonamarg, Jammu and Kashmir",
    country: "India"
  },

  // Karnataka (4)
  {
    title: "Serene Coffee Estate Homestay in Coorg",
    description: "Wake up to the aroma of coffee in this peaceful estate homestay. Includes guided plantation walks and authentic local Kodava meals.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80" },
    price: 4000,
    location: "Coorg, Karnataka",
    country: "India"
  },
  {
    title: "Forest Edge Cottage in Chikmagalur",
    description: "A peaceful cottage located at the edge of a lush coffee plantation and evergreen forests. Perfect for trekking and birdwatching.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80" },
    price: 4500,
    location: "Chikmagalur, Karnataka",
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
    title: "Eco-Cabin in Madikeri",
    description: "A cozy A-frame cottage situated inside a cardamom forest in Madikeri. Includes private hiking trails, bonfire pits, and morning mist views.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80" },
    price: 4800,
    location: "Madikeri, Karnataka",
    country: "India"
  },

  // Maharashtra (4)
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
    title: "Mountain Valley Villa in Mahabaleshwar",
    description: "A spacious villa nestled in the valleys of Mahabaleshwar, surrounded by strawberry fields and mist-covered forest trails.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80" },
    price: 6000,
    location: "Mahabaleshwar, Maharashtra",
    country: "India"
  },
  {
    title: "Lakeside Cabin in Mulshi",
    description: "A serene eco-cabin located right on the banks of Mulshi Lake. Enjoy kayaking, morning bird calls, and misty mountain backdrops.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80" },
    price: 5500,
    location: "Mulshi, Maharashtra",
    country: "India"
  },

  // Rajasthan (2)
  {
    title: "Heritage Haveli in Udaipur",
    description: "Experience royal hospitality in this 200-year-old haveli overlooking Lake Pichola. Features traditional Mewari architecture and modern amenities.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80" },
    price: 6500,
    location: "Udaipur, Rajasthan",
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

  // Uttarakhand & Uttar Pradesh (2)
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
    console.log("No user found. Creating default admin user...");
    user = new SeedUser({
      username: "stayhub_admin",
      email: "admin@stayhub.com"
    });
    await user.setPassword("stayhubadmin123");
    await user.save();
  }
  console.log(`Using owner: ${user.username} (${user._id})`);

  const listingsWithGeocoding = [];

  for (let data of listingsData) {
    const query = `${data.location}, ${data.country}`;
    console.log(`Geocoding "${data.title}" for location: "${query}"...`);
    const geometry = await geocodeAddress(query);

    const listingObj = {
      ...data,
      owner: user._id,
      category: getCategory(data.title, data.location),
      geometry: geometry || {
        type: "Point",
        coordinates: [77.2090, 28.6139] // Fallback
      }
    };

    listingsWithGeocoding.push(listingObj);
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`Seeding ${listingsWithGeocoding.length} scenic Indian listings in database: ${dbName}...`);
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
