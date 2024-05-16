import { Environment, Role } from "@enums";
import { MazeService } from "services";
import { ProblemDetailsError, asyncHandler, createError } from "utils";
import { query } from "utils/custom-validator";

export const mazesSchema = [query("env").optional().isEnvironment()];

/**
 * @swagger
 * /v1/mazes:
 *   get:
 *     tags: [Maze]
 *     summary: Returns a list of maze ids.
 *     responses:
 *       200:
 *         description: Fetch successful
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 example: "oneTurn"
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
    // By default, users will have their environment determined by their role.
    let envs = MazeService.getEnvironmentsForRole(req.user.role);

    // Admin users are allowed to select a specific environment when requesting the list of mazes.
    if (req.user.role == Role.Admin && req.query.env !== undefined) {
      envs = [req.query.env as Environment] ?? Object.values(Environment);
    }

    const mazes = await MazeService.getMazes(envs);

    const mazeList: string[] = Object.values(mazes).map(maze => maze.id);

    res.status(200).json(mazeList);
  } catch (e) {
    if (e instanceof ProblemDetailsError) throw e;
    console.error(e);
    throw createError(500, "Server Error", "An error occurred while trying to get mazes.");
  }
});

export default getMazes;
