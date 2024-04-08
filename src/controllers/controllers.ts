import { RootController } from "./root-controller";
import { Controller } from "./index";
import { MazeController } from "./maze-controller/maze-controller";
import { RatController } from "./rat-controller/rat-controller";

export const getControllers = (): Array<Controller> => [
  new RootController(),
  new MazeController(),
  new RatController(),
];
