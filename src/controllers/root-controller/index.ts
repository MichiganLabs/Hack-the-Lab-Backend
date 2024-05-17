import { RequestHandler, Router } from "express";
import { Controller } from "../index";
import getMe from "./getMe";

let counter: number = 1;

/**
 * @swagger
 * components:
 *   responses:
 *     Unauthorized:
 *       description: Unauthorized
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProblemDetailError'
 *           example:
 *             status: 401
 *             title: "Unauthorized"
 *             detail: "User is not authorized!"
 *     Forbidden:
 *       description: Forbidden
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProblemDetailError'
 *           example:
 *             status: 403
 *             title: "Forbidden"
 *             detail: "User is not authorized to access this resource."
 *     BadRequest:
 *       description: Bad Request
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BadRequestError'
 *           example:
 *             status: 400
 *             title: "Bad Request"
 *             detail: "One or more validation error occurred"
 *             errors:
 *               - type: "field"
 *                 msg: "Invalid value"
 *                 path: "mazeId"
 *                 location: "body"
 *
 *     ServerError:
 *       description: Internal Server Error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProblemDetailError'
 *           example:
 *             status: 500
 *             title: "Server Error"
 *             detail: "An internal server error occurred!"
 */

export class RootController implements Controller {
  initialize(router: Router): void {
    router.get("/", this.root.bind(this));

    router.get("/me", getMe);
  }

  private readonly root: RequestHandler = async (req, res, next) => {
    res.send({
      status: `API is working! Counter: ${counter++}`,
      name: req.user.name,
    });
    next();
  };
}
