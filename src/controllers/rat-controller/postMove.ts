import { CellType, Direction } from "@enums";
import { RatActionRequest } from "hackthelab";
import { RatService } from "services";
import { body, matchedData } from "utils/custom-validator";

/**
 * @swagger
 * components:
 *   schemas:
 *     MoveRequestBody:
 *       type: object
 *       allOf:
 *         - $ref: '#/components/schemas/MazeRequestBodySchema'
 *       properties:
 *         direction:
 *           $ref: '#/components/schemas/Direction'
 */
interface MoveRequestBody {
  direction: Direction;
}

// prettier-ignore
export const moveSchema = [
  body("direction").isDirection()
];

/**
 * @swagger
 * /v1/rat/move:
 *   post:
 *     tags: [Rat]
 *     summary: Moves a rat in a direction for a specific maze.
 *     requestBody:
 *       description: Move request.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MoveRequestBody'
 *     responses:
 *       200:
 *         description: Move successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CellResponse'
 *       400:
 *         description: Invalid request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestResponse'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error.
 */
const postMove = async (req: RatActionRequest, res, next) => {
  const data = matchedData(req) as MoveRequestBody;

  try {
    // Attempt to move user's rat in mazeId with provided direction. If move fails, returns null.
    const moveResponse = await RatService.moveRat(req.user.id, req.maze, req.ratPosition, data.direction);

    // TODO: Get computed cell type and surroundings

    res.status(200).json({
      success: moveResponse,
      cell: {
        type: CellType.Open, // TODO: Get computed cell type
        surroundings: {
          north: CellType.Open, // TODO: Get computed cell type
          east: CellType.Open, // TODO: Get computed cell type
          south: CellType.Open, // TODO: Get computed cell type
          west: CellType.Open, // TODO: Get computed cell type
        },
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }

  next();
  return;
};

export default postMove;
