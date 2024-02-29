const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Hack the Lab 2024 API",
    description:
      "Backend api servicing Michigan Lab's Hack the Lab 2024 Hackathon Event",
  },
  host: "localhost:3000",
};

const outputFile = "./swagger-spec.json";
const routes = ["src/middleware/controllers/**/*.ts"];

swaggerAutogen(outputFile, routes, doc);
