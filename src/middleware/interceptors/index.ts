import { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";

export const interceptors: Array<
  (req: Request, res: Response, next: NextFunction) => void
> = [
  bodyParser.urlencoded({ extended: false }), // Enables URL-encoded parsing for the request body
  bodyParser.json(), // Enables JSON parsing for the request body

  (req, _res, next) => {
    req.claims = {};
    next(); // Passes the request to the next middleware
  },
  // We can insert additional interceptor functions here
];
