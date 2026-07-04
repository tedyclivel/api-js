import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TEMA API Node.js',
      version: '1.0.0',
      description: 'API bancaire développée en Node.js/Express, reproduisant le comportement de l\'API Java Spring Boot.',
    },
    servers: [
      {
        url: 'https://api-js-78oe.onrender.com',
        description: 'Serveur de production (Render)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Emplacement de nos routes annotées
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};
