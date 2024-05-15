import { MazeRequest } from "hackthelab";
import { MazeService } from "services";
import { ProblemDetailsError, asyncHandler, createError } from "utils";
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

export const resolveMaze = asyncHandler(async (req, _res, next) => {
  const mazeRequest = req as MazeRequest;

  const { mazeId } = matchedData(req);

  try {
    const environments = MazeService.getEnvironmentsForRole(req.user.role);

    const maze = await MazeService.getMazeById(environments, mazeId);

    if (!maze) {
      throw createError(404, `Maze '${mazeId}' not found!`);
    }

    // Add the maze object to the request
    mazeRequest.maze = maze;

    // Move to the next middleware
    next();
  } catch (e) {
    if (e instanceof ProblemDetailsError) throw e;
    console.error(e);
    throw createError(500, `Error occurred while resolving maze.`);
  }
});
