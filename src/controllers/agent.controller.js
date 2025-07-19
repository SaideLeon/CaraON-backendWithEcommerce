const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { registry } = require('../docs/openapi');
const { 
    updateAgentPersonaSchema, 
    createParentAgentSchema, 
    createChildAgentFromTemplateSchema, 
    createCustomChildAgentSchema, 
    listChildAgentsSchema, 
    exportAgentAnalyticsSchema
} = require('../schemas/agent.schema');
const { z } = require('zod');
const agentHierarchyService = require('../services/agent.hierarchy.service');
const agentAnalyticsService = require('../services/agent.analytics.service');

registry.registerPath({
    method: 'patch',
    path: '/agents/{agentId}/persona',
    summary: 'Atualiza a persona de um agente existente',
    tags: ['Agents', 'Hierarchy'],
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({ agentId: z.string() }),
        body: {
            content: {
                'application/json': {
                    schema: updateAgentPersonaSchema.shape.body,
                },
            },
        },
    },
    responses: {
        200: { description: 'Persona do agente atualizada com sucesso' },
        404: { description: 'Agente não encontrado' },
        400: { description: 'Dados de entrada inválidos' },
    },
});

exports.updateAgentPersona = async (req, res) => {
    const { agentId } = req.params;
    const { persona } = req.body;

    try {
        const agent = await prisma.agent.update({
            where: { id: agentId },
            data: { persona },
        });
        res.status(200).json(agent);
    } catch (error) {
        if (error.code === 'P2025') { // Not Found error from Prisma
            return res.status(404).json({ error: 'Agente não encontrado.' });
        }
        res.status(500).json({ error: 'Falha ao atualizar a persona do agente.' });
    }
};

registry.registerPath({
    method: 'post',
    path: '/agents/parent/{instanceId}/{organizationId?}',
    summary: 'Cria um novo agente pai para uma instância ou organização',
    tags: ['Agents', 'Hierarchy'],
    security: [{ bearerAuth: [] }],
    request: {
        params: createParentAgentSchema.shape.params,
        body: {
            content: {
                'application/json': {
                    schema: createParentAgentSchema.shape.body,
                },
            },
        },
    },
    responses: {
        201: { description: 'Agente pai criado com sucesso' },
        404: { description: 'Instância não encontrada' },
    },
});

exports.createParentAgent = async (req, res) => {
    const { instanceId, organizationId } = req.params;
    const { name, persona } = req.body;
    const { userId } = req.user;

    try {
        const agent = await agentHierarchyService.createParentAgent({
            name,
            persona,
            instanceId,
            organizationId,
            userId,
        });
        res.status(201).json(agent);
    } catch (error) {
        console.error("Erro ao criar agente pai:", error);
        res.status(500).json({ error: 'Falha ao criar o agente pai.' });
    }
};

registry.registerPath({
    method: 'post',
    path: '/agents/child/from-template/{parentAgentId}',
    summary: 'Cria um novo agente filho a partir de um template',
    tags: ['Agents', 'Hierarchy'],
    security: [{ bearerAuth: [] }],
    request: {
        params: createChildAgentFromTemplateSchema.shape.params,
        body: {
            content: {
                'application/json': {
                    schema: createChildAgentFromTemplateSchema.shape.body,
                },
            },
        },
    },
    responses: {
        201: { description: 'Agente filho criado com sucesso' },
        404: { description: 'Agente pai ou Template não encontrado' },
    },
});

exports.createChildAgentFromTemplate = async (req, res) => {
    const { parentAgentId } = req.params;
    const { name, templateId, customPersona } = req.body;

    try {
        const parentAgent = await prisma.agent.findUnique({ where: { id: parentAgentId } });
        if (!parentAgent) {
            return res.status(404).json({ error: 'Agente pai não encontrado' });
        }

        const agent = await agentHierarchyService.createChildAgentFromTemplate({
            name,
            templateId,
            customPersona,
            parentAgentId,
            instanceId: parentAgent.instanceId,
            organizationId: parentAgent.organizationId,
        });
        res.status(201).json(agent);
    } catch (error) {
        console.error("Erro ao criar agente filho a partir de template:", error);
        res.status(500).json({ error: 'Falha ao criar o agente filho.' });
    }
};

registry.registerPath({
    method: 'post',
    path: '/agents/child/custom/{parentAgentId}',
    summary: 'Cria um novo agente filho customizado',
    tags: ['Agents', 'Hierarchy'],
    security: [{ bearerAuth: [] }],
    request: {
        params: createCustomChildAgentSchema.shape.params,
        body: {
            content: {
                'application/json': {
                    schema: createCustomChildAgentSchema.shape.body,
                },
            },
        },
    },
    responses: {
        201: { description: 'Agente filho customizado criado com sucesso' },
        404: { description: 'Agente pai não encontrado' },
    },
});

exports.createCustomChildAgent = async (req, res) => {
    const { parentAgentId } = req.params;
    const { name, persona, toolIds } = req.body;

    try {
        const parentAgent = await prisma.agent.findUnique({ where: { id: parentAgentId } });
        if (!parentAgent) {
            return res.status(404).json({ error: 'Agente pai não encontrado' });
        }

        const agent = await agentHierarchyService.createCustomChildAgent({
            name,
            persona,
            toolIds,
            parentAgentId,
            instanceId: parentAgent.instanceId,
            organizationId: parentAgent.organizationId,
        });
        res.status(201).json(agent);
    } catch (error) {
        console.error("Erro ao criar agente filho customizado:", error);
        res.status(500).json({ error: 'Falha ao criar o agente filho customizado.' });
    }
};


registry.registerPath({
    method: 'get',
    path: '/agents/child/{parentAgentId}',
    summary: 'Lista todos os agentes filhos de um agente pai',
    tags: ['Agents', 'Hierarchy'],
    security: [{ bearerAuth: [] }],
    request: {
        params: listChildAgentsSchema.shape.params,
    },
    responses: {
        200: {
            description: 'Lista de agentes filhos',
            content: {
                'application/json': {
                    schema: z.array(z.any()), // Definir um schema mais específico depois
                },
            },
        },
        404: { description: 'Agente pai não encontrado' },
    },
});

exports.listChildAgents = async (req, res) => {
    const { parentAgentId } = req.params;

    try {
        const agents = await agentHierarchyService.getChildAgents(parentAgentId);
        res.status(200).json(agents);
    } catch (error) {
        console.error("Erro ao listar agentes filhos:", error);
        res.status(500).json({ error: 'Falha ao listar os agentes filhos.' });
    }
};

registry.registerPath({
    method: 'get',
    path: '/agents/analytics/export',
    summary: 'Exporta um relatório de análise de otimização de agentes',
    tags: ['Agents', 'Analytics'],
    security: [{ bearerAuth: [] }],
    request: {
        query: exportAgentAnalyticsSchema.shape.query,
    },
    responses: {
        200: {
            description: 'Relatório de análise de otimização',
            content: {
                'application/json': {
                    schema: z.any(), // O schema do relatório pode ser complexo
                },
            },
        },
        404: { description: 'Instância não encontrada' },
    },
});

exports.exportAgentAnalytics = async (req, res) => {
    const { instanceId, organizationId } = req.query;

    try {
        const report = await agentAnalyticsService.generateOptimizationReport(instanceId, organizationId);
        res.status(200).json(report);
    } catch (error) {
        console.error("Erro ao exportar análise de agentes:", error);
        res.status(500).json({ error: 'Falha ao exportar a análise de agentes.' });
    }
};