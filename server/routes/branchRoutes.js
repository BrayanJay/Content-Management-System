import express from "express";
import {connectToDatabase} from '../lib/db.js'
import 'dotenv/config';

const router = express.Router();

//Get branch data
router.get("/branches/getBranchDetails/:lang", async (req, res) => {
  const { lang = "en" } = req.params; // Get language from query params, default to 'en'

  let db;
  try {
    db = await connectToDatabase();

    // Fetch all branch details for the given language
    const [branchDetails] = await db.query("SELECT * FROM branch_details WHERE lang = ?", [lang]);

    if (branchDetails.length === 0) {
      return res.status(404).json({ message: "No branches found for the selected language." });
    }

    // Extract all branch_ids from branchDetails
    const branchIds = branchDetails.map(branch => branch.branch_id);

    // Fetch coordinates for all branch_ids
    const [coordinates] = await db.query("SELECT branch_id, latitude, longitude FROM branch_coordinates WHERE branch_id IN (?)", [branchIds]);

    // Fetch contacts for all branch_ids
    const [contacts] = await db.query("SELECT branch_id, contact_number, picture FROM branch_contacts WHERE branch_id IN (?)", [branchIds]);

    // Convert coordinates and contacts into maps for easy lookup
    const coordinatesMap = Object.fromEntries(coordinates.map(coord => [coord.branch_id, coord]));
    const contactsMap = Object.fromEntries(contacts.map(contact => [contact.branch_id, contact]));

    // Merge all data based on branch_id
    const mergedData = branchDetails.map(branch => ({
      ...branch,
      latitude: coordinatesMap[branch.branch_id]?.latitude || null,
      longitude: coordinatesMap[branch.branch_id]?.longitude || null,
      contact_number: contactsMap[branch.branch_id]?.contact_number || null,
      picture: contactsMap[branch.branch_id]?.picture || null
    }));

    res.json(mergedData);  

  } catch (e) {
    console.error("Error fetching branch details:", e.message);
    res.status(500).json({ message: "Internal Server Error" });

  } finally {
    if (db) await db.release(); // Ensure release is awaited
  }
});

//Get Branches by region
router.get("/branches/getBranchDetails/:region_name/:lang", async (req, res) => {
  const { region_name, lang = "en" } = req.params; // Get language from query params, default to 'en'

  let db;
  try {
    db = await connectToDatabase();

    // Fetch all branch details for the given language
    const [branchDetails] = await db.query("SELECT * FROM branch_details WHERE region_name = ? AND lang = ?", [region_name, lang]);

    if (branchDetails.length === 0) {
      return res.status(404).json({ message: "No branches found for the selected language." });
    }

    // Extract all branch_ids from branchDetails
    const branchIds = branchDetails.map(branch => branch.branch_id);

    // Fetch coordinates for all branch_ids
    const [coordinates] = await db.query("SELECT branch_id, latitude, longitude FROM branch_coordinates WHERE branch_id IN (?)", [branchIds]);

    // Fetch contacts for all branch_ids
    const [contacts] = await db.query("SELECT branch_id, contact_number, picture FROM branch_contacts WHERE branch_id IN (?)", [branchIds]);

    // Convert coordinates and contacts into maps for easy lookup
    const coordinatesMap = Object.fromEntries(coordinates.map(coord => [coord.branch_id, coord]));
    const contactsMap = Object.fromEntries(contacts.map(contact => [contact.branch_id, contact]));

    // Merge all data based on branch_id
    const mergedData = branchDetails.map(branch => ({
      ...branch,
      latitude: coordinatesMap[branch.branch_id]?.latitude || null,
      longitude: coordinatesMap[branch.branch_id]?.longitude || null,
      contact_number: contactsMap[branch.branch_id]?.contact_number || null,
      picture: contactsMap[branch.branch_id]?.picture || null
    }));

    res.json(mergedData);  

  } catch (e) {
    console.error("Error fetching branch details:", e.message);
    res.status(500).json({ message: "Internal Server Error" });

  } finally {
    if (db) await db.release(); // Ensure release is awaited
  }
});

//Get All Details by Branch ID
router.get("/branches/getBranchById/:branch_id/:lang", async (req, res) => {
  const { branch_id, lang } = req.params;

  let db;
  try {
    db = await connectToDatabase();

    // Fetch branch details for the given branch_id and language
    const [branchDetails] = await db.query("SELECT * FROM branch_details WHERE branch_id = ? AND lang = ?", [branch_id, lang]);

    if (branchDetails.length === 0) {
      return res.status(404).json({ message: "No branch found for the given ID and language." });
    }

    // Fetch branch coordinates for the given branch_id
    const [coordinates] = await db.query("SELECT latitude, longitude FROM branch_coordinates WHERE branch_id = ?", [branch_id]);

    // Fetch branch contacts for the given branch_id
    const [contacts] = await db.query("SELECT contact_number, picture FROM branch_contacts WHERE branch_id = ?", [branch_id]);

    // Merge the data into a single object
    const mergedData = {
      ...branchDetails[0], // Extracting first element as branch_id is unique
      latitude: coordinates[0]?.latitude || null,   // Extract first latitude
      longitude: coordinates[0]?.longitude || null, // Extract first longitude
      contact_number: contacts[0]?.contact_number || null, // Extract first contact
      picture: contacts[0]?.picture || null
    };

    res.json(mergedData);

  } catch (e) {
    console.error("Error fetching branch details:", e.message);
    res.status(500).json({ message: "Internal Server Error" });

  } finally {
    if (db) await db.release(); // Ensure release is awaited
  }
});

//Update Branch Details
router.put("/updateBranch/:id", async (req, res) => {
  const { id } = req.params;
  const { branch_name, region, address, lang, longitude, latitude, contact } = req.body;

  if (!branch_name || !region || !address || !lang || !longitude || !latitude || !contact) {
    return res.status(400).json({ message: "All fields are required" });
  }

  let db;
  try {
    db = await connectToDatabase();
    await db.query("UPDATE branch_details SET branch_name = ?, region_name = ?, address = ? WHERE branch_id = ? AND lang = ?", [branch_name, region, address, id, lang]);
    await db.query("UPDATE branch_coordinates SET longitude = ?, latitude = ? WHERE branch_id = ?", [longitude, latitude, id]);
    await db.query("UPDATE branch_contacts SET contact_number = ? WHERE branch_id = ?", [contact, id]);

    // Fetch updated details
    const [branchDetails] = await db.query("SELECT * FROM branch_details WHERE branch_id = ? AND lang = ?", [id, lang]);
    const [coordinates] = await db.query("SELECT latitude, longitude FROM branch_coordinates WHERE branch_id = ?", [id]);
    const [contacts] = await db.query("SELECT contact_number, picture FROM branch_contacts WHERE branch_id = ?", [id]);

    const mergedData = {
      ...branchDetails[0],
      latitude: coordinates[0]?.latitude || null,
      longitude: coordinates[0]?.longitude || null,
      contact_number: contacts[0]?.contact_number || null,
      picture: contacts[0]?.picture || null
    };

    res.json(mergedData);

  } catch (e) {
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (db && db.release) await db.release();
  }
});

//Add New Branch
router.post("/addBranch", async (req, res) => {
  const { branch_details } = req.body; // Array of objects with lang, branch_name, region, address

  if (!Array.isArray(branch_details) || branch_details.length !== 3) {
    return res.status(400).json({ message: "Provide branch details in all three languages (en, si, ta)" });
  }

  let db;
  try {
    db = await connectToDatabase();

    // Get the last branch_id and increment it
    const [lastBranch] = await db.query("SELECT MAX(branch_id) AS last_id FROM branch_details");
    const newBranchId = (lastBranch[0].last_id || 0) + 1;

    // Insert the branch details in 3 languages
    const values = branch_details.map(({ lang, branch_name, region, address }) => [newBranchId, branch_name, region, address, lang]);
    
    await db.query(
      "INSERT INTO branch_details (branch_id, branch_name, region_name, address, lang) VALUES ?", 
      [values]
    );

    res.status(201).json({ message: "Branch added successfully", branch_id: newBranchId });

  } catch (e) {
    console.error("Error adding new branch:", e.message);
    res.status(500).json({ message: "Internal Server Error" });

  } finally {
    if (db) await db.release();
  }
});

// Add branch coordinates
router.post("/addBranchCoordinates", async (req, res) => {
  const { branch_id, longitude, latitude } = req.body;
  if (!branch_id || !longitude || !latitude) {
    return res.status(400).json({ message: "branch_id, longitude, and latitude are required" });
  }
  let db;
  try {
    db = await connectToDatabase();
    await db.query(
      "INSERT INTO branch_coordinates (branch_id, longitude, latitude) VALUES (?, ?, ?)",
      [branch_id, longitude, latitude]
    );
    res.status(201).json({ message: "Coordinates added" });
  } catch (e) {
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (db && db.release) await db.release();
  }
});

// Add branch contact
router.post("/addBranchContact", async (req, res) => {
  const { branch_id, contact_number } = req.body;
  if (!branch_id || !contact_number) {
    return res.status(400).json({ message: "branch_id and contact_number are required" });
  }
  let db;
  try {
    db = await connectToDatabase();
    await db.query(
      "INSERT INTO branch_contacts (branch_id, contact_number) VALUES (?, ?)",
      [branch_id, contact_number]
    );
    res.status(201).json({ message: "Contact added" });
  } catch (e) {
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (db && db.release) await db.release();
  }
});

export default router;