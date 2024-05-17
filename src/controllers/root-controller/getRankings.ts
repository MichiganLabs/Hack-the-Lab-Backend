import { Environment } from "@enums";
import { ScoreService } from "services";
import { asyncHandler, rethrowOrCreateError } from "utils";
import { query } from "utils/custom-validator";

export const environmentSchema = [query("env").isEnvironment()];

/**
 * @swagger
 * /v1/rankings:
 *   get:
 *     tags: [Root (ADMIN)]
 *     summary: Returns the rankings of all users
 *     responses:
 *       200:
 *         description: Request successful
 *       400:
 *         description: Invalid request body.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestResponse'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
const getRankings = asyncHandler(async (req, res) => {
  try {
    const environment = req.query.env as Environment;
    const result = await ScoreService.getRankings(environment);

    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    throw rethrowOrCreateError(e, 500, "Server Error", "An error occurred while trying to fetch rankings.");
  }
});

export default getRankings;
