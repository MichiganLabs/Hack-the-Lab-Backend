import path, { dirname } from "path";
import swaggerJsdoc from "swagger-jsdoc";

const getOpenapiSpecification = () => {
  const rootDir = dirname(require.main.filename);

  let apis = ["./controllers/rat-controller/*.js", "./enums/**/*.js"];

  if ("development" === process.env.NODE_ENV) {
    apis = ["./controllers/**/*.ts", "./enums/**/*.ts", "./@types/**/*.d.ts"];
  }

  apis = apis.map(p => path.join(rootDir, p));

  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Hack the Lab 2024 API",
        version: "1.0.0",
      },
      security: [
        {
          apiKey: [],
        },
      ],
      components: {
        securitySchemes: {
          apiKey: {
            type: "apiKey",
            in: "header",
            name: "X-API-KEY",
          },
        },
      },
    },
    apis,
  };
  return swaggerJsdoc(options);
};

export default getOpenapiSpecification;
