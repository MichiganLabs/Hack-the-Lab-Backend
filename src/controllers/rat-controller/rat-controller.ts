import { Role } from "@enums";
import { Router } from "express";
import { ContextRunner } from "express-validator";
import {
  hasRole,
  mazeBodySchema,
  mazePathSchema,
  preActionMiddleware,
  ratControllerLocking,
  resolveMaze,
  validate,
} from "middleware/interceptors";
import { Controller } from "../index";
import getActions from "./getActions";
import getSurroundings from "./getSurroundings";
import postDrop from "./postDrop";
import postEat from "./postEat";
import postExit from "./postExit";
import postGrab from "./postGrab";
import postMove, { moveSchema } from "./postMove";
import postReset, { resetSchema } from "./postReset";
import postSmell from "./postSmell";

/**
 * @swagger
 * tags:
 *   - name: Rat
 *     description: Endpoints used to control a rat.
 *   - name: Rat (SANDBOX)
 *     description: Set of utility endpoints for rat management to be used in the sandbox environment.
 */
export class RatController implements Controller {
  initialize(router: Router): void {
    // Rat action endpoints, each of these endpoints has an action recorded for a rat.
    router.post("/rat/move", hasRole(Role.Participant), this.buildMiddlewareWithSchema([...mazeBodySchema, ...moveSchema]), postMove);
    router.post("/rat/smell", hasRole(Role.Participant), this.buildMiddlewareWithSchema(mazeBodySchema), postSmell);
    router.post("/rat/eat", hasRole(Role.Participant), this.buildMiddlewareWithSchema(mazeBodySchema), postEat);
    router.post("/rat/grab", hasRole(Role.Participant), this.buildMiddlewareWithSchema(mazeBodySchema), postGrab);
    router.post("/rat/drop", hasRole(Role.Participant), this.buildMiddlewareWithSchema(mazeBodySchema), postDrop);
    router.post("/rat/exit", hasRole(Role.Participant), this.buildMiddlewareWithSchema(mazeBodySchema), postExit);
    router.get("/rat/:mazeId/surroundings", hasRole(Role.Participant), this.buildMiddlewareWithSchema(mazePathSchema), getSurroundings);

    // Additional endpoints for rat control while in the SANDBOX environment.
    router.post(
      "/rat/reset",
      hasRole(Role.Developer),
      this.buildMiddlewareWithSchema([...mazeBodySchema, ...resetSchema], false),
      postReset,
    );
    router.get("/rat/:mazeId/actions", hasRole(Role.Developer), this.buildMiddlewareWithSchema(mazePathSchema, false), getActions);
  }

  buildMiddlewareWithSchema(schema: ContextRunner[], isAction = true) {
    const ratMiddleware = [];

    // Validate the mazeId and inject the `maze` object into the request.
    ratMiddleware.push(validate(schema), resolveMaze);

    // Prevent the same user (key) from performing an action while another action is being processed.
    ratMiddleware.push(ratControllerLocking);

    if (isAction) {
      // Initialize the maze (if necessary), inject the rat's current position into the request, and verify the rat hasn't exited the maze.
      ratMiddleware.push(preActionMiddleware);
    }

    return ratMiddleware;
  }
}
