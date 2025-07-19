const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createOrder = async (req, res) => {
    // Lógica para criar pedido
};

exports.listOrders = async (req, res) => {
    // Lógica para listar pedidos
};

exports.getOrderById = async (req, res) => {
    // Lógica para obter um pedido
};
