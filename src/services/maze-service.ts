import { pgQuery } from "data/db";
import * as fs from "fs/promises";
import { Action, AdminCell, Coordinate, Maze } from "hackthelab";
import path from "path";

const mazeDir = __dirname + "/mazes";
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
  return maze.cells.find(c => c.coordinates.x == position.x && c.coordinates.y == position.y);
};

export const mazeExists = async (mazeId: string): Promise<boolean> => (await getMazeById(mazeId)) !== undefined;

const loadMazes = async () => {
  try {
    const fileNames = await fs.readdir(mazeDir);
    for (const fileName of fileNames) {
      const mazeId = fileName.replace(".json", "");

      const mazeData = await fs.readFile(path.join(mazeDir, fileName), "utf8");

      const maze = JSON.parse(mazeData) as Maze;

      mazes[mazeId] = maze;
    }
  } catch (e) {
    console.error(e);
  }
};
