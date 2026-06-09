const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/user');
const Review = require('../models/review');

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
    console.log("Connected to local database.");
    const LocalUser = localConn.model('User', User.schema);
    const LocalReview = localConn.model('Review', Review.schema);
    
    console.log("Connecting to MongoDB Atlas...");
    const atlasConn = await mongoose.createConnection(atlasUrl, {
      tlsAllowInvalidCertificates: true
    }).asPromise();
    console.log("Connected to MongoDB Atlas.");
    const AtlasUser = atlasConn.model('User', User.schema);
    const AtlasReview = atlasConn.model('Review', Review.schema);
    
    // 1. Migrate Users
    console.log("Migrating users...");
    const users = await LocalUser.find({});
    let usersMigrated = 0;
    let usersSkipped = 0;
    for (let user of users) {
      const conflict = await AtlasUser.findOne({
        $or: [
          { username: user.username },
          { email: user.email }
        ]
      });
      
      if (conflict) {
        if (conflict._id.toString() !== user._id.toString()) {
          console.log(`Deleting conflicting user on Atlas: ${conflict.username} (${conflict._id})`);
          await AtlasUser.deleteOne({ _id: conflict._id });
          await AtlasUser.create(user.toObject());
          usersMigrated++;
        } else {
          usersSkipped++;
        }
      } else {
        const exists = await AtlasUser.findById(user._id);
        if (!exists) {
          await AtlasUser.create(user.toObject());
          usersMigrated++;
        } else {
          usersSkipped++;
        }
      }
    }
    console.log(`Users migration complete. Migrated: ${usersMigrated}, Skipped: ${usersSkipped}`);
    
    // 2. Migrate Reviews
    console.log("Migrating reviews...");
    const reviews = await LocalReview.find({});
    let reviewsMigrated = 0;
    let reviewsSkipped = 0;
    for (let review of reviews) {
      const exists = await AtlasReview.findById(review._id);
      if (!exists) {
        await AtlasReview.create(review.toObject());
        reviewsMigrated++;
      } else {
        reviewsSkipped++;
      }
    }
    console.log(`Reviews migration complete. Migrated: ${reviewsMigrated}, Skipped: ${reviewsSkipped}`);
    
    await localConn.close();
    await atlasConn.close();
    console.log("Migration finished successfully.");
  } catch (err) {
    console.error("Migration failed with error:", err);
  }
}

migrate();
