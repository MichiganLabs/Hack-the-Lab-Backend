import { Role } from "@enums";
import { RequestHandler, Router } from "express";
import { hasRole } from "middleware/interceptors";
import { Controller } from "../index";
import getMe from "./getMe";
import getParticipants from "./getParticipants";
import getRankings from "./getRankings";

let counter: number = 1;

/**
 * @swagger
 * components:
 *   responses:
 *     Unauthorized:
 *       description: Request is unauthorized. Make sure to include your token in the `X-API-KEY` request header.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProblemDetailError'
 *           example:
 *             status: 401
 *             title: "Unauthorized"
 *             detail: "User is not authorized!"
 *     Forbidden:
 *       description: Forbidden. User is not authorized to access this resource.
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
 *       description: Internal Server Error. Contact the administrator if the problem persists.
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
    router.get("/rankings", hasRole(Role.Admin), getRankings);
    router.get("/participants", hasRole(Role.Admin), getParticipants);
  }

  private readonly root: RequestHandler = async (req, res, next) => {
    res.send({
      status: `API is working! Counter: ${counter++}`,
      name: req.user.name,
    });
    next();
  };
}
