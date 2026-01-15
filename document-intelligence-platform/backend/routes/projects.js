const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Document = require('../models/Document');
const verifyToken = require('../middleware/auth');

// Apply auth middleware to all project routes
router.use(verifyToken);

// GET /api/projects - Get all projects for the current user
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.user.uid }).sort({ createdAt: -1 });

        // Optional: Populate documents for each project (could be expensive if many docs)
        // For now, let's just return the projects. The frontend can fetch docs per project or we can aggregate.
        // Let's attach document count at least.
        const projectsWithCounts = await Promise.all(projects.map(async (project) => {
            const docCount = await Document.countDocuments({ projectId: project._id });
            return {
                ...project.toObject(),
                documentCount: docCount
            };
        }));

        res.json(projectsWithCounts);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// POST /api/projects - Create a new project
router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Project name is required' });
        }

        const project = new Project({
            name,
            description,
            userId: req.user.uid
        });

        await project.save();
        res.status(201).json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// GET /api/projects/:id - Get a specific project
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, userId: req.user.uid });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Get documents for this project
        const documents = await Document.find({ projectId: project._id }).sort({ createdAt: -1 });

        res.json({
            ...project.toObject(),
            documents
        });
    } catch (error) {
        console.error('Error fetching project details:', error);
        res.status(500).json({ error: 'Failed to fetch project details' });
    }
});

// DELETE /api/projects/:id - Delete a project
router.delete('/:id', async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Optional: Delete associated documents from DB (and maybe Storage?)
        // For now, let's just nullify the projectId or delete the doc records.
        // Deleting is safer for "private" projects.
        await Document.deleteMany({ projectId: req.params.id });

        res.json({ message: 'Project deleted' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

module.exports = router;
