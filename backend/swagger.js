const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MyShop API',
            version: '1.0.0',
            description: 'Complete e-commerce API documentation',
        },
        servers: [{ url: 'http://localhost:3000' }],
    },
    // Use wildcard to include all route files
    apis: [path.join(__dirname, 'routes', '*.js')],
};

let specs;
try {
    specs = swaggerJsdoc(options);
    console.log("📄 Parsed paths:", Object.keys(specs?.paths || {}));
    if (!specs || !specs.paths) throw new Error("Parser returned null");
} catch (error) {
    console.error("⚠️ Swagger Parsing Warning:", error.message);
    specs = { openapi: '3.0.0', info: { title: 'Docs Error', version: '1.0.0' }, paths: {} };
}

module.exports = { swaggerUi, specs };