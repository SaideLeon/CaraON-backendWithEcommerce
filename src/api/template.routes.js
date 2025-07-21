const express = require('express');
const router = express.Router();
const templateController = require('../controllers/template.controller');
const { validate } = require('../middlewares/validate.middleware');
const { createTemplateSchema, updateTemplateSchema, templateIdParamSchema } = require('../schemas/template.schema');
const auth = require('../middlewares/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateTemplate:
 *       type: object
 *       description: Campos para atualizar um template. Todos são opcionais.
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         defaultPersona:
 *           type: string
 *         toolIds:
 *           type: array
 *           items:
 *             type: string
 * tags:
 *   name: Templates
 *   description: Gerenciamento de templates (moldes) de agentes.
 */

/**
 * @swagger
 * /api/v1/templates:
 *   post:
 *     summary: Cria um novo template de agente personalizado
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               defaultPersona:
 *                 type: string
 *               toolIds:
 *                 type: array
 *                 items:
 *                   type: string
 *           example:
 *             name: "Analisador de Sentimento"
 *             description: "Um agente que analisa o sentimento de textos."
 *             category: "Análise de Texto"
 *             defaultPersona: "Você é um especialista em análise de sentimento. Sua função é classificar textos como positivo, negativo ou neutro."
 *             toolIds: []
 *     responses:
 *       201:
 *         description: Template criado com sucesso.
 *       401:
 *         description: Não autorizado.
 *       500:
 *         description: Falha ao criar o template.
 */
router.post('/', auth, validate(createTemplateSchema), templateController.createTemplate);

/**
 * @swagger
 * /api/v1/templates:
 *   get:
 *     summary: Lista todos os templates disponíveis (do sistema e do usuário)
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de templates.
 *       401:
 *         description: Não autorizado.
 *       500:
 *         description: Falha ao listar os templates.
 */
router.get('/', auth, templateController.getTemplates);

/**
 * @swagger
 * /api/v1/templates/{templateId}:
 *   get:
 *     summary: Obtém um template específico pelo ID
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template retornado com sucesso.
 *       401:
 *         description: Não autorizado.
 *       404:
 *         description: Template não encontrado.
 */
router.get('/:templateId', auth, validate(templateIdParamSchema), templateController.getTemplateById);

/**
 * @swagger
 * /api/v1/templates/{templateId}:
 *   put:
 *     summary: Atualiza um template personalizado existente
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTemplate'
 *           examples:
 *             update_persona:
 *               summary: Atualizando a Persona
 *               value:
 *                 defaultPersona: "Você é um especialista em análise de sentimento. Sua função é classificar textos como positivo, negativo ou neutro. Seja sempre formal e direto."
 *             add_tool:
 *               summary: Adicionando uma Ferramenta
 *               value:
 *                 toolIds: ["id_da_ferramenta_1", "id_da_nova_ferramenta_3"]
 *     responses:
 *       200:
 *         description: Template atualizado com sucesso.
 *       401:
 *         description: Não autorizado.
 *       404:
 *         description: Template não encontrado.
 *       500:
 *         description: Falha ao atualizar o template.
 */
router.put('/:templateId', auth, validate(updateTemplateSchema), templateController.updateTemplate);

/**
 * @swagger
 * /api/v1/templates/{templateId}:
 *   delete:
 *     summary: Deleta um template personalizado
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Template deletado com sucesso.
 *       400:
 *         description: Requisição inválida (ex: template em uso).
 *       401:
 *         description: Não autorizado.
 *       404:
 *         description: Template não encontrado.
 */
router.delete('/:templateId', auth, validate(templateIdParamSchema), templateController.deleteTemplate);

module.exports = router;
