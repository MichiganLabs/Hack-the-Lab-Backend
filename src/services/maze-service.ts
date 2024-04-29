import { pgQuery } from "data/db";
import * as fs from "fs/promises";
import { Action, AdminCell, Coordinate, Maze } from "hackthelab";
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

export const getCellAtPosition = (maze: Maze, position: Coordinate): AdminCell => {
  const cols = maze.dimensions.horizontal;
  const index = position.y * cols + position.x;

  return maze.cells[index];
};

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

        let maze: Maze = JSON.parse(mazeData);
        maze.id = mazeId;

        mazes[mazeId] = maze;
      }
    }
  } catch (e) {
    console.error(e);
  }
};
