import { Role } from "@enums";
import { MazeService, UserService } from "services";
import { asyncHandler, rethrowOrCreateError } from "utils";
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
    const environments = UserService.getEnvironmentsForRequest(req);
    const includeLockedMazes = req.user.role == Role.Admin;
    const mazes = await MazeService.getMazesForEnvironments(environments, includeLockedMazes);
    const mazeList = Object.keys(mazes);

    res.status(200).json(mazeList);
  } catch (e) {
    console.error(e);
    throw rethrowOrCreateError(e, 500, "Server Error", "An error occurred while trying to get mazes.");
  }
});

export default getMazes;
