import { RequestHandler } from "express";

/**
 * @swagger
 * /v1/rat/smell:
 *   post:
 *     tags: [Rat]
 *     summary: Rat smell
 *     responses:
 *       200:
 *         description: Smell successful
 */
const postSmell: RequestHandler = async (req, res, next) => {
  res.status(200).json({
    response: "smell successful.",
  });

  next();
  return;
};

export default postSmell;
