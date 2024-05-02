import { Direction } from "@enums";
import { ActionResponse, RatActionRequest } from "hackthelab";
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
 *               $ref: '#/components/schemas/ActionResponse'
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
    const moveResult = await RatService.moveRat(req.user.id, req.maze, req.ratPosition, data.direction);

    // Get the current cell after the rat has moved.
    const cell = await RatService.getCellAtPosition(req.maze, req.ratPosition, req.user.id);

    const response: ActionResponse = {
      success: moveResult,
      cell,
    };

    res.status(200).json(response);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }

  next();
  return;
};

export default postMove;
