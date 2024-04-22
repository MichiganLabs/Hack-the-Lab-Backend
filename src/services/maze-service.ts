import { pgQuery } from "data/db";
import { Action } from "hackthelab";

export const getActions = (userId: number, mazeId: string): Promise<Action[]> => {
  return pgQuery("SELECT * FROM actions WHERE user_id = $1 AND maze_id = $2 ORDER BY time_ts DESC", [userId, mazeId]);
};
