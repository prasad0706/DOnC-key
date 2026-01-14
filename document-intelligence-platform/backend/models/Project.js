const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        userId: {
            type: String,
            required: true,
            index: true // Index for faster queries by user
        }
    },
    {
        timestamps: true
    }
);

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
