const mongoose = require('mongoose');
const User = require('../models/user');

const localUrl = "mongodb://127.0.0.1:27017/wanderlust";
const atlasUrl = "mongodb+srv://aishwaryahammigi:Aishu%407479@cluster0.cmyrogd.mongodb.net/wanderlust?appName=Cluster0";

async function renameInDb(url, name) {
  console.log(`Connecting to ${name} database...`);
  const conn = await mongoose.createConnection(url).asPromise();
  const DbUser = conn.model('User', User.schema);

  console.log(`Searching for user "Aishwarya Hammigi" in ${name}...`);
  const user = await DbUser.findOne({ username: "Aishwarya Hammigi" });
  if (user) {
    user.username = "stayhub_admin";
    user.email = "admin@stayhub.com";
    await user.save();
    console.log(`✅ Successfully renamed user in ${name} to "stayhub_admin"!`);
  } else {
    console.log(`ℹ️ User "Aishwarya Hammigi" not found in ${name}.`);
  }

  await conn.close();
}

async function run() {
  try {
    await renameInDb(localUrl, "Local");
    await renameInDb(atlasUrl, "Atlas");
    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

run();
