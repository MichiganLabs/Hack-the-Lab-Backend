import { RequestHandler } from "express";
import { ContextRunner } from "express-validator";
import { MazeService } from "services";
import { body, matchedData } from "utils/custom-validator";

export const validateMazeId: RequestHandler = async (req, res, next) => {
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

export const schemaWithMazeId = (validations: ContextRunner[]): ContextRunner[] => [
  body("mazeId").isMaze().withMessage("'mazeId' must be included in the body of the request."),
  ...validations,
];
