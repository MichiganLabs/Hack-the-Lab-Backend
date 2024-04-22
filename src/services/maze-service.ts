import { pgQuery } from "data/db";
import { Action } from "hackthelab";

export const getActions = async (userId: string, mazeId: string): Promise<Action[]> => {
  const res = await pgQuery("SELECT * FROM actions WHERE user_id = $1 AND maze_id = $2 ORDER BY time_ts DESC", [
    userId,
    mazeId,
  ]);
  return res;
};
