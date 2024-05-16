import bodyParser from "body-parser";
import { Interceptor } from "express";
import { analyticsMiddleware } from "./analytics-middleware";
import { authorize } from "./auth";

export const interceptors: Array<Interceptor> = [
  bodyParser.urlencoded({ extended: false }), // Enables URL-encoded parsing for the request body
  bodyParser.json(), // Enables JSON parsing for the request body

  // We can insert additional interceptor functions here
  authorize,

  // Record all invocations to the API
  analyticsMiddleware,
];

export { exceptionMiddleware } from "./exception-middleware";
export { mazeBodySchema, mazePathSchema, resolveMaze } from "./maze-middleware";
export { preActionMiddleware } from "./pre-action-middleware";
export { ratControllerLocking } from "./rat-controller-locking";

export { hasRole } from "./role-authorize";
export { validate } from "./validate";
