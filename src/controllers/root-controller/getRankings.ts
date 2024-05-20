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
 *     parameters:
 *       - in: query
 *         name: env
 *         schema:
 *           type: string
 *           example: "COMPETITION"
 *         required: true
 *         description: Name of the environment
 *     responses:
 *       200:
 *         description: Actions successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RankingResult'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
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
