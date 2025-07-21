function generateOpenApi(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup());
}

module.exports = {
  generateOpenApi,
};