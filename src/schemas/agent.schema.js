const { z } = require('zod');

const updateAgentPersonaSchema = z.object({
    body: z.object({
        persona: z.string().min(10, 'A persona precisa ter no mínimo 10 caracteres.').openapi({ description: 'Nova persona do agente' }),
    }).openapi({ description: 'Dados para atualização da persona do agente' }),
    params: z.object({
        agentId: z.string().openapi({ description: 'ID do agente' }),
    })
});

const createParentAgentSchema = z.object({
    body: z.object({
        name: z.string().min(3, 'O nome do agente precisa ter no mínimo 3 caracteres.').openapi({ description: 'Nome do agente pai' }),
        persona: z.string().min(10, 'A persona precisa ter no mínimo 10 caracteres.').openapi({ description: 'Persona do agente pai orquestrador' }),
    }),
    params: z.object({
        instanceId: z.string().openapi({ description: 'ID da instância' }),
        organizationId: z.string().optional().openapi({ description: 'ID da organização (opcional)' }),
    }),
});

const createChildAgentFromTemplateSchema = z.object({
    body: z.object({
        name: z.string().min(3, 'O nome do agente precisa ter no mínimo 3 caracteres.').openapi({ description: 'Nome do agente filho' }),
        templateId: z.string().openapi({ description: 'ID do template de agente' }),
        customPersona: z.string().optional().openapi({ description: 'Persona customizada para o agente filho (sobrescreve a do template)' }),
    }),
    params: z.object({
        parentAgentId: z.string().openapi({ description: 'ID do agente pai' }),
    }),
});

const createCustomChildAgentSchema = z.object({
    body: z.object({
        name: z.string().min(3, 'O nome do agente precisa ter no mínimo 3 caracteres.').openapi({ description: 'Nome do agente filho' }),
        persona: z.string().min(10, 'A persona precisa ter no mínimo 10 caracteres.').openapi({ description: 'Persona do agente filho' }),
        toolIds: z.array(z.string()).optional().openapi({ description: 'Array de IDs das ferramentas a serem associadas' }),
    }),
    params: z.object({
        parentAgentId: z.string().openapi({ description: 'ID do agente pai' }),
    }),
});

const listChildAgentsSchema = z.object({
    params: z.object({
        parentAgentId: z.string().openapi({ description: 'ID do agente pai para listar os filhos' }),
    }),
});

const exportAgentAnalyticsSchema = z.object({
    query: z.object({
        instanceId: z.string().openapi({ description: 'ID da instância para exportar a análise' }),
        organizationId: z.string().optional().openapi({ description: 'ID da organização (opcional)' }),
    }),
});


module.exports = {
  updateAgentPersonaSchema,
  createParentAgentSchema,
  createChildAgentFromTemplateSchema,
  createCustomChildAgentSchema,
  listChildAgentsSchema,
  exportAgentAnalyticsSchema,
};