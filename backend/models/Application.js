const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true
  },

  jobTitle: {
    type: String,
    required: true
  },

  location: {
    type: String
  },

  applicationDate: {
    type: String
  },

  interviewDate: {
    type: String
  },

  followUpDate: {
    type: String
  },

  jobLink: {
    type: String
  },

  status: {
    type: String,
    default: "Applied"
  },

  priority: {
    type: String,
    default: "Medium"
  },

  jobDescription: {
    type: String,
    default: ""
  },

  interviewPrep: {
    type: String,
    default: ""
  },

  timeline: {
    type: [
      {
        action: {
          type: String
        },
        date: {
          type: Date,
          default: Date.now
        }
      }
    ],
    default: []
  },

  notes: {
    type: String
  }
});

module.exports = mongoose.model("Application", applicationSchema);