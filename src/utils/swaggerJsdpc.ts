import swaggerJsdoc from "swagger-jsdoc";

const getOpenapiSpecification = () => {
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
    apis: ["./src/controllers/**/*.ts", "./src/@types/**/*.d.ts", "./src/enums/**/*.ts"],
  };
  return swaggerJsdoc(options);
};

export default getOpenapiSpecification;
