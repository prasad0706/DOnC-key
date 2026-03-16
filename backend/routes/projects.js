const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Document = require('../models/Document');
const verifyToken = require('../middleware/auth');
const { validate, projectSchemas } = require('../middleware/validators');
const logger = require('../utils/logger');
const { NotFoundError } = require('../utils/errors');

// All project routes require authentication
router.use(verifyToken);

// GET /api/projects — List all projects for the current user
router.get('/', async (req, res, next) => {
  try {
    const projects = await Project.find({ userId: req.user.uid }).sort({ createdAt: -1 });

    const projectsWithCounts = await Promise.all(projects.map(async (project) => {
      const docCount = await Document.countDocuments({ projectId: project._id });
      return {
        ...project.toObject(),
        documentCount: docCount
      };
    }));

    res.json(projectsWithCounts);
  } catch (error) {
    next(error);
  }
});

// POST /api/projects — Create a new project
router.post('/', validate(projectSchemas.create), async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const project = new Project({
      name,
      description,
      userId: req.user.uid
    });

    await project.save();

    logger.info('Project created', { projectId: project._id, userId: req.user.uid });
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:id — Get a specific project with its documents
router.get('/:id', async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user.uid });
    if (!project) {
      throw new NotFoundError('Project');
    }

    const documents = await Document.find({ projectId: project._id }).sort({ createdAt: -1 });

    res.json({
      ...project.toObject(),
      documents
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/projects/:id — Delete a project and its documents
router.delete('/:id', async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
    if (!project) {
      throw new NotFoundError('Project');
    }

    // Delete associated documents
    const deleteResult = await Document.deleteMany({ projectId: req.params.id });

    logger.info('Project deleted', {
      projectId: req.params.id,
      documentsDeleted: deleteResult.deletedCount,
      userId: req.user.uid
    });

    res.json({ message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
