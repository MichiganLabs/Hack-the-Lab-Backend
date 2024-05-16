// https://datatracker.ietf.org/doc/html/rfc7807#section-3.1

import { ProblemDetailsError } from "utils";

export const exceptionMiddleware = (error: ProblemDetailsError, _req, res, _next) => {
  res
    .setHeader("Content-Type", "application/problem+json")
    .status(error.statusCode || 500)
    .send(
      JSON.stringify({
        // type: error.type,
        status: error.statusCode,
        title: error.title,
        detail: error.detail,
        ...error.additionalProperties,
      }),
    );
};
