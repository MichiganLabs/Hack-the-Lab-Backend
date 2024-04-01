import { Controller } from "../index";
import { RequestHandler, Router } from "express";

let counter: number = 1;

export class RootController implements Controller {
  initialize(router: Router): void {
    router.get("/", this.root.bind(this));
  }

  private readonly root: RequestHandler = async (req, res, next) => {
    res.send({
      status: `API is working! Counter: ${counter++}`,
      name: req.auth.name
    });
    next();
  };
}
