const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // mentor
  title:      { type: String, required: true, trim: true },
  description:{ type: String, trim: true },
  type:       { type: String, enum: ['link', 'file'], required: true },
  url:        { type: String },        // for links
  fileName:   { type: String },        // for files
  fileType:   { type: String },        // pdf, doc, ppt etc
  subject:    { type: String, trim: true },
  forStudents:{ type: String, enum: ['all', 'specific'], default: 'all' },
  students:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // if specific
  createdAt:  { type: Date, default: Date.now },
});

module.exports = mongoose.model('Resource', resourceSchema);
