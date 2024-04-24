import { RequestHandler, Router } from "express";
import { Controller } from "../index";

let counter: number = 1;

/**
 * @swagger
 * components:
 *   schemas:
 *     BadRequestResponse:
 *       type: array
 *       items:
 *         type: object
 *         properties:
 *           type:
 *             type: string
 *             example: field
 *           msg:
 *             type: string
 *             example: Maze Id is missing.
 *           path:
 *             type: string
 *             example: mazeId
 *           location:
 *             type: string
 *             example: body
 */
export class RootController implements Controller {
  initialize(router: Router): void {
    router.get("/", this.root.bind(this));
  }

  private readonly root: RequestHandler = async (req, res, next) => {
    res.send({
      status: `API is working! Counter: ${counter++}`,
      name: req.user.name,
    });
    next();
  };
}
