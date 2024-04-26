import { RequestHandler } from "express";
import { MazeService } from "services";
import { matchedData, param, validationResult } from "utils/custom-validator";

interface MazeRequestBody {
  mazeId: string;
}

// prettier-ignore
export const mazeSchema = [
  param("mazeId").isString().withMessage("'mazeId' must be included in the body of the request.")
]

/**
 * @swagger
 * /v1/maze/{mazeId}:
 *   get:
 *     tags: [Maze]
 *     summary: Returns a maze
 *     parameters:
 *       - in: path
 *         name: mazeId
 *         schema:
 *           type: string
 *         required: true
 *         description: Maze identifier.
 *     responses:
 *       200:
 *         description: Fetch successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Maze'
 */
const getMaze: RequestHandler = async (req, res, next) => {
  const results = validationResult(req);

  if (!results.isEmpty()) {
    return res.status(400).json({ errors: results.array() });
  }

  const data = matchedData(req) as MazeRequestBody;

  try {
    const maze = await MazeService.getMazeById(data.mazeId);

    if (maze == undefined) {
      res.sendStatus(404);
    } else {
      res.status(200).json(maze);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }

  next();
  return;
};

export default getMaze;
