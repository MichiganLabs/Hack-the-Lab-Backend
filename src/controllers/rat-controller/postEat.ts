import { RequestHandler } from "express";

/**
 * @swagger
 * /v1/rat/eat:
 *   post:
 *     tags: [Rat]
 *     summary: Rat eat
 *     responses:
 *       200:
 *         description: Eat successful
 */
const postEat: RequestHandler = async (req, res, next) => {
  res.status(200).json({
    response: "eat successful.",
  });

  next();
  return;
};

export default postEat;
