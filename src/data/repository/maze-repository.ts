import { AdminMaze } from "hackthelab";
import { pgQuery } from "../db";

export const getAll = async () => {
  return (await pgQuery("SELECT * FROM mazes", [])) as AdminMaze[];
};

export const updateLocked = async (mazeId: string, locked: boolean): Promise<void> => {
  await pgQuery("UPDATE mazes SET locked = $2 WHERE id = $1", [mazeId, locked]);
};
