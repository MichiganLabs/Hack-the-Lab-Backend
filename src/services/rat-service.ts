import { saveRatPositionToCache } from "@data";
import { ActionType, CellType, Direction } from "@enums";
import { pgQuery } from "data/db";
import { CellResponse, Coordinate, Maze } from "hackthelab";
import { MazeService } from "services";

export const moveRat = async (userId: number, maze: Maze, position: Coordinate, direction: Direction): Promise<CellResponse> => {

  // Keep track of whether the rat moved, or not.
  let didMove = false;

  let currentCell = MazeService.getCellAtPosition(maze, position);

  if (currentCell == undefined) {
    throw new Error("Cell does not exist in maze!");
  }

  // Do maze logic to check whether the rat can move in the maze.
  const { north, east, south, west } = currentCell.surroundings;

  switch (direction) {
    case Direction.North:
      if (north != CellType.Wall) {
        position.y -= 1;
        didMove = true;
      }
      break;
    case Direction.East:
      if (east != CellType.Wall) {
        position.x += 1;
        didMove = true;
      }
      break;
    case Direction.South:
      if (south != CellType.Wall) {
        position.y += 1;
        didMove = true;
      }
      break;
    case Direction.West:
      if (west != CellType.Wall) {
        position.x -= 1;
        didMove = true;
      }
      break;
  }

  currentCell = MazeService.getCellAtPosition(maze, position);

  if (didMove) {
    // If the rat moved, update the position
    await saveRatPositionToCache(userId, maze.id, position);
  }

  // Insert an action denoting the rat has moved.
  await insertAction(userId, maze.id, ActionType.Move, position, didMove);

  // Return type and surroundings based on where the rat is in the maze.
  return {
    success: didMove,
    type: currentCell.type,
    surroundings: currentCell.surroundings,
  };
};

// Helper method used to insert action record in the database.
export const insertAction = async (
  userId: number,
  mazeId: string,
  actionType: ActionType,
  position: Coordinate,
  success: boolean = true,
): Promise<any> => {
  await pgQuery("INSERT INTO actions (user_id, maze_id, action_type, position, success) VALUES ($1, $2, $3, $4, $5)", [
    userId,
    mazeId,
    actionType,
    position,
    success,
  ]);
};
