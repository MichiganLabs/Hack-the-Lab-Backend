import { MazeRequest } from "hackthelab";
import { MazeService } from "services";
import { body, matchedData, param } from "utils/custom-validator";

export const mazeBodySchema = [
  body("mazeId").isString().withMessage("'mazeId' must be included in the body of the request."),
];

// prettier-ignore
export const mazePathSchema = [
  param("mazeId").isMaze().withMessage("mazeId must be included in the path of the url request.")
]

export const resolveMaze = async (req: MazeRequest, res, next) => {
  const { mazeId } = matchedData(req);

  try {
    const maze = await MazeService.getMazeById(mazeId);

    if (!maze) {
      return res.status(404).json({ message: "Maze not found!" });
    }

    // Add the maze object to the request
    req.maze = maze;

    // Move to the next middleware
    next();
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
