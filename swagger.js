const swaggerAutogen = require('swagger-autogen')()
// https://github.com/davibaltar/swagger-autogen
const doc = {
    info: {
      title: 'Kubero',
      description: 'Description',
    },
    host: 'localhost:3000',
    schemes: ['http'],
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