const Joi = require('joi');

/**
 * Creates an Express middleware that validates req[property] against a Joi schema.
 * @param {Joi.ObjectSchema} schema - Joi schema to validate against
 * @param {'body'|'params'|'query'} property - Request property to validate
 */
function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const message = error.details.map(d => d.message).join(', ');
      return res.status(400).json({ error: message });
    }

    // Replace with validated + sanitized values
    req[property] = value;
    next();
  };
}

// ─── Schemas ────────────────────────────────────────────────

const projectSchemas = {
  create: Joi.object({
    name: Joi.string().trim().min(1).max(100).required()
      .messages({ 'string.empty': 'Project name is required' }),
    description: Joi.string().trim().max(500).allow('', null)
  })
};

const documentSchemas = {
  upload: Joi.object({
    projectId: Joi.string().required()
      .messages({ 'any.required': 'Project ID is required. Please select or create a project.' })
  }),
  register: Joi.object({
    fileUrl: Joi.string().uri().required()
      .messages({ 'any.required': 'fileUrl is required' }),
    fileName: Joi.string().trim().max(255).allow('', null),
    fileType: Joi.string().trim().allow('', null),
    fileSize: Joi.number().integer().min(0).allow(null)
  })
};

const paramSchemas = {
  documentId: Joi.object({
    documentId: Joi.string().required()
  }),
  id: Joi.object({
    id: Joi.string().required()
  })
};

module.exports = {
  validate,
  projectSchemas,
  documentSchemas,
  paramSchemas
};
