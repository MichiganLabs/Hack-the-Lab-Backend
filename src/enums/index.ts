export enum Environment {
  Sandbox = "SANDBOX",
  Competition = "COMPETITION",
}

/**
 * components:
 *   schemas:
 *     Role:
 *       type: string
 *       enum: [PARTICIPANT, DEVELOPER, ADMIN]
 *       example: PARTICIPANT
 */
export enum Role {
  Participant = "PARTICIPANT",
  Developer = "DEVELOPER",
  Admin = "ADMIN",
}

/**
 * @swagger
 * components:
 *   schemas:
 *     CellType:
 *       type: string
 *       enum: [Open, Wall, Cheese, Start, Exit]
 *       example: Open
 */
export enum CellType {
  Open = "Open",
  Wall = "Wall",
  Cheese = "Cheese",
  Start = "Start",
  Exit = "Exit",
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Direction:
 *       type: string
 *       enum: [NORTH, EAST, SOUTH, WEST]
 *       example: NORTH
 */
export enum Direction {
  North = "NORTH",
  East = "EAST",
  South = "SOUTH",
  West = "WEST",
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ActionType:
 *       type: string
 *       enum: [MOVE, START, EAT, EXIT, SMELL, GRAB, DROP]
 *       example: MOVE
 */
export enum ActionType {
  Move = "MOVE",
  Start = "START",
  Eat = "EAT",
  Exit = "EXIT",
  Smell = "SMELL",
  Grab = "GRAB",
  Drop = "DROP",
}
