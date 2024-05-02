import { pgQuery } from "data/db";
import * as fs from "fs/promises";
import { Action, AdminCell, Cell, Coordinate, Maze } from "hackthelab";
import path from "path";

const mazeDir = __dirname + "/../mazes";
const mazes: { [key: string]: Maze } = {};

export const getActions = (userId: number, mazeId: string): Promise<Action[]> => {
  return pgQuery("SELECT * FROM actions WHERE user_id = $1 AND maze_id = $2 ORDER BY time_ts DESC", [userId, mazeId]);
};

export const getMazeById = async (mazeId: string): Promise<Maze | null> => {
  if (Object.keys(mazes).length == 0) {
    await loadMazes();
  }

  if (Object.hasOwnProperty.call(mazes, mazeId)) {
    return mazes[mazeId];
  }

  return undefined;
};

export const getAdminCellAtPosition = (maze: Maze, position: Coordinate): AdminCell => {
  const cols = maze.dimensions.horizontal;
  const index = position.y * cols + position.x;

  return maze.cells[index];
};

// If `userId` is provided, checks the cell type/surroundings for cheese and updates the cell type/surrounds to Open if the user has eaten the cheese.
// If `userId` is not provided, returns the original cell.
export const getCellAtPosition = (maze: Maze, position: Coordinate, userId: number | undefined): Cell => {
  const originalCell = getAdminCellAtPosition(maze, position);
  
  // TODO: Compute the 
  const editedCell = { ...originalCell };
  if (userId != undefined) {
    // If cell type (or surroundings) contains cheese, check if the user has eaten it.
    // If the user has eaten the cheese, change the cell type (and surroundings) to Open.
    // TODO: logic here...
  }

  // Intentionally remove the `coordinates` property from the AdminCell to return a Cell.
  delete editedCell.coordinates;
  
  return editedCell;
}

export const mazeExists = async (mazeId: string): Promise<boolean> => (await getMazeById(mazeId)) !== undefined;

const loadMazes = async () => {
  try {
    const fileNames = await fs.readdir(mazeDir);
    for (const fileName of fileNames) {
      if (!fileName.endsWith(".json")) {
        continue;
      }

      const mazeId = fileName.replace(".json", "");

      // Only load mazes that have not already been loaded.
      if (!Object.hasOwnProperty.call(mazes, mazeId)) {
        const mazeData = await fs.readFile(path.join(mazeDir, fileName), "utf8");

        const maze: Maze = JSON.parse(mazeData);
        maze.id = mazeId;

        mazes[mazeId] = maze;
      }
    }
  } catch (e) {
    console.error(e);
  }
};
