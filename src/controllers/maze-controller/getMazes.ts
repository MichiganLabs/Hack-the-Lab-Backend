import { Role } from "@enums";
import { MazeResponse } from "hackthelab";
import { MazeService, UserService } from "services";
import { asyncHandler, rethrowOrCreateError } from "utils";
import { query } from "utils/custom-validator";

export const mazesSchema = [query("env").optional().isEnvironment()];

/**
 * @swagger
 * /v1/mazes:
 *   get:
 *     tags: [Maze]
 *     summary: Returns a list of available maze IDs.
 *     responses:
 *       200:
 *         description: Fetch successful
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MazeResponse'
 *                 type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
const getMazes = asyncHandler(async (req, res) => {
  try {
    const environments = UserService.getEnvironmentsForRequest(req);
    const includeLockedMazes = req.user.role == Role.Admin;
    const mazes = await MazeService.getMazesForEnvironments(environments, includeLockedMazes);

    const mazeList: MazeResponse[] = Object.entries(mazes).map(([mazeId, maze]) => ({
      id: mazeId,
      dimensions: maze.dimensions,
      numberOfCheese: maze.cheese.length,
    }));

    res.status(200).json(mazeList);
  } catch (e) {
    console.error(e);
    throw rethrowOrCreateError(e, 500, "Server Error", "An error occurred while trying to get mazes.");
  }
});

export default getMazes;
