import { Controller } from "../index";
import { Router } from "express";
import { hasRole } from "@middleware/interceptors";
import { Role } from "@enums";
import move from "./postMove";
import eat from "./postEat";
import smell from "./postSmell";
import exit from "./postExit";
import reset from "./postReset";

/**
 * @swagger
 * tags:
 *   name: Rat
 *   description: Rat management
 */
export class RatController implements Controller {
  initialize(router: Router): void {
    router.post("/rat/move", hasRole(Role.Participant), move);
    router.post("/rat/smell", hasRole(Role.Participant), smell);
    router.post("/rat/eat", hasRole(Role.Participant), eat);
    router.post("/rat/exit", hasRole(Role.Participant), exit);
    router.post("/rat/reset", hasRole(Role.Developer), reset);
  }
}
