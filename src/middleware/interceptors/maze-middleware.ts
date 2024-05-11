import { MazeRequest } from "hackthelab";
import { MazeService } from "services";
import { body, matchedData, param } from "utils/custom-validator";

/**
 * @swagger
 * components:
 *   schemas:
 *     MazeRequestBodySchema:
 *       properties:
 *         mazeId:
 *           type: string
 *           example: oneTurn
 *       required:
 *         - mazeId
 *
 */
export const mazeBodySchema = [
  body("mazeId").isString().withMessage("'mazeId' must be included in the body of the request."),
];

/**
 * @swagger
 * components:
 *   parameters:
 *     MazeRequestPathBase:
 *       in: path
 *       name: mazeId
 *       schema:
 *         type: string
 *       required: true
 *
 */
// prettier-ignore
export const mazePathSchema = [
  param("mazeId").isString().withMessage("mazeId must be included in the path of the url request.")
]

export const resolveMaze = async (req: MazeRequest, res, next) => {
  const { mazeId } = matchedData(req);

  try {
    const maze = await MazeService.getMazeById(req.user.role, mazeId);

    if (!maze) {
      return res.status(404).json({ message: "Maze not found!" });
    }

    // Add the maze object to the request
    req.maze = maze;

    // Move to the next middleware
    next();
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
