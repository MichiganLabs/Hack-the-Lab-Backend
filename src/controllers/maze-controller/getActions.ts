import { RequestHandler } from "express";
import { matchedData, validationResult } from "express-validator";
import * as MazeService from "services/maze-service";
import { body } from "utils/custom-validator";

/**
 * @swagger
 * components:
 *   schemas:
 *     ActionsRequestBody:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           example: 1234
 *         mazeId:
 *           type: string
 *           example: "prod-maze-2"
 */
interface ActionsRequestBody {
  userId: number;
  mazeId: string;
}

// prettier-ignore
export const actionsSchema = [
  body("userId").isNumeric().withMessage("'userId' must be included in the body of the request."),
  body("mazeId").isString().withMessage("'mazeId' must be included in the body of the request."),
];

/**
 * @swagger
 * /v1/maze/actions:
 *   get:
 *     tags: [Maze]
 *     summary: Returns a specific maze actions information for all rats
 *     requestBody:
 *       description: Actions request.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActionsRequestBody'
 *     responses:
 *       200:
 *         description: Actions successful
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Action'
 *       400:
 *         description: The request body is invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestResponse'
 *       401:
 *         description: Unauthorized. You must be authorized to access this endpoint.
 *       403:
 *         description: Forbidden. You do not have access to this resource.
 */
const getActions: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const data = matchedData(req) as ActionsRequestBody;

  try {
    const actions = await MazeService.getActions(data.userId, data.mazeId);

    res.status(200).json(actions);
  } catch (e) {
    console.error(e);
    res.sendStatus(500).json({ error: "Internal server error" });
  }

  next();
  return;
};

export default getActions;
