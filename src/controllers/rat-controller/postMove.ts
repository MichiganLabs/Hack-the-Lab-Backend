import { Direction } from "@enums";
import { RequestHandler } from "express";
import * as RatService from "services/rat-service";
import { body, matchedData, validationResult } from "utils/custom-validator";

/**
 * @swagger
 * components:
 *   schemas:
 *     MoveRequestBody:
 *       type: object
 *       properties:
 *         mazeId:
 *           type: string
 *           example: 1234
 *         direction:
 *           $ref: '#/components/schemas/Direction'
 */
interface MoveRequestBody {
  mazeId: string;
  direction: Direction;
}

// prettier-ignore
export const moveSchema = [
  body("mazeId").isString(),
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
const postMove: RequestHandler = async (req, res, next) => {
  // Validate the request body against `moveSchema`.
  const results = validationResult(req);

  // If there were request validation errors, return 400 with errors.
  if (!results.isEmpty()) {
    return res.status(400).json({ errors: results.array() });
  }

  const data = matchedData(req) as MoveRequestBody;

  // TODO: Verify `data.mazeId` is a valid maze ID. If not, return with error.

  try {
    // Attempt to move user's rat in mazeId with provided direction. If move fails, returns null.
    const moveResponse = await RatService.moveRat(req.user.id, data.mazeId, data.direction);

    res.status(200).json(moveResponse);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }

  next();
  return;
};

export default postMove;
