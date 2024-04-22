import { Surroundings } from "hackthelab";
import { acquireLock, getRatPosition, releaseLock, setRatPosition } from "@data";
import { CellType, Direction } from "@enums";
import { pgQuery } from "data/db";

export const moveRat = async (userId: string, mazeId: string, direction: Direction): Promise<Surroundings | null> => {
    let lock = `lock-${userId}-${mazeId}`;

    await acquireLock(lock);

    var position = await getRatPosition(userId, mazeId);
    var prevPosition = position;

    if (!position) {
        // TODO: This should be the start of the maze.
        position = { x: 0, y: 0 };
    }

    console.log(`Rat is currently at (${position.x}, ${position.y})`);

    var didMove = true;

    // TODO: Do maze logic to check whether the rat can move and return cell data.
    switch (direction) {
        case Direction.North:
            position.y -= 1;
            break;
        case Direction.East:
            position.x += 1;
            break;
        case Direction.South:
            position.y += 1;
            break;
        case Direction.West:
            position.x -= 1;
            break;
    }

    let surroundings: Surroundings = null;

    if (didMove) {
        // If the rat moved, update the position
        await setRatPosition(userId, mazeId, position);

        // This insert could also be distributed through redis events to a
        // different process, to reduce response times.
        await pgQuery(
            "INSERT INTO actions (user_id, maze_id, prev, curr) VALUES ($1, $2, $3, $4)",
            [userId, mazeId, prevPosition, position]
        );

        surroundings = {
            originCell: CellType.Cheese,
            northCell: CellType.Open,
            eastCell: CellType.Exit,
            southCell: CellType.Open,
            westCell: CellType.Wall,
        };
    }

    releaseLock(lock);

    return surroundings;
};
