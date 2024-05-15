// https://datatracker.ietf.org/doc/html/rfc7807#section-3.1

export const exceptionMiddleware = (error, req, res, _next) => {
  console.log("Error status: ", error.status);
  console.log("Message: ", error.message);

  res
    .setHeader("Content-Type", "application/problem+json")
    .status(error.statusCode || 500)
    .send(
      JSON.stringify({
        type: error.type,
        title: error.title,
        status: error.statusCode,
        detail: error.detail,
      }),
    );
};
