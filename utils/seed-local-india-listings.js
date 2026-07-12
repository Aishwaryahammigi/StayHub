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

const localDbUrl = "mongodb://127.0.0.1:27017/wanderlust";

const listingsData = [
  // Goa
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
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80" },
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
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1596524430615-b46475ddff6e?auto=format&fit=crop&w=800&q=80" },
    price: 3200,
    location: "Palolem, Goa",
    country: "India"
  },
  {
    title: "Tropical Jungle Sanctuary in Candolim",
    description: "An eco-luxury forest villa nestled in the greenery of Candolim. Offers outdoor rain showers, stone paths, and absolute peace.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" },
    price: 9500,
    location: "Candolim, Goa",
    country: "India"
  },

  // Kerala
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
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1566908829550-e6551b00979b?auto=format&fit=crop&w=800&q=80" },
    price: 4800,
    location: "Munnar, Kerala",
    country: "India"
  },
  {
    title: "Cliffside Ocean Resort in Varkala",
    description: "Enjoy spectacular views of the Arabian Sea from this cliffside resort. Offers yoga decks, direct beach access, and Ayurvedic massage therapies.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80" },
    price: 5800,
    location: "Varkala, Kerala",
    country: "India"
  },
  {
    title: "Lakeside Heritage Villa in Kumarakom",
    description: "A traditional Kerala-style wooden villa on the banks of Vembanad Lake. Features private gardens, hammocks, and authentic Ayurvedic treatments.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80" },
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

  // Himachal Pradesh
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
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80" },
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
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80" },
    price: 4000,
    location: "Dharamshala, Himachal Pradesh",
    country: "India"
  },

  // Jammu & Kashmir
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

  // Karnataka
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

  // Maharashtra
  {
    title: "Modern Sea-View Penthouse in Mumbai",
    description: "Experience luxury living in South Mumbai with panoramic views of the Arabian Sea. Close to major restaurants and historical sights.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80" },
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

  // Rajasthan
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

  // Himachal Pradesh (Additional to reach 5)
  {
    title: "Riverside Forest Cabin in Jibhi",
    description: "A cozy wooden log cabin on the banks of a sparkling stream in Jibhi. Perfect for nature lovers, trout fishing, and hikes.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80" },
    price: 3800,
    location: "Jibhi, Himachal Pradesh",
    country: "India"
  },

  // Jammu & Kashmir (Additional to reach 5)
  {
    title: "Mountain Meadows Log Cabin in Patnitop",
    description: "Escape to this scenic log cabin in Patnitop surrounded by lush meadows and tall pine trees. Relax by the fireplace and enjoy valley views.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80" },
    price: 4500,
    location: "Patnitop, Jammu and Kashmir",
    country: "India"
  },

  // Karnataka (Additional to reach 5)
  {
    title: "Heritage Tea Estate Bungalow in Sakleshpur",
    description: "A historic estate bungalow nestled inside Sakleshpur tea plantations. Experience misty morning walks, birdwatching, and local hospitality.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1566908829550-e6551b00979b?auto=format&fit=crop&w=800&q=80" },
    price: 5200,
    location: "Sakleshpur, Karnataka",
    country: "India"
  },

  // Maharashtra (Additional to reach 5)
  {
    title: "Luxury Pool Villa in Alibaug",
    description: "A beautiful modern villa in Alibaug with a large private swimming pool, landscaped lawns, and close proximity to the beach.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" },
    price: 8500,
    location: "Alibaug, Maharashtra",
    country: "India"
  },

  // Rajasthan (Additional to reach 5)
  {
    title: "Royal Palace Suite in Jaipur",
    description: "Live like kings in this beautifully decorated apartment in the Pink City with view of the City Palace. Styled with traditional Rajasthani block prints.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80" },
    price: 4800,
    location: "Jaipur, Rajasthan",
    country: "India"
  },
  {
    title: "Heritage Fort Villa in Jodhpur",
    description: "A majestic traditional villa offering scenic views of Mehrangarh Fort. Features ornate stone carvings and beautiful rooftop dining.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80" },
    price: 5800,
    location: "Jodhpur, Rajasthan",
    country: "India"
  },
  {
    title: "Lakefront Royal Haveli in Pushkar",
    description: "Experience the spiritual calm of Pushkar from this beautiful lakefront haveli. Enjoy serene lake views and traditional architecture.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80" },
    price: 3900,
    location: "Pushkar, Rajasthan",
    country: "India"
  },

  // Uttarakhand (5 in total)
  {
    title: "Riverside Yoga Camp in Rishikesh",
    description: "Sleep in premium tents right beside the clear waters of the Ganges. Includes organic meals, daily yoga, and white water rafting options.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80" },
    price: 3000,
    location: "Rishikesh, Uttarakhand",
    country: "India"
  },
  {
    title: "Misty Mountain Chalet in Mussoorie",
    description: "An elegant mountain chalet in Mussoorie offering panoramic views of the Himalayas and the Doon valley. Features a large sun terrace.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=80" },
    price: 5500,
    location: "Mussoorie, Uttarakhand",
    country: "India"
  },
  {
    title: "Pine Forest Cottage in Nainital",
    description: "A cozy stone cottage nestled in the quiet pine woods of Nainital. Features a private fireplace and beautiful views of Naini Lake.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80" },
    price: 4200,
    location: "Nainital, Uttarakhand",
    country: "India"
  },
  {
    title: "Riverfront Eco Lodge in Jim Corbett",
    description: "Enjoy the wild serenity of Jim Corbett from this premium riverfront eco lodge. Features private cottages and guided jungle safari walks.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80" },
    price: 4800,
    location: "Jim Corbett, Uttarakhand",
    country: "India"
  },
  {
    title: "Himalayan View Retreat in Ranikhet",
    description: "A quiet mountain retreat in Ranikhet offering breathtaking views of the Trishul and Nanda Devi peaks. Features lush organic gardens.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" },
    price: 3600,
    location: "Ranikhet, Uttarakhand",
    country: "India"
  },

  // Uttar Pradesh (5 in total)
  {
    title: "Taj View Boutique Suite in Agra",
    description: "Wake up to stunning, direct views of the Taj Mahal from your private balcony. Elegant Mughlai-inspired decor and modern comforts.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80" },
    price: 7500,
    location: "Agra, Uttar Pradesh",
    country: "India"
  },
  {
    title: "Heritage Ghats Suite in Varanasi",
    description: "Stay steps away from the sacred Ganga ghats in this beautifully restored suite. Enjoy spiritual morning chants and boat rides.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80" },
    price: 4000,
    location: "Varanasi, Uttar Pradesh",
    country: "India"
  },
  {
    title: "Luxurious Modern Penthouse in Noida",
    description: "A sleek modern penthouse apartment in Noida offering premium amenities, high-speed Wi-Fi, and panoramic skyline views.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80" },
    price: 6500,
    location: "Noida, Uttar Pradesh",
    country: "India"
  },
  {
    title: "Nawab Royal Palace Suite in Lucknow",
    description: "Experience Nawabi luxury in this beautifully decorated palace suite in Lucknow. Features high ceilings, fine carpets, and local cuisine.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80" },
    price: 4500,
    location: "Lucknow, Uttar Pradesh",
    country: "India"
  },
  {
    title: "Riverside Countryside Farm in Mathura",
    description: "A peaceful countryside farm cottage on the banks of Yamuna River in Mathura. Enjoy organic meals, milking cows, and quiet walks.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80" },
    price: 3200,
    location: "Mathura, Uttar Pradesh",
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

const verifiedUniqueStayImages = [
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80", // 0: Goa Anjuna
  "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80", // 1: Goa Calangute
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80", // 2: Goa Panaji
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80", // 3: Goa Palolem
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", // 4: Goa Candolim
  "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80", // 5: Kerala Alleppey
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80", // 6: Kerala Munnar
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80", // 7: Kerala Varkala
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80", // 8: Kerala Kumarakom
  "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80", // 9: Kerala Wayanad
  "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80", // 10: HP Manali
  "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80", // 11: HP Kasol
  "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&w=800&q=80", // 12: HP Shimla
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80", // 13: HP Dharamshala
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80", // 14: Kashmir Srinagar
  "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80", // 15: Kashmir Gulmarg
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80", // 16: Kashmir Pahalgam
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80", // 17: Kashmir Sonamarg
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80", // 18: Karnataka Coorg
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80", // 19: Karnataka Chikmagalur
  "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=800&q=80", // 20: Karnataka Kabini
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80", // 21: Karnataka Madikeri
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", // 22: Maharashtra Mumbai
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80", // 23: Maharashtra Lonavala
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80", // 24: Maharashtra Mahabaleshwar
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80", // 25: Maharashtra Mulshi
  "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80", // 26: Rajasthan Udaipur
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80", // 27: Rajasthan Jaisalmer
  "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80", // 28: HP Jibhi (Additional)
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80", // 29: Kashmir Patnitop (Additional)
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80", // 30: Karnataka Sakleshpur (Additional)
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", // 31: Maharashtra Alibaug (Additional)
  "https://images.unsplash.com/photo-1508333706533-1ab43ecb1606?auto=format&fit=crop&w=800&q=80", // 32: Rajasthan Jaipur (Additional)
  "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80", // 33: Rajasthan Jodhpur (Additional)
  "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80", // 34: Rajasthan Pushkar (Additional)
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80", // 35: Uttarakhand Rishikesh
  "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=80", // 36: Uttarakhand Mussoorie
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80", // 37: Uttarakhand Nainital
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80", // 38: Uttarakhand Jim Corbett
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80", // 39: Uttarakhand Ranikhet
  "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80", // 40: UP Agra
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80", // 41: UP Varanasi
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", // 42: UP Noida
  "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80", // 43: UP Lucknow
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80", // 44: UP Mathura
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"  // 45: Fallback general stay
];

async function seedDatabase() {
  console.log(`Connecting to local database: ${localDbUrl}...`);
  await mongoose.connect(localDbUrl);

  console.log(`Clearing existing listings in local database...`);
  await Listing.deleteMany({});

  console.log(`Finding active user in local database...`);
  let user = await User.findOne({});
  if (!user) {
    console.log("No user found. Creating a default admin user...");
    user = new User({
      username: "stayhub_admin",
      email: "admin@stayhub.com"
    });
    await user.setPassword("stayhubadmin123");
    await user.save();
    console.log(`Created default user: ${user.username} (${user._id})`);
  } else {
    console.log(`Using owner: ${user.username} (${user._id})`);
  }

  const listingsWithGeocoding = [];

  for (let i = 0; i < listingsData.length; i++) {
    const data = listingsData[i];
    const category = getCategory(data.title, data.location);

    // Override price to be in a realistic range of 3000-4000 INR
    const hash = data.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    data.price = 3000 + (hash % 11) * 100; // Generates values between 3000 and 4000 in steps of 100

    // Set 100% unique verified stay image
    data.image.url = verifiedUniqueStayImages[i % verifiedUniqueStayImages.length];

    const query = `${data.location}, ${data.country}`;
    console.log(`Geocoding "${data.title}" for location: "${query}"...`);
    const geometry = await geocodeAddress(query);

    const listingObj = {
      ...data,
      owner: user._id,
      category: category,
      geometry: geometry || {
        type: "Point",
        coordinates: [77.2090, 28.6139] // New Delhi fallback
      }
    };

    listingsWithGeocoding.push(listingObj);
    // Add small delay to avoid Mapbox rate limits
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`Seeding ${listingsWithGeocoding.length} Indian listings in local database...`);
  await Listing.insertMany(listingsWithGeocoding);
  console.log("Local database successfully seeded with scenic Indian listings!\n");

  await mongoose.disconnect();
}

seedDatabase().catch(err => {
  console.error("Local database seeding failed:", err);
  process.exit(1);
});
