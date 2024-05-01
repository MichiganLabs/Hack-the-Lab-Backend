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
 *       enum: [Open, Wall, Cheese, Entrance, Exit]
 *       example: Open
 */
export enum CellType {
  Open = "Open",
  Wall = "Wall",
  Cheese = "Cheese",
  Entrance = "Entrance",
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
 *       enum: [MOVE]
 *       example: NORTH
 */
export enum ActionType {
  Move = "MOVE",
  Start = "START",
}
