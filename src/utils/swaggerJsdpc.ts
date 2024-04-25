import swaggerJsdoc from "swagger-jsdoc";

const getOpenapiSpecification = () => {
  let apis = ["./controllers/**/*.js", "./@types/**/*.d.js", "./enums/**/*.js"];

  if ("development" === process.env.NODE_ENV) {
    apis = apis.map(api => api.replace("./", "./src/").replace(".js", ".ts"));
  }

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
