import path from 'node:path'
import url from 'node:url'

export default {
  path: '/docs',
  exclude: ['/swagger', '/docs'],

  // Propiedades requeridas por adonis-autoswagger
  tagIndex: 3,
  ignore: ['/'],
  snakeCase: false,

  common: {
    parameters: {},
    headers: {},
  },

  swagger: {
    enabled: true,
    uiEnabled: true,
    uiUrl: 'docs',
    specEnabled: true,
    specUrl: '/swagger.json',

    options: {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Factura Justa API',
          version: '1.0.0',
          description:
            'API REST para Factura Justa con autenticación tradicional (email/password) y social (Google OAuth). Incluye sistema de unificación de cuentas.',
          contact: {
            name: 'Equipo de Desarrollo Factura Justa',
            email: 'dev@facturajusta.com',
          },
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              description:
                'Token JWT obtenido al registrarse o iniciar sesión. Formato: Bearer {token}',
            },
          },
          schemas: {
            // Esquemas de Request
            RegisterRequest: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'usuario@example.com',
                  description: 'Correo electrónico del usuario',
                },
                password: {
                  type: 'string',
                  format: 'password',
                  minLength: 8,
                  example: 'MiPassword123!',
                  description: 'Contraseña (mínimo 8 caracteres)',
                },
                fullName: {
                  type: 'string',
                  minLength: 2,
                  example: 'Juan Pérez',
                  description: 'Nombre completo del usuario (opcional)',
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
                  example: 'usuario@example.com',
                  description: 'Correo electrónico del usuario',
                },
                password: {
                  type: 'string',
                  format: 'password',
                  example: 'MiPassword123!',
                  description: 'Contraseña del usuario',
                },
              },
            },
            // Esquemas de Response
            UserObject: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                  example: 1,
                  description: 'ID único del usuario',
                },
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'usuario@example.com',
                  description: 'Correo electrónico del usuario',
                },
                fullName: {
                  type: 'string',
                  example: 'Juan Pérez',
                  description: 'Nombre completo del usuario',
                },
                provider: {
                  type: 'string',
                  enum: ['local', 'google'],
                  example: 'local',
                  description: 'Proveedor de autenticación',
                },
                isActive: {
                  type: 'boolean',
                  example: true,
                  description: 'Estado de activación del usuario',
                },
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                  example: '2025-10-28T16:00:00.000Z',
                  description: 'Fecha de creación de la cuenta',
                },
              },
            },
            TokenObject: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  example: 'bearer',
                  description: 'Tipo de token',
                },
                value: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  description: 'Token JWT de acceso',
                },
                expiresAt: {
                  type: 'string',
                  format: 'date-time',
                  example: '2025-11-04T16:00:00.000Z',
                  description: 'Fecha de expiración del token (7 días)',
                },
              },
            },
            RegisterResponse: {
              type: 'object',
              properties: {
                mensaje: {
                  type: 'string',
                  example: 'Usuario registrado exitosamente',
                },
                usuario: {
                  $ref: '#/components/schemas/UserObject',
                },
                token: {
                  $ref: '#/components/schemas/TokenObject',
                },
              },
            },
            LoginResponse: {
              type: 'object',
              properties: {
                mensaje: {
                  type: 'string',
                  example: 'Inicio de sesión exitoso',
                },
                usuario: {
                  $ref: '#/components/schemas/UserObject',
                },
                token: {
                  $ref: '#/components/schemas/TokenObject',
                },
              },
            },
            LogoutResponse: {
              type: 'object',
              properties: {
                mensaje: {
                  type: 'string',
                  example: 'Sesión cerrada exitosamente',
                },
              },
            },
            MeResponse: {
              type: 'object',
              properties: {
                usuario: {
                  $ref: '#/components/schemas/UserObject',
                },
              },
            },
            ValidationError: {
              type: 'object',
              properties: {
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: {
                        type: 'string',
                        example: 'email',
                      },
                      message: {
                        type: 'string',
                        example: 'El email es inválido',
                      },
                      rule: {
                        type: 'string',
                        example: 'email',
                      },
                    },
                  },
                },
              },
            },
            ConflictError: {
              type: 'object',
              properties: {
                mensaje: {
                  type: 'string',
                  example: 'El correo electrónico ya está registrado',
                },
              },
            },
            UnauthorizedError: {
              type: 'object',
              properties: {
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Token de autenticación no proporcionado',
                      },
                    },
                  },
                },
              },
            },
            ForbiddenError: {
              type: 'object',
              properties: {
                mensaje: {
                  type: 'string',
                  example: 'Usuario inactivo',
                },
              },
            },
            GoogleAuthResponse: {
              type: 'object',
              properties: {
                mensaje: {
                  type: 'string',
                  example: 'Autenticación con Google exitosa',
                },
                usuario: {
                  $ref: '#/components/schemas/UserObject',
                },
                token: {
                  $ref: '#/components/schemas/TokenObject',
                },
              },
            },
            GoogleAuthError: {
              type: 'object',
              properties: {
                mensaje: {
                  type: 'string',
                  example: 'Error en la autenticación con Google',
                },
                error: {
                  type: 'string',
                  example: 'Usuario canceló el flujo de autenticación',
                },
              },
            },
          },
        },
        servers: [
          {
            url: 'http://localhost:3333',
            description: 'Servidor de Desarrollo',
          },
          {
            url: 'https://api.facturajusta.com',
            description: 'Servidor de Producción',
          },
        ],
        tags: [
          {
            name: 'Autenticación',
            description: 'Endpoints de autenticación tradicional y social',
          },
        ],
      },
    },
  },

  mode: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'RUNTIME',
  specFilePath: path.join(url.fileURLToPath(new URL('.', import.meta.url)), '../docs'),
}
