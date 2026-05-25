/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Script to create the admin accounts in the database.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined. Set it in .env.local or as an environment variable.");
  process.exit(1);
}

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
});

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const adminData = {
      username: "admin",
      email: "admin@digihip.com",
      firstname: "ADMIN",
      lastname: "DIGIHIP",
    };
    const plainPassword = "admin123";

    const existing = await Admin.findOne({
      $or: [
        { username: adminData.username },
        { email: adminData.email }
      ]
    });

    if (existing) {
      console.log("An admin with this username or email already exists.");
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const newAdmin = new Admin({
      ...adminData,
      password: hashedPassword,
    });

    await newAdmin.save();
    console.log("Admin created successfully!");
    console.log(`  Username: ${adminData.username}`);
    console.log(`  Email:    ${adminData.email}`);
    console.log(`  Password: ${plainPassword}`);
    console.log("\n  ** Please change the password after first login **");

  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
