const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Cria um agente pai para uma instância ou organização
 */
async function createParentAgent(data) {
  const { name, persona, instanceId, organizationId, userId } = data;
  
  const parentAgent = await prisma.agent.create({
    data: {
      name,
      type: 'PAI',
      persona,
      instanceId,
      organizationId,
      isActive: true,
      priority: 0,
      config: {
        create: {
          maxTokens: 2000,
          temperature: 0.7,
          model: 'gemini-pro',
          systemPrompt: 'Você é um agente orquestrador que delega tarefas para agentes especializados.',
          fallbackMessage: 'Desculpe, não consegui processar sua solicitação no momento.'
        }
      }
    },
    include: {
      config: true,
      childAgents: true
    }
  });

  return parentAgent;
}

/**
 * Cria um agente filho baseado em um template
 */
async function createChildAgentFromTemplate(data) {
  const { name, templateId, instanceId, organizationId, parentAgentId, customPersona } = data;
  
  const template = await prisma.agentTemplate.findUnique({
    where: { id: templateId },
    include: { defaultTools: { include: { tool: true } } }
  });

  if (!template) {
    throw new Error('Template não encontrado');
  }

  const childAgent = await prisma.agent.create({
    data: {
      name,
      type: 'FILHO',
      persona: customPersona || template.defaultPersona,
      instanceId,
      organizationId,
      parentAgentId,
      templateId,
      isActive: true,
      priority: 1,
      config: {
        create: {
          maxTokens: 1500,
          temperature: 0.8,
          model: 'gemini-pro',
          systemPrompt: `Você é um agente especialista em ${template.category}.`,
          fallbackMessage: 'Não consegui processar sua solicitação nesta especialidade.'
        }
      }
    },
    include: {
      config: true,
      template: true
    }
  });

  // Adicionar ferramentas padrão do template
  for (const templateTool of template.defaultTools) {
    await prisma.agentTool.create({
      data: {
        agentId: childAgent.id,
        toolId: templateTool.toolId,
        config: templateTool.config,
        isActive: true
      }
    });
  }

  return childAgent;
}

/**
 * Cria um agente filho personalizado
 */
async function createCustomChildAgent(data) {
  const { name, persona, instanceId, organizationId, parentAgentId, toolIds = [] } = data;
  
  const childAgent = await prisma.agent.create({
    data: {
      name,
      type: 'FILHO',
      persona,
      instanceId,
      organizationId,
      parentAgentId,
      isActive: true,
      priority: 2,
      config: {
        create: {
          maxTokens: 1200,
          temperature: 0.9,
          model: 'gemini-pro',
          systemPrompt: 'Você é um agente especialista personalizado.',
          fallbackMessage: 'Não consegui processar sua solicitação personalizada.'
        }
      }
    },
    include: {
      config: true
    }
  });

  // Adicionar ferramentas específicas
  for (const toolId of toolIds) {
    await prisma.agentTool.create({
      data: {
        agentId: childAgent.id,
        toolId,
        isActive: true
      }
    });
  }

  return childAgent;
}

/**
 * Busca agentes filhos de um agente pai
 */
async function getChildAgents(parentAgentId) {
  return await prisma.agent.findMany({
    where: {
      parentAgentId,
      isActive: true
    },
    include: {
      tools: {
        include: {
          tool: true
        }
      },
      config: true,
      template: true
    },
    orderBy: {
      priority: 'asc'
    }
  });
}

/**
 * Busca o agente pai para uma instância/organização
 */
async function getParentAgent(instanceId, organizationId = null) {
  return await prisma.agent.findFirst({
    where: {
      instanceId,
      organizationId,
      type: 'PAI',
      isActive: true
    },
    include: {
      childAgents: {
        where: { isActive: true },
        include: {
          tools: {
            include: {
              tool: true
            }
          },
          config: true,
          template: true
        }
      },
      config: true
    }
  });
}

/**
 * Atualiza a prioridade de um agente filho
 */
async function updateAgentPriority(agentId, priority) {
  return await prisma.agent.update({
    where: { id: agentId },
    data: { priority }
  });
}

/**
 * Desativa um agente
 */
async function deactivateAgent(agentId) {
  return await prisma.agent.update({
    where: { id: agentId },
    data: { isActive: false }
  });
}

module.exports = {
  createParentAgent,
  createChildAgentFromTemplate,
  createCustomChildAgent,
  getChildAgents,
  getParentAgent,
  updateAgentPriority,
  deactivateAgent
};