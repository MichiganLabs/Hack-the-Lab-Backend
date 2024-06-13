import { Environment } from "@enums";
import { ScoreService } from "services";
import { asyncHandler, rethrowOrCreateError } from "utils";

/**
 * @swagger
 * /v1/rankings:
 *   get:
 *     tags: [General (ADMIN)]
 *     summary: Returns the rankings of all users
 *     responses:
 *       200:
 *         description: Returns the score and ranking for all participants
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
    const result = await ScoreService.getRankings(Environment.Competition);

    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    throw rethrowOrCreateError(e, 500, "Server Error", "An error occurred while trying to fetch rankings.");
  }
});

export default getRankings;
