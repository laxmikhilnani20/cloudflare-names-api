import { Router } from 'itty-router';

// Create a new router
const router = Router();

// Define API key for authorization
const API_KEY = "I-xWjCZ7gWnZ85gqf0zuYf8KnOKdRBYOUjGZiOlS";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
};

// Handle CORS preflight requests
router.options('*', () => {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
});

// Middleware for API key validation
const validateApiKey = async (request, env) => {
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey || apiKey !== API_KEY) {
    return new Response('Unauthorized: Invalid API key', { 
      status: 401,
      headers: corsHeaders
    });
  }
};

// GET endpoint to return all names
router.get('/api/names', async (request, env) => {
  // Validate API key first
  const authCheck = await validateApiKey(request, env);
  if (authCheck) return authCheck;
  
  try {
    // Query D1 database to get all names
    const { results } = await env.NAMES_DB.prepare('SELECT * FROM names ORDER BY created_at DESC').all();
    return new Response(JSON.stringify({ success: true, names: results }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});

// POST endpoint to add a new name
router.post('/api/names', async (request, env) => {
  // Validate API key first
  const authCheck = await validateApiKey(request, env);
  if (authCheck) return authCheck;
  
  try {
    // Parse the request body
    const { name } = await request.json();
    
    if (!name || name.trim() === '') {
      return new Response(JSON.stringify({ success: false, error: 'Name is required and cannot be empty' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // Insert the name into the D1 database
    const result = await env.NAMES_DB.prepare('INSERT INTO names (name) VALUES (?)').bind(name.trim()).run();
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Name added successfully',
      id: result.meta.last_row_id
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});

// OpenAPI specification
const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Names API",
    description: "A simple API for storing and retrieving names using Cloudflare D1 database",
    version: "1.0.0"
  },
  servers: [
    {
      url: "https://names-api.lkhilnani.workers.dev",
      description: "Production server"
    },
    {
      url: "http://localhost:8787",
      description: "Local development server"
    }
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "X-API-Key"
      }
    },
    schemas: {
      Name: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "Unique identifier for the name"
          },
          name: {
            type: "string",
            description: "The stored name"
          },
          created_at: {
            type: "string",
            format: "date-time",
            description: "Timestamp when the name was created"
          }
        }
      },
      AddNameRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: {
            type: "string",
            description: "The name to store",
            example: "John Doe"
          }
        }
      },
      SuccessResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true
          },
          message: {
            type: "string",
            example: "Name added successfully"
          }
        }
      },
      NamesListResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true
          },
          names: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Name"
            }
          }
        }
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false
          },
          error: {
            type: "string",
            description: "Error message"
          }
        }
      }
    }
  },
  security: [
    {
      ApiKeyAuth: []
    }
  ],
  paths: {
    "/api/names": {
      get: {
        summary: "Get all names",
        description: "Retrieves all stored names from the database",
        security: [{ ApiKeyAuth: [] }],
        responses: {
          "200": {
            description: "Successfully retrieved names",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/NamesListResponse"
                }
              }
            }
          },
          "401": {
            description: "Unauthorized - Invalid API key",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          }
        }
      },
      post: {
        summary: "Add a new name",
        description: "Stores a new name in the database",
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AddNameRequest"
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Name added successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SuccessResponse"
                }
              }
            }
          },
          "400": {
            description: "Bad request - Name is required",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          },
          "401": {
            description: "Unauthorized - Invalid API key",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          }
        }
      }
    }
  }
};

// Serve OpenAPI specification
router.get('/openapi.json', () => {
  return new Response(JSON.stringify(openApiSpec, null, 2), {
    headers: { 
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
});

// Serve Swagger UI documentation
router.get('/docs', () => {
  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Names API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    <style>
      html {
        box-sizing: border-box;
        overflow: -moz-scrollbars-vertical;
        overflow-y: scroll;
      }
      *, *:before, *:after {
        box-sizing: inherit;
      }
      body {
        margin:0;
        background: #fafafa;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function() {
        const ui = SwaggerUIBundle({
          url: window.location.origin + '/openapi.json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: "StandaloneLayout",
          tryItOutEnabled: true,
          requestInterceptor: function(request) {
            request.headers['X-API-Key'] = 'I-xWjCZ7gWnZ85gqf0zuYf8KnOKdRBYOUjGZiOlS';
            return request;
          }
        });
      };
    </script>
  </body>
</html>
  `;
  return new Response(html, {
    headers: { 
      'Content-Type': 'text/html',
      ...corsHeaders
    }
  });
});

// Default route for testing
router.get('/', () => {
  return new Response('Names API is running! Visit /docs for interactive API documentation.', {
    headers: { 
      'Content-Type': 'text/plain',
      ...corsHeaders
    }
  });
});

// 404 for everything else
router.all('*', () => new Response('Not Found', { status: 404 }));

// Export worker handler
export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env);
  },
  
  // Execute the database migration during deployment
  async scheduled(event, env, ctx) {
    try {
      await env.NAMES_DB.prepare(`
        CREATE TABLE IF NOT EXISTS names (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
      console.log("Database migration completed successfully");
    } catch (error) {
      console.error("Database migration failed:", error);
    }
  }
};
