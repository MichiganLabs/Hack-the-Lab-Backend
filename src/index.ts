import express, { Express } from "express";
import { log } from "./utils/logger";
import { interceptors } from "./middleware/interceptors";
import { myIPv4 } from "./utils/ipv4";
import { getControllers } from "./controllers/controllers";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import getOpenapiSpecification from "./utils/swaggerJsdpc";
import http from "http";

const app: Express = express();
const port = process.env.PORT || 8080;

const v1Router = express.Router();
v1Router.use(bodyParser.json());

for (let i = 0; i < interceptors.length; i++) {
  v1Router.use(interceptors[i]);
}

getControllers().forEach((controller) => {
  controller.initialize(v1Router);
});

app.use("/v1", v1Router);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(getOpenapiSpecification())
);

// Create an HTTP service
const httpServer = http.createServer(app);

httpServer.listen(port, () => {
  log(`⚡️ Server is running at http://${myIPv4()}:${port}/api-docs`);
});
