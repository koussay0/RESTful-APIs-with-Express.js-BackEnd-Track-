const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
const requestLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};
app.use(requestLogger);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Skills API is running!' });
});

// Enhanced get all skills with query parameters
app.get('/api/skills', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'skills.json'), 'utf8');
    let skills = JSON.parse(data);

    // Filter by proficiency if provided
    if (req.query.proficiency) {
      skills = skills.filter(skill =>
        skill.proficiency.toLowerCase() === req.query.proficiency.toLowerCase()
      );
    }

    // Filter by category if provided
    if (req.query.category) {
      skills = skills.filter(skill =>
        skill.category.toLowerCase().includes(req.query.category.toLowerCase())
      );
    }

    // Sort by name if requested
    if (req.query.sort === 'name') {
      skills.sort((a, b) => a.name.localeCompare(b.name));
    }

    res.json({
      success: true,
      count: skills.length,
      data: skills
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reading skills data',
      error: error.message
    });
  }
});

// Get single skill by ID
app.get('/api/skills/:id', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'skills.json'), 'utf8');
    const skills = JSON.parse(data);
    const skill = skills.find(s => s.id === parseInt(req.params.id));

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    res.json(skill);
  } catch (err) {
    console.error('Error reading skills.json:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get skills by category
app.get('/api/skills/category/:category', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'skills.json'), 'utf8');
    const skills = JSON.parse(data);

    const filteredSkills = skills.filter(skill =>
      skill.category.toLowerCase() === req.params.category.toLowerCase()
    );

    res.json({
      success: true,
      count: filteredSkills.length,
      data: filteredSkills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reading skills data',
      error: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
