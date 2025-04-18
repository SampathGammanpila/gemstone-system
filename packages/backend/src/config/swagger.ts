import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './environment';

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Enhanced Gemstone System API',
    version: '1.0.0',
    description: 'API documentation for the Enhanced Gemstone System',
    license: {
      name: 'Private',
      url: 'https://your-website.com',
    },
    contact: {
      name: 'API Support',
      url: 'https://your-website.com/support',
      email: 'support@your-website.com',
    },
  },
  servers: [
    {
      url: `${config.nodeEnv === 'production' ? 'https://your-api-domain.com' : 'http://localhost:3000'}/api`,
      description: `${config.nodeEnv === 'production' ? 'Production' : 'Development'} server`,
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
    schemas: {
      User: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'User ID',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email',
          },
          first_name: {
            type: 'string',
            description: 'First name',
          },
          last_name: {
            type: 'string',
            description: 'Last name',
          },
          profile_image_url: {
            type: 'string',
            description: 'Profile image URL',
          },
          phone: {
            type: 'string',
            description: 'Phone number',
          },
          is_email_verified: {
            type: 'boolean',
            description: 'Email verification status',
          },
          is_active: {
            type: 'boolean',
            description: 'User active status',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Creation date',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'Last update date',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
          },
          password: {
            type: 'string',
            format: 'password',
          },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'confirm_password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
          },
          password: {
            type: 'string',
            format: 'password',
            minLength: 8,
          },
          confirm_password: {
            type: 'string',
            format: 'password',
          },
          first_name: {
            type: 'string',
          },
          last_name: {
            type: 'string',
          },
          phone: {
            type: 'string',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'error',
          },
          statusCode: {
            type: 'integer',
            example: 400,
          },
          message: {
            type: 'string',
            example: 'Error message',
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication information is missing or invalid',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  example: 'error',
                },
                message: {
                  type: 'string',
                  example: 'Validation failed',
                },
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: {
                        type: 'string',
                      },
                      message: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./src/api/routes/*.ts', './src/api/controllers/*.ts'],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;