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
 *       enum: [OPEN, WALL, CHEESE, ENTRANCE, EXIT]
 *       example: OPEN
 */
export enum CellType {
  Open = "OPEN",
  Wall = "WALL",
  Cheese = "CHEESE",
  Entrance = "ENTRANCE",
  Exit = "EXIT",
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
