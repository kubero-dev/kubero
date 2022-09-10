const swaggerAutogen = require('swagger-autogen')()

const doc = {
    info: {
      title: 'Kubero',
      description: 'Description',
    },
    host: 'localhost:3000',
    schemes: ['http'],
  };
  

swaggerAutogen('./swagger.json', ['./dist/routes.js'], doc);