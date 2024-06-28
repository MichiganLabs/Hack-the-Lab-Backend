import { ActionType, CellType, Direction } from "@enums";
import { ActionRepository, RatRepository } from "data/repository";
import { Cell, Coordinate, Maze } from "hackthelab";
import { MazeService } from "services";
import { dijkstra } from "utils";

export const moveRat = async (userId: number, maze: Maze, position: Coordinate, direction: Direction): Promise<boolean> => {
  // Keep track of whether the rat moved, or not.
  let didMove = false;

  const currentCell = await getCellAtPosition(maze, position, userId);
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
    await RatRepository.saveRatPositionToCache(userId, maze.id, position);
  }

  // Insert an action denoting the rat has moved.
  await insertAction(userId, maze.id, ActionType.Move, position, didMove);

  return didMove;
};

export const smell = async (userId: number, maze: Maze, position: Coordinate): Promise<number> => {
  const eatenCheese = await RatRepository.getEatenCheesePositions(userId, maze.id);

  // Get a list of uneaten cheese that is still in the maze.
  const uneatenCheese = maze.cheese.filter(cheese => !eatenCheese.some(eaten => eaten.x === cheese.x && eaten.y === cheese.y));

  // Calculates the distance to the closest uneaten cheese.
  // A rat has a smell radius of 10 cells. The distance is the number of steps to the nearest cheese.
  const radius = 10;
  const distance = dijkstra(maze, position, uneatenCheese, radius);

  // Insert an action denoting the rat has smelled.
  await insertAction(userId, maze.id, ActionType.Smell, position, true);

  // Return the distance.
  return distance;
};

export const eatCheese = async (userId: number, maze: Maze, position: Coordinate): Promise<boolean> => {
  const currentCell = await getCellAtPosition(maze, position, userId);
  if (currentCell == undefined) {
    throw new Error("Cell does not exist in maze!");
  }

  // Keep track of whether the rat moved, or not.
  const didEat = currentCell.type == CellType.Cheese;

  if (didEat) {
    // If the rat ate the cheese, update the cache.
    await RatRepository.saveEatenCheeseToCache(userId, maze.id, [position]);
  }

  // Insert an action denoting the rat attempted to eat.
  await insertAction(userId, maze.id, ActionType.Eat, position, didEat);

  return didEat;
};

// If `userId` is provided, checks the cell type/surroundings for cheese and updates the cell type/surrounds to Open if the user has eaten the cheese.
// If `userId` is not provided, returns the original cell.
export const getCellAtPosition = async (maze: Maze, ratPosition: Coordinate, userId: number): Promise<Cell> => {
  const editedCell = MazeService.getAdminCellAtPosition(maze, ratPosition);
  const { x: ratX, y: ratY } = ratPosition;

  const { north, east, south, west } = editedCell.surroundings;
  const cellTypes = [editedCell.type, north, east, south, west];

  // Only fetch the rat's eaten cheese if the current cell, or one of it's surroundings, is cheese.
  if (cellTypes.includes(CellType.Cheese)) {
    const eatenCheesePositions = await RatRepository.getEatenCheesePositions(userId, maze.id);

    // Update the cell type/surroundings to Open if the rat has eaten the cheese.
    for (const coord of eatenCheesePositions) {
      const dx = coord.x - ratX;
      const dy = coord.y - ratY;

      switch (true) {
        case dx === 0 && dy === 0:
          editedCell.type = CellType.Open;
          break;
        case dx === 0 && dy === -1:
          editedCell.surroundings.north = CellType.Open;
          break;
        case dx === 1 && dy === 0:
          editedCell.surroundings.east = CellType.Open;
          break;
        case dx === 0 && dy === 1:
          editedCell.surroundings.south = CellType.Open;
          break;
        case dx === -1 && dy === 0:
          editedCell.surroundings.west = CellType.Open;
          break;
      }
    }
  }

  // Intentionally remove the `coordinates` property from the AdminCell to return a Cell.
  delete editedCell.coordinates;

  return editedCell;
};

export const exitMaze = async (userId: number, maze: Maze, position: Coordinate): Promise<boolean> => {
  const currentCell = await getCellAtPosition(maze, position, userId);
  if (currentCell == undefined) {
    throw new Error("Cell does not exist in maze!");
  }

  // Keep track of whether the rat exited, or not.
  const didExit = currentCell.type == CellType.Exit;

  if (didExit) {
    // If the rat exited the maze, update the cache.
    await RatRepository.saveExitMazeToCache(userId, maze.id, didExit);
  }

  // Insert an action denoting the rat attempted to exit.
  await insertAction(userId, maze.id, ActionType.Exit, position, didExit);

  return didExit;
};

// Helper method used to insert action record in the database.
export const insertAction = async (
  userId: number,
  mazeId: string,
  actionType: ActionType,
  position: Coordinate,
  success: boolean = true,
): Promise<any> => {
  await ActionRepository.create(userId, mazeId, actionType, position, success);
};

// Retrieve the number of moves for a rat in a maze whether they are successful moves or not.
export const getNumOfMoves = (userId: number, mazeId: string): Promise<number> => {
  return ActionRepository.getMoveCount(userId, mazeId);
};

export const resetMaze = async (userId: number, mazeId: string): Promise<void> => {
  // Delete actions
  await ActionRepository.deleteForUserMaze(userId, mazeId);

  // Clear cache
  await RatRepository.clearRatPositionCache(userId, mazeId);
  await RatRepository.clearEatenCheeseCache(userId, mazeId);
  await RatRepository.clearExitMazeCache(userId, mazeId);
};
