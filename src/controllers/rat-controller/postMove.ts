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

export const moveSchema = [body("mazeId").isString(), body("direction").isDirection()];

/**
 * @swagger
 * /v1/rat/move:
 *   post:
 *     tags: [Rat]
 *     summary: Moves a rat in a direction for a specific maze
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
 *               $ref: '#/components/schemas/Surroundings'
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestResponse'
 *       409:
 *         description: Move unsuccessful.
 *       500:
 *         description: Internal server error.
 */
const postMove: RequestHandler = async (req, res, next) => {
  // Check to see if the request is valid.
  const errors = validationResult(req);

  // If there were request validation errors.
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const data = matchedData(req) as MoveRequestBody;

  // TODO: Verify `data.mazeId` is a valid maze ID. If not, return with error.

  try {
    const newCell = await RatService.moveRat(req.user.id, data.mazeId, data.direction);

    if (newCell == null) {
      res.sendStatus(409);
    } else {
      res.status(200).json(newCell);
    }
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }

  next();
  return;
};

export default postMove;
