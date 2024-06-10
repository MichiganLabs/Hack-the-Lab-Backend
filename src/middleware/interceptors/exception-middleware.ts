// https://datatracker.ietf.org/doc/html/rfc7807#section-3.1

import { ProblemDetailsError } from "utils";

/**
 * @swagger
 * components:
 *   schemas:
 *     ProblemDetailError:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           example: 400
 *         title:
 *           type: string
 *         detail:
 *           type: string
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BadRequestError:
 *       allOf:
 *         - $ref: '#/components/schemas/ProblemDetailError'
 *         - type: object
 *           properties:
 *             errors:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: field
 *                   msg:
 *                     type: string
 *                     example: Maze Id is missing.
 *                   path:
 *                     type: string
 *                     example: mazeId
 *                   location:
 *                     type: string
 *                     example: body
 */
export const exceptionMiddleware = (error: ProblemDetailsError, _req, res, _next) => {
  console.log(error.stack);
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
