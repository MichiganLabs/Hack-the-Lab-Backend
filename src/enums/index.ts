export enum Role {
    Participant = "participant",
    Developer = "developer",
    Admin = "admin"
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
    open = "OPEN",
    wall = "WALL",
    cheese = "CHEESE",
    entrance = "ENTRANCE",
    exit = "EXIT"
};
