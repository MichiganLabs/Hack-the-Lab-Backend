import { Controller } from "../index";
import { Router } from "express";
import move from "./move";

/**
 * @swagger
 * tags:
 *   name: Rat
 *   description: Rat management
 */
export class RatController implements Controller {
  initialize(router: Router): void {
    router.get("/rat/move", move);
  }
}
