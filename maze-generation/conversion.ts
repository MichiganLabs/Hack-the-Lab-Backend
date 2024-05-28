import * as fs from 'fs';

export interface Maze {
  cells: Cell[];
  cheese: Coordinate[];
  exit: Coordinate;
  start: Coordinate;
  dimensions: Dimensions;
  openSquareCount: number;
}

export interface Row {
  cells: Cell[];
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface Dimensions {
  horizontal: number;
  vertical: number;
}

export interface Cell {
  coordinates: Coordinate;
  type: CellType;
  surroundings: Surroundings;
};

export interface Surroundings {
  north: CellType;
  south: CellType;
  west: CellType;
  east: CellType;
}

enum CellType {
  Open = "Open",
  Wall = "Wall",
  Cheese = "Cheese",
  Beginning = "Start",
  End = "Exit"
}

function getCellType(cellTypeString: string): CellType {
  switch(cellTypeString) {
    case "W": return CellType.Wall
    case "C": return CellType.Cheese
    case "B": return CellType.Beginning
    case "E": return CellType.End
    default: return CellType.Open
  }
}

function convertCsvToJson(csvFromGoogle: string) {
  let maze: Maze = {
    cells: [],
    cheese: [],
    exit: {
      x: 0,
      y: 0
    },
    start: {
      x: 0,
      y: 0
    },
    dimensions: {
      horizontal: 0,
      vertical: 0
    },
    openSquareCount: 0
  }

  let splitByNewLine = csvFromGoogle.split("\n")
  let rows: Row[] = splitByNewLine.map((row, rowIndex): Row => {
    let splitCellTypes = row.split(",")

    let cells: Cell[] = splitCellTypes.map((csvCell: string, cellIndex): Cell => {
      let cellType: CellType = getCellType(csvCell)

      switch(cellType) {
        case CellType.Beginning:
          maze.start = {
            x: cellIndex,
            y: rowIndex
          }
        case CellType.End:
          maze.exit = {
            x: cellIndex,
            y: rowIndex
          }
        case CellType.Cheese:
          maze.cheese.push({
            x: cellIndex,
            y: rowIndex
          })
        case CellType.Open:
          maze.openSquareCount++
        default:
      }

      return {
        coordinates: {
          x: cellIndex,
          y: rowIndex,
        },
        type: cellType,
        surroundings: {
          north: CellType.Open,
          south: CellType.Open,
          west: CellType.Open,
          east: CellType.Open
        }
      }
    });

    return {
      cells: cells
    }
  });

  maze.dimensions.horizontal = rows[0].cells.length
  maze.dimensions.vertical = rows.length

  let calculatedRows: Row[] = rows.map((row: Row, rowIndex): Row => {
    let calculatedCells: Cell[] = row.cells.map((cell: Cell, cellIndex): Cell => {
      var newCell: Cell = row.cells[cellIndex]
      // North
      // If most north row, assume wall to north
      if (rowIndex == 0) {
        newCell.surroundings.north = CellType.Wall;
      } else {
        newCell.surroundings.north = rows[rowIndex - 1].cells[cellIndex].type;
      }

      // South
      // If most south row, assume wall to south
      if (rowIndex == (rows.length - 1)) {
        cell.surroundings.south = CellType.Wall
      } else {
        cell.surroundings.south = rows[rowIndex + 1].cells[cellIndex].type == CellType.Wall ? CellType.Wall : CellType.Open
      }

      // West
      // If furthest west column, assume wall to the west
      if (cellIndex == 0) {
        cell.surroundings.west = CellType.Wall
      } else {
        cell.surroundings.west = row.cells[cellIndex - 1].type == CellType.Wall ? CellType.Wall : CellType.Open
      }

      // East
      // If furthest east column, assume wall to the east
      if (cellIndex == (row.cells.length - 1)) {
        cell.surroundings.east = CellType.Wall
      } else {
        cell.surroundings.east = row.cells[cellIndex + 1].type == CellType.Wall ? CellType.Wall : CellType.Open
      }

      return newCell
    });

    return {
      cells: calculatedCells
    }
  });

  calculatedRows.forEach((row: Row) => {
    maze.cells = maze.cells.concat(row.cells);
  });

  return JSON.stringify(maze)
}

async function convertFromUrl (csvUrl: string, mazeName: string) {
  try {
    const res = await fetch(csvUrl, {
        method: 'get',
        headers: { 'content-type': 'text/csv;charset=UTF-8' }
    });

    if (res.status === 200) {
      const data = await res.text();
      const result = convertCsvToJson(data);

      fs.writeFile(`./mazes/${mazeName}MazeJson.json`, result,  function(err) {
        if (err) {
          return console.error(err);
        }
        console.log(`File created for ${mazeName} Maze!`);
      });

    } else {
        console.log(`Error code ${res.status}`);
    }
  } catch (err) {
    console.log(`Error ${err}`);
  }
}

async function createMazes() {
  if (!fs.existsSync("mazes")){
      fs.mkdirSync("mazes");
  }

  // Probably want to make this into a list that loops but whatever for now
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=222529255&single=true&output=csv`, 
    "Straight"
  );
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=1730653816&single=true&output=csv`,
    "OneTurn"
  );
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=1271783319&single=true&output=csv`,
    "MultipleTurns"
  );
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=1310950333&single=true&output=csv`,
    "Loop"
  );
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=189555194&single=true&output=csv`,
    "DeadEnds"
  );
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=113265412&single=true&output=csv`,
    "Cheese"
  );
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=2081960952&single=true&output=csv`,
    "BasicOneSolution"
  );
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=1844403567&single=true&output=csv`,
    "MShape"
  );
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=1607378245&single=true&output=csv`,
    "DevicesShape"
  );
}

createMazes();