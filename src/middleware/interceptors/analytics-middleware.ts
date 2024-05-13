import { Interceptor } from "express";
import { AnalyticsService } from "services";

export const analyticsMiddleware: Interceptor = async (req, res, next) => {
  try {
    next();
  } finally {
    // Insert the invocation into the database
    await AnalyticsService.insertInvocation(req, res);
  }
};
