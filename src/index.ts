import bodyParser from "body-parser";
import cors from "cors";
import express, { Express } from "express";
import http from "http";
import { exceptionMiddleware } from "middleware/interceptors";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { getControllers } from "./controllers/controllers";
import { interceptors } from "./middleware/interceptors";
import { myIPv4 } from "./utils/ipv4";
import { log } from "./utils/logger";

const app: Express = express();
const port = process.env.PORT || 8080;

const v1Router = express.Router();
v1Router.use(bodyParser.json());

// if (process.env.NODE_ENV === "development") {
const morgan = require("morgan");

app.use(morgan("dev"));
// }

for (let i = 0; i < interceptors.length; i++) {
  v1Router.use(interceptors[i]);
}

getControllers().forEach(controller => {
  controller.initialize(v1Router);
});

app.use(cors());

app.use("/v1", v1Router);

app.use(exceptionMiddleware);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(undefined, { swaggerOptions: { url: "/swagger.json", validatorUrl: null } }));

app.use("/swagger.json", (req, res) => {
  if (process.env.NODE_ENV === "development") {
    const additionalApis = ["./src/controllers/**/*.ts"];
    res.send(require("../swagger").getOpenapiSpecification(additionalApis));
  } else {
    res.sendFile("./swagger.json", { root: path.join(__dirname) });
  }
});

// Create an HTTP service
const httpServer = http.createServer(app);

httpServer.listen(port, () => {
  log(`⚡️ Server is running at http://${myIPv4()}:${port}/api-docs`);
});

process.on("SIGTSTP", () => {
  httpServer.close(() => {
    console.log(`Server closed. Port ${port} freed up.`);
    process.exit(0);
  });
});
