const Resource = require('../models/Resource');
const User = require('../models/User');

// Mentor: create resource
exports.createResource = async (req, res) => {
  try {
    const { title, description, type, url, fileName, fileType, subject, forStudents, students } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    if (type === 'link' && !url) return res.status(400).json({ message: 'URL is required for link type' });

    const resource = new Resource({
      uploadedBy: req.user.id, title, description, type,
      url, fileName, fileType, subject,
      forStudents: forStudents || 'all',
      students: students || [],
    });
    await resource.save();
    res.status(201).json(resource);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Mentor: get all resources they uploaded
exports.getMentorResources = async (req, res) => {
  try {
    const resources = await Resource.find({ uploadedBy: req.user.id }).sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Mentor: delete resource
exports.deleteResource = async (req, res) => {
  try {
    await Resource.findOneAndDelete({ _id: req.params.id, uploadedBy: req.user.id });
    res.json({ message: 'Resource deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Student: get resources shared with them
exports.getStudentResources = async (req, res) => {
  try {
    const resources = await Resource.find({
      $or: [
        { forStudents: 'all' },
        { forStudents: 'specific', students: req.user.id }
      ]
    }).populate('uploadedBy', 'name').sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
