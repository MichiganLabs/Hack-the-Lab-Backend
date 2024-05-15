import onFinished from "on-finished";
import { AnalyticsService } from "services";
import { asyncHandler } from "utils";

export const analyticsMiddleware = asyncHandler(async (req, res, next) => {
  try {
    next();
  } finally {
    onFinished(res, async () => {
      // Insert the invocation into the database
      await AnalyticsService.insertInvocation(req, res);
    });
  }
});
