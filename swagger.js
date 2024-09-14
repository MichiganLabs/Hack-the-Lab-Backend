/* eslint-env node */
const swaggerJsdoc = require("swagger-jsdoc");
const fs = require("fs");

// When this script is run from the command line, the output will be written to this file.
const outputFile = "./dist/swagger.json";

exports.getOpenapiSpecification = additionalApis => {
  if (additionalApis == undefined) {
    additionalApis = [];
  }

  const apis = [
    "./src/controllers/**/*.ts",
    "./src/enums/**/*.ts",
    "./src/@types/**/*.d.ts",
    "./src/middleware/interceptors/**/*.ts",
    ...additionalApis,
  ];

  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Hack the Lab 2024 API",
        version: "1.0.0",
        description:
          "<a href='https://rb.gy/6xov18'>Hack The Lab (Details Handout)</a>.<br><a href='https://discord.gg/5sf8v4x3'>Join Hack the Lab Discord</a><br><a href='http://dash.milabs.xyz'>Hack-the-Lab Dashboard </a>",
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

if (require.main === module) {
  // File is being called directory, write the openapi spec.
  // const additionalApis = ["./src/controllers/**/*.ts"];
  const data = this.getOpenapiSpecification();
  fs.writeFile(outputFile, JSON.stringify(data), err => {
    if (err) {
      process.exit(5);
    }
  });
}
