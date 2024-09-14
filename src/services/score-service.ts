import { ActionType, Environment, Role } from "@enums";
import { pgQuery } from "data/db";
import { UserRepository } from "data/repository";
import { Action, AuthUser, Award, RankingResult, Score, User } from "hackthelab";
import { MazeService } from "services";

type AwardWithProps<P = unknown> = (P & { userId: number })[];

export const calculateScore = (actions: Action[]): number => {
  const EXIT_BONUS = 5000;
  const CHEESE_BONUS = 1000;
  const HARVEST_BONUS = 2500;
  const MOVE_PENALTY = 2;
  const ACTION_PENALTY = 1;

  // Get stats based on the rat's actions
  const numOfActions = actions.length;

  let numOfMoves = 0;
  let numOfCheeseEaten = 0;
  let numOfCheeseHarvested = 0;
  let didExit = false;

  actions.forEach(action => {
    if (action.success) {
      switch (action.actionType) {
        case ActionType.Move:
          numOfMoves++;
          break;
        case ActionType.Eat:
          numOfCheeseEaten++;
          break;
        case ActionType.Exit:
          didExit = true;
          break;
        case ActionType.Drop:
          numOfCheeseHarvested++;
          break;
      }
    }
  });

  // Calculate the score
  const exitBonus = didExit ? EXIT_BONUS : 0;
  const cheeseBonus = numOfCheeseEaten * CHEESE_BONUS;
  const harvestBonus = numOfCheeseHarvested * HARVEST_BONUS;
  const actionPenalty = numOfActions * ACTION_PENALTY;
  const movePenalty = numOfMoves * MOVE_PENALTY;

  const bonuses = exitBonus + cheeseBonus + harvestBonus;
  const penalties = actionPenalty + movePenalty;

  // Calculate the net score
  const netScore = bonuses - penalties;

  // Add up everything, but don't let the score go below 0.
  return Math.max(0, netScore);
};

// Returns the rankings for all participants for the given maze ids
export const getRankings = async (environment: Environment): Promise<RankingResult> => {
  // Get all mazes for the provided environment
  const mazes = await MazeService.getMazesForEnvironments([environment], true);
  const mazeIds = Object.keys(mazes);

  const reduceFunc = (acc: { [key: string]: User }, { id, name, role }: AuthUser) => {
    acc[id.toString()] = { id, name, role };
    return acc;
  };

  const participants = (await UserRepository.getUsersOfRole(Role.Participant)).filter(p => !p.disabled).reduce(reduceFunc, {});
  let scores: Score[] = [];

  // For each participant, calculate their score
  // Loop through all of the participants of the provided mazes
  for (const participant of Object.values(participants)) {
    let totalScore: number = 0;

    // Loop through each maze to determine the participant's score for each maze
    for (const mazeId of mazeIds) {
      const maze = mazes[mazeId];
      if (!maze) {
        continue;
      }

      const actions = await MazeService.getActions(participant.id, mazeId);
      const score = calculateScore(actions);

      totalScore += score;
    }

    scores.push({
      userName: participant.name,
      score: totalScore,
    });
  }

  scores = scores.sort((a, b) => b.score - a.score);

  const awards: Award[] = [];

  // Most moves (successful only)
  // -------------------------
  const mostMoves = await pgQuery<AwardWithProps<{ moveCount: number }>>(
    `
    SELECT user_id, COUNT(*) as move_count
    FROM actions
    WHERE maze_id = ANY($1) AND action_type = $2 AND success = true
    GROUP BY user_id
    ORDER BY move_count DESC
    `,
    [mazeIds, ActionType.Move],
  );

  const mostMovesAward: Award = {
    name: "World Traveler",
    description: "The rat who made the most moves",
    winners: [],
  };

  // *AWARD* Most Moves
  if (mostMoves.length > 0) {
    // Because the query is ordered by move_count DESC, the first item represents the most moves
    const maxMoveCount = mostMoves[0].moveCount;
    for (const result of mostMoves) {
      if (result.moveCount != maxMoveCount) {
        break;
      }

      mostMovesAward.winners.push({
        userName: participants[result.userId.toString()].name,
        value: result.moveCount,
      });
    }
    awards.push(mostMovesAward);
  }

  // Least moves and most completed mazes
  // -------------------------
  const leastMoves = await pgQuery<AwardWithProps<{ exitCount: string; moveCount: string }>>(
    `
    SELECT users.id as user_id,
           (SELECT COUNT(*) FROM actions WHERE user_id = users.id AND action_type = $1 AND success = TRUE)  AS exit_count,
           (SELECT COUNT(*) FROM actions WHERE user_id = users.id AND action_type = $2 AND success = TRUE) AS move_count
    FROM users
    WHERE role = $3
    ORDER BY exit_count DESC, move_count ASC
    LIMIT 1;
    `,
    [ActionType.Exit, ActionType.Move, Role.Participant],
  );

  const leastMovesAward: Award = {
    name: "Move Strategist",
    description: "The rat who made the least amount of moves and completed the most mazes",
    winners: [],
  };

  // *AWARD* Least Moves
  if (leastMoves.length > 0) {
    const result = leastMoves[0];

    leastMovesAward.winners.push({
      userName: participants[result.userId.toString()].name,
      value: result.exitCount,
    });

    awards.push(leastMovesAward);
  }

  // Most Cheese Eaten
  // -------------------------
  const cheeseEaten = await pgQuery<AwardWithProps<{ cheeseCount: number }>>(
    `
    SELECT user_id, COUNT(*) as cheese_count
    FROM actions
    WHERE maze_id = ANY($1) AND action_type = $2 AND success = true
    GROUP BY user_id
    ORDER BY cheese_count DESC
    `,
    [mazeIds, ActionType.Eat],
  );

  const mostCheeseEatenAward: Award = {
    name: "Cheese Hoarder",
    description: "The rat who ate the most cheese",
    winners: [],
  };

  const leastCheeseEatenAward: Award = {
    name: "Famished",
    description: "The rat who ate the least amount of cheese",
    winners: [],
  };

  // *AWARD* Most Cheese Eaten
  if (cheeseEaten.length > 0) {
    // Because the query is ordered by cheese_count DESC, the first item represents the most cheese eaten
    const maxCheeseCount = cheeseEaten[0].cheeseCount;
    for (const result of cheeseEaten) {
      if (result.cheeseCount != maxCheeseCount) {
        break;
      }

      mostCheeseEatenAward.winners.push({
        userName: participants[result.userId.toString()].name,
        value: result.cheeseCount,
      });
    }

    awards.push(mostCheeseEatenAward);

    const minCheeseCount = cheeseEaten[cheeseEaten.length - 1].cheeseCount;
    if (minCheeseCount !== maxCheeseCount) {
      for (const result of cheeseEaten.reverse()) {
        if (result.cheeseCount != minCheeseCount) {
          break;
        }

        leastCheeseEatenAward.winners.push({
          userName: participants[result.userId.toString()].name,
          value: result.cheeseCount,
        });
      }

      awards.push(leastCheeseEatenAward);
    }
  }

  // Most Cheese Eaten
  // -------------------------
  const cheeseDropped = await pgQuery<AwardWithProps<{ cheeseCount: number }>>(
    `
    SELECT user_id, COUNT(*) as cheese_count
    FROM actions
    WHERE maze_id = ANY($1) AND action_type = $2 AND success = true
    GROUP BY user_id
    ORDER BY cheese_count DESC
    `,
    [mazeIds, ActionType.Drop],
  );

  const mostCheeseDroppedAward: Award = {
    name: "Cheese Hoarder",
    description: "The rat who dropped the most cheese",
    winners: [],
  };

  // *AWARD* Most Cheese Eaten
  if (cheeseDropped.length > 0) {
    // Because the query is ordered by cheese_count DESC, the first item represents the most cheese eaten
    const maxCheeseCount = cheeseDropped[0].cheeseCount;
    for (const result of cheeseDropped) {
      if (result.cheeseCount != maxCheeseCount) {
        break;
      }

      mostCheeseDroppedAward.winners.push({
        userName: participants[result.userId.toString()].name,
        value: result.cheeseCount,
      });
    }

    awards.push(mostCheeseDroppedAward);
  }

  // Most smells
  // -------------------------
  const mostSmells = await pgQuery<AwardWithProps<{ smellCount: number }>>(
    `
    SELECT user_id, COUNT(*) as smell_count
    FROM actions
    WHERE maze_id = ANY($1) AND action_type = $2
    GROUP BY user_id
    ORDER BY smell_count DESC
    `,
    [mazeIds, ActionType.Smell],
  );

  const mostSmellsAward: Award = {
    name: "Nosiest",
    description: "The rat who smelled the most",
    winners: [],
  };

  // *AWARD* Most Smells
  if (mostSmells.length > 0) {
    // Because the query is ordered by smell_count DESC, the first item represents the most smells
    const maxSmellCount = mostSmells[0].smellCount;
    for (const result of mostSmells) {
      if (result.smellCount != maxSmellCount) {
        break;
      }

      mostSmellsAward.winners.push({
        userName: participants[result.userId.toString()].name,
        value: result.smellCount,
      });
    }
    awards.push(mostSmellsAward);
  }

  // Did not smell
  // -------------------------
  const noSmells = Object.values(participants).filter(participant => !mostSmells.some(item => item.userId === participant.id));
  const neverSmelledAward: Award = {
    name: "Nose Blind",
    description: "The rat who never used their nose",
    winners: [],
  };

  // *AWARD* Never using smell
  if (noSmells.length > 0) {
    neverSmelledAward.winners = noSmells.map(participant => ({
      userName: participant.name,
      value: 0,
    }));

    awards.push(neverSmelledAward);
  }

  // Ran into the most walls
  // -------------------------
  const wallsHit = await pgQuery<AwardWithProps<{ wallCount: number }>>(
    `
    SELECT user_id, COUNT(*) as wall_count
    FROM actions
    WHERE maze_id = ANY($1) AND action_type = $2 AND success = false
    GROUP BY user_id
    ORDER BY wall_count DESC
    `,
    [mazeIds, ActionType.Move],
  );

  const mostWallsHitAward: Award = {
    name: "Dazed",
    description: "The rat who ran into the most walls",
    winners: [],
  };

  // *AWARD* Most Walls Hit
  if (wallsHit.length > 0) {
    // Because the query is ordered by wall_count DESC, the first item represents the most walls hit
    const maxWallCount = wallsHit[0].wallCount;
    for (const result of wallsHit) {
      if (result.wallCount != maxWallCount) {
        break;
      }

      mostWallsHitAward.winners.push({
        userName: participants[result.userId.toString()].name,
        value: result.wallCount,
      });
    }
    awards.push(mostWallsHitAward);
  }

  // Revisited the same cell the most
  // -------------------------
  const mostRevisitedCell = await pgQuery<AwardWithProps<{ mazeId: string; position: string; revisitCount: number }>>(
    `
    SELECT user_id, maze_id, position::text, COUNT(*) as revisit_count
    FROM actions
    WHERE maze_id = ANY($1) AND action_type = $2 AND success = true
    GROUP BY user_id, maze_id, position::text
    HAVING COUNT(*) >= 2
    ORDER BY revisit_count DESC
    `,
    [mazeIds, ActionType.Move],
  );

  const mostRevisitedCellAward: Award = {
    name: "Favorite Spot",
    description: "The rat who revisited a single cell the most",
    winners: [],
  };

  // *AWARD* Most Revisited Cell
  if (mostRevisitedCell.length > 0) {
    // Because the query is ordered by revisit_count DESC, the first item represents the most revisited cell
    const maxRevisitCount = mostRevisitedCell[0].revisitCount;
    for (const result of mostRevisitedCell) {
      if (result.revisitCount != maxRevisitCount) {
        break;
      }

      mostRevisitedCellAward.winners.push({
        userName: participants[result.userId.toString()].name,
        value: result.revisitCount,
      });
    }
    awards.push(mostRevisitedCellAward);
  }

  // Most Revisited Cells
  // -------------------------
  const mostRevisitedCells = await pgQuery<AwardWithProps<{ cellsRevisited: number }>>(
    `
    SELECT user_id, count(user_id) as cells_revisited
    FROM (
      SELECT user_id, position::text, COUNT(*) as revisit_count
        FROM actions
        WHERE maze_id = ANY($1) AND action_type = $2 AND success = true
        GROUP BY position::text, user_id
        HAVING COUNT(*) >= 2
    ) subquery
    GROUP BY user_id
    ORDER BY cells_revisited DESC
    `,
    [mazeIds, ActionType.Move],
  );

  const mostRevisitedCellsAward: Award = {
    name: "Deja Vu",
    description: "The rat who revisited the most cells",
    winners: [],
  };

  // *AWARD* Most Revisited Cells
  if (mostRevisitedCells.length > 0) {
    // Because the query is ordered by cells_revisited DESC, the first item represents the most revisited cells
    const maxRevisitedCount = mostRevisitedCells[0].cellsRevisited;
    for (const result of mostRevisitedCells) {
      if (result.cellsRevisited != maxRevisitedCount) {
        break;
      }

      mostRevisitedCellsAward.winners.push({
        userName: participants[result.userId.toString()].name,
        value: result.cellsRevisited,
      });
    }
    awards.push(mostRevisitedCellsAward);
  }

  // Most failed actions
  // -------------------------
  const mostFailedActions = await pgQuery<AwardWithProps<{ failCount: number }>>(
    `
      SELECT 
        users.id as user_id,
        (SELECT COUNT(*) FROM actions WHERE user_id = users.id AND success = FALSE) AS fail_count
      FROM users
      WHERE role = $1
        AND disabled = FALSE
      ORDER BY fail_count DESC
      LIMIT 1;
    `,
    [Role.Participant],
  );

  const mostFailedActionsAward: Award = {
    name: "Clumsiest",
    description: "The rat who attempted actions that failed the most",
    winners: [],
  };

  // *AWARD* Most Failed Actions
  if (mostFailedActions.length > 0) {
    // Because the query is ordered by fail_count DESC, the first item represents the most failed actions
    const maxFailCount = mostFailedActions[0].failCount;
    for (const result of mostFailedActions) {
      if (result.failCount != maxFailCount) {
        break;
      }

      mostFailedActionsAward.winners.push({
        userName: participants[result.userId.toString()].name,
        value: result.failCount,
      });
    }
    awards.push(mostFailedActionsAward);
  }

  // Least failed actions while completing the most mazes
  // -------------------------
  const leastFailedActions = await pgQuery<AwardWithProps<{ exitCount: number; failedCount: number }>>(
    `
    WITH exit_counts AS (
      SELECT user_id, COUNT(*) as exit_count
      FROM actions
      WHERE maze_id = ANY($1) AND action_type = $2 AND success = true
      GROUP BY user_id
    ),
    failed_counts AS (
      SELECT user_id, COUNT(*) as failed_count
      FROM actions
      WHERE maze_id = ANY($1) AND success = false
      GROUP BY user_id
    )
    SELECT e.user_id, e.exit_count, m.failed_count
    FROM exit_counts e
    JOIN failed_counts m ON e.user_id = m.user_id
    WHERE e.exit_count = (SELECT MAX(exit_count) FROM exit_counts)
    AND m.failed_count = (SELECT MIN(failed_count) FROM failed_counts)
    ORDER BY e.exit_count DESC, m.failed_count ASC
    `,
    [mazeIds, ActionType.Exit],
  );

  const noFailedActionsAward: Award = {
    name: "Coordinated",
    description: "The rat who made the least amount of failed actions while completing the most mazes",
    winners: [],
  };

  // *AWARD* No Failed Actions
  if (leastFailedActions.length > 0) {
    noFailedActionsAward.winners = leastFailedActions.map(p => ({
      userName: participants[p.userId.toString()].name,
      value: p.failedCount,
    }));

    awards.push(noFailedActionsAward);
  }

  // Last to hit the API (Sandbox OR Competition)
  // -------------------------
  const lastToHitAPI = await pgQuery<AwardWithProps<{ lastHit: string }>>(
    `
      SELECT first_hits.user_id, first_hits.time_ts AS last_hit
      FROM (SELECT user_id, u.name AS name, MIN(time_ts) AS time_ts
            FROM analytics a
                    LEFT JOIN users u ON a.user_id = u.id
            WHERE role = $1
            GROUP BY user_id, name) first_hits
      ORDER BY first_hits.time_ts DESC
      LIMIT 1;
    `,
    [Role.Participant],
  );
  const lastToHitAPIAward: Award = {
    name: "Procrastinator",
    description: "The last rat to hit the API",
    winners: [],
  };

  // *AWARD* Last to hit the API
  if (lastToHitAPI.length > 0) {
    lastToHitAPIAward.winners.push({
      userName: participants[lastToHitAPI[0].userId.toString()].name,
      value: lastToHitAPI[0].lastHit,
    });
    awards.push(lastToHitAPIAward);
  }

  // Hit the API first (Sandbox OR Competition)
  // -------------------------
  const firstToHitAPI = await pgQuery<AwardWithProps<{ name: string; firstHit: string }>>(
    `
      SELECT user_id, u.name as name, MIN(time_ts) as first_hit
      FROM analytics a left join users u on u.id = a.user_id
      GROUP BY user_id, u.name
      ORDER BY first_hit ASC
      LIMIT 1
    `,
    [],
  );

  const firstToHitAPIAward: Award = {
    name: "Is This Thing On?",
    description: "The first rat to hit the API",
    winners: [],
  };

  // *AWARD* First to hit the API
  if (firstToHitAPI.length > 0) {
    firstToHitAPIAward.winners.push({
      userName: firstToHitAPI[0].name,
      value: firstToHitAPI[0].firstHit,
    });
    awards.push(firstToHitAPIAward);
  }

  // First to make a move in one of the competition mazes
  // -------------------------
  const firstToMove = await pgQuery<AwardWithProps<{ firstMove: string }>>(
    `
    SELECT user_id, MIN(time_ts) as first_move
    FROM actions
    WHERE maze_id = ANY($1) AND action_type = $2 AND success = true
    GROUP BY user_id
    ORDER BY first_move ASC
    LIMIT 1
    `,
    [mazeIds, ActionType.Move],
  );

  const firstToMoveAward: Award = {
    name: "Trail Blazer",
    description: "The first rat to make a move in one of the competition mazes",
    winners: [],
  };

  // *AWARD* First to make a move
  if (firstToMove.length > 0) {
    firstToMoveAward.winners.push({
      userName: participants[firstToMove[0].userId.toString()].name,
      value: firstToMove[0].firstMove,
    });
    awards.push(firstToMoveAward);
  }

  return { scores, awards };
};
