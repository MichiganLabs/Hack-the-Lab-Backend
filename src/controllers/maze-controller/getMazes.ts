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
 *     summary: Returns a list of mazes.
 *     description: Each maze has an ID, number of cheese count, and dimensions.
 *       Depending on the API key used (Sandbox or Competition) the respective list of mazes will be returned.
 *       <br><br>
 *       **Note:** The list of competition mazes will be limited until announced.
 *     responses:
 *       200:
 *         description: Maze list successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MazeResponse'
 *                 type: object
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

    const mazeList: MazeResponse[] = Object.entries(mazes).map(([mazeId, maze]) => {
      const mazeResponseObj: MazeResponse = {
        id: mazeId,
        dimensions: maze.dimensions,
        numberOfCheese: maze.cheese.length,
      };

      if (req.user.role == Role.Admin) {
        mazeResponseObj.locked = maze.locked;
      }

      return mazeResponseObj;
    });

    res.status(200).json(mazeList);
  } catch (e) {
    console.error(e);
    throw rethrowOrCreateError(e, 500, "Server Error", "An error occurred while trying to get mazes.");
  }
});

export default getMazes;
