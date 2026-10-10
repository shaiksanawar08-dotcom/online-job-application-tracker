const express = require("express");
const Application = require("../models/Application");

const router = express.Router();

// Add a new application
router.post("/", async (req, res) => {
  try {
    const application = new Application(req.body);
    const savedApplication = await application.save();

    res.status(201).json(savedApplication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all applications
router.get("/", async (req, res) => {
  try {
    const applications = await Application.find();

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Update an application
router.put("/:id", async (req, res) => {
  try {
    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedApplication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Delete an application
router.delete("/:id", async (req, res) => {
  try {
    await Application.findByIdAndDelete(req.params.id);

    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;