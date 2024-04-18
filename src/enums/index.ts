export enum Role {
    Participant = "PARTICIPANT",
    Developer = "DEVELOPER",
    Admin = "ADMIN"
};

/**
 * @swagger
 * components:
 *   schemas:
 *     CellType:
 *       type: string
 *       enum: [open, wall, cheese, entrance, exit]
 *       example: open
 */
export enum CellType {
    Open = "OPEN",
    Wall = "WALL",
    Cheese = "CHEESE",
    Entrance = "ENTRANCE",
    Exit = "EXIT"
};
