const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agent.controller');
const { validate } = require('../middlewares/validate.middleware');
const { createParentAgentSchema, createChildAgentFromTemplateSchema, createCustomChildAgentSchema, listChildAgentsSchema, updateAgentPersonaSchema } = require('../schemas/agent.schema');
const auth = require('../middlewares/auth.middleware');

// Rotas para Hierarquia de Agentes
router.post('/agents/parent/:instanceId/:organizationId?', auth, validate(createParentAgentSchema), agentController.createParentAgent);
router.post('/agents/child/from-template/:parentAgentId', auth, validate(createChildAgentFromTemplateSchema), agentController.createChildAgentFromTemplate);
router.post('/agents/child/custom/:parentAgentId', auth, validate(createCustomChildAgentSchema), agentController.createCustomChildAgent);
router.get('/agents/child/:parentAgentId', auth, validate(listChildAgentsSchema), agentController.listChildAgents);
router.patch('/agents/:agentId/persona', auth, validate(updateAgentPersonaSchema), agentController.updateAgentPersona);


module.exports = router;
