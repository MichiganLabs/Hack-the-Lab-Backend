import { RootController } from "./root-controller";
import { Controller } from "./index";
import { MazeController } from "./maze-controller/maze-controller";

export const getControllers = (): Array<Controller> => [
  new RootController(),
  new MazeController(),
];
