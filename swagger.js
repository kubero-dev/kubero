const swaggerAutogen = require('swagger-autogen')({openapi: '3.0.0'})
// https://github.com/davibaltar/swagger-autogen
const doc = {
    info: {
      version: '1.5.0',
      title: 'Kubero',
      description: 'Kubero is a web-based tool deploy applications on a Kubernetes clusters. It provides a simple and intuitive interface to manage your clusters, applications, and pipelines.',
    },
    host: 'localhost:2000',
    basePath: '/api',
    schemes: ['http'],

    securityDefinitions: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      }
    }
  };

swaggerAutogen('./swagger.json', [
  './dist/routes/addons.js',
  './dist/routes/apps.js',
  './dist/routes/auth.js',
  './dist/routes/config.js',
  './dist/routes/logs.js',
  './dist/routes/pipelines.js',
  './dist/routes/repo.js',
  './dist/routes/settings.js',
], doc);