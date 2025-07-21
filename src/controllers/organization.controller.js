const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createOrganizationSchema, listOrganizationsSchema } = require('../schemas/organization.schema');
const { z } = require('zod');

exports.createOrganization = async (req, res) => {
    const { instanceId } = req.params;
    const { name } = req.body;

    try {
        const instance = await prisma.instance.findUnique({ where: { id: instanceId } });
        if (!instance) {
            return res.status(404).json({ error: 'Instância não encontrada' });
        }

        const organization = await prisma.organization.create({
            data: { name, instanceId },
        });

        res.status(201).json(organization);
    } catch (error) {
        res.status(500).json({ error: 'Falha ao criar a organização.' });
    }
};

exports.listOrganizations = async (req, res) => {
    const { instanceId } = req.params;

    try {
        const instance = await prisma.instance.findUnique({ where: { id: instanceId } });
        if (!instance) {
            return res.status(404).json({ error: 'Instância não encontrada' });
        }

        const organizations = await prisma.organization.findMany({
            where: { instanceId },
        });

        res.status(200).json(organizations);
    } catch (error) {
        res.status(500).json({ error: 'Falha ao listar as organizações.' });
    }
};
