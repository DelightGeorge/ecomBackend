const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Grandeur E-commerce API Documentation",
      version: "1.0.0",
      description: "API documentation for my Grandeur E-commerce Backend",
    },
    servers: [
      {
        url: "https://ecombackend-6znk.onrender.com", // Change to your real server URL
      },
    ],
  },

  // Path where your route files are located
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };