import { ScoreService } from "services";

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
const getRankings = async (req, res, next) => {

    // TODO: Pass in mazes (sandbox / competition)
    const result = await ScoreService.getRankings(["oneTurn", "straightMaze"]);

    res.status(200).json(result);
    
    return next();
};

export default getRankings;