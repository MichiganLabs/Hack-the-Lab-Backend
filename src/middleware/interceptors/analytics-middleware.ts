import { Interceptor } from "express";
import { insertInvocation } from "services/analytics-service";

export const analyticsMiddleware: Interceptor = async (req, res, next) => {
  try {
    next();
  } finally {
    // Get the mazeId if it exists in the request body or as a parameter
    const mazeId = req.params["mazeId"] ?? req.body["mazeId"];

    // Insert the invocation into the database
    await insertInvocation(req, mazeId, res);
  }
};
