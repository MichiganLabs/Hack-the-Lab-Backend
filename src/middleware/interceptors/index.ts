import { Interceptor } from "express";
import bodyParser from "body-parser";
import { authorize } from "./auth";

export const interceptors: Array<Interceptor> = [
  bodyParser.urlencoded({ extended: false }), // Enables URL-encoded parsing for the request body
  bodyParser.json(), // Enables JSON parsing for the request body

  // We can insert additional interceptor functions here
  authorize,
];

export { hasRole } from "./role-authorize";
