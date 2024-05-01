import { CellType } from "@enums";
import { RatActionRequest } from "hackthelab";
import { RatService } from "services";

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
const postEat = async (req: RatActionRequest, res, next) => {

  try {
    // Attempt to move user's rat in mazeId with provided direction. If move fails, returns null.
    const eatResponse = await RatService.eatCheese(req.user.id, req.maze, req.ratPosition);

    // TODO: Get computed cell type and surroundings

    res.status(200).json({
      success: eatResponse,
      cell: {
        type: CellType.Open, // TODO: Get computed cell type
        surroundings: {
          north: CellType.Open, // TODO: Get computed cell type
          east: CellType.Open, // TODO: Get computed cell type
          south: CellType.Open, // TODO: Get computed cell type
          west: CellType.Open, // TODO: Get computed cell type
        },
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }

  next();
  return;
};

export default postEat;
