import { clearEatenCheeseCache, clearRatPositionCache, saveEatenCheeseToCache, saveRatPositionToCache } from "@data";
import { ActionType, CellType, Direction } from "@enums";
import { pgQuery } from "data/db";
import { Coordinate, Maze } from "hackthelab";
import { MazeService } from "services";

export const moveRat = async (userId: number, maze: Maze, position: Coordinate, direction: Direction): Promise<boolean> => {

  // Keep track of whether the rat moved, or not.
  let didMove = false;

  const currentCell = MazeService.getCellAtPosition(maze, position, userId);
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

  if (didMove) {
    // If the rat moved, update the position
    await saveRatPositionToCache(userId, maze.id, position);
  }

  // Insert an action denoting the rat has moved.
  await insertAction(userId, maze.id, ActionType.Move, position, didMove);

  return didMove;
};


export const eatCheese = async (userId: number, maze: Maze, position: Coordinate,): Promise<boolean> => {
  const currentCell = MazeService.getCellAtPosition(maze, position, userId);
  if (currentCell == undefined) {
    throw new Error("Cell does not exist in maze!");
  }

  // Keep track of whether the rat moved, or not.
  const didEat = currentCell.type == CellType.Cheese;

  if (didEat) {
    // If the rat ate the cheese, update the cache.
    await saveEatenCheeseToCache(userId, maze.id, position);
  }

  // Insert an action denoting the rat attempted to eat.
  await insertAction(userId, maze.id, ActionType.Eat, position, didEat);

  return didEat;
}

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

export const resetMaze = async (userId: number, mazeId: string): Promise<void> => {
  // Delete actions
  pgQuery("DELETE FROM actions WHERE user_id = $1 AND maze_id = $2", [userId, mazeId]);

  // Clear cache
  await clearRatPositionCache(userId, mazeId);
  await clearEatenCheeseCache(userId, mazeId);
};

