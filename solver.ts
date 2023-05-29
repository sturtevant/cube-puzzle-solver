export enum Direction {
  Forward = "F", // away from the solver (+x)
  Backward = "B", // towards the solver (-x)
  Left = "L",
  Right = "R",
  Up = "U",
  Down = "D",
}

const ALL_DIRECTIONS: Direction[] = Object.values(Direction);

export interface Step {
  id: number;
  direction: Direction;
  length: number;
}

interface Coordinate {
  x: number;
  y: number;
  z: number;
}

const ORIGIN: Coordinate = { x: 0, y: 0, z: 0 };

function areEqual(a: Coordinate, b: Coordinate) {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}

interface Cell {
  coordinate: Coordinate;
  step: Step;
}

type Cube = Cell[];

interface BoundingCube {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

const INITIAL_BOUNDING_CUBE: BoundingCube = {
  minX: 0,
  maxX: 0,
  minY: 0,
  maxY: 0,
  minZ: 0,
  maxZ: 0,
};

export type Solution = Step[];

function getNewPosition(position: Coordinate, direction: Direction) {
  switch (direction) {
    case Direction.Forward:
      return { ...position, x: position.x + 1 };
    case Direction.Backward:
      return { ...position, x: position.x - 1 };
    case Direction.Right:
      return { ...position, y: position.y + 1 };
    case Direction.Left:
      return { ...position, y: position.y - 1 };
    case Direction.Up:
      return { ...position, z: position.z + 1 };
    case Direction.Down:
      return { ...position, z: position.z - 1 };
  }
}

const addStep = (cube: Cube, step: Step): Cube => {
  const cells = [...cube];
  let position = cube.length === 0 ? ORIGIN : cube[cube.length - 1].coordinate;
  if (step.id === 1) cells.push({ coordinate: position, step });
  for (let i = 1; i < step.length; i++) {
    position = getNewPosition(position, step.direction);
    cells.push({ coordinate: position, step });
  }
  return cells;
};

const getBoundingCube = (cube: Cube): BoundingCube =>
  cube
    .map((cell) => cell.coordinate)
    .reduce(
      (bcube, { x, y, z }) => ({
        minX: Math.min(bcube.minX, x),
        maxX: Math.max(bcube.maxX, x),
        minY: Math.min(bcube.minY, y),
        maxY: Math.max(bcube.maxY, y),
        minZ: Math.min(bcube.minZ, z),
        maxZ: Math.max(bcube.maxZ, z),
      }),
      INITIAL_BOUNDING_CUBE
    );

export function printCube(solution: Solution) {
  const cube = getCube(solution);
  const bound = getBoundingCube(cube);
  for (let z = bound.minZ; z <= bound.maxZ; z++) {
    console.log(`=== layer ${z} ===`);
    for (let x = bound.maxX; x >= bound.minX; x--) {
      let row = "";
      for (let y = bound.minY; y <= bound.maxY; y++) {
        const current: Coordinate = { x, y, z };
        const cells = cube.filter((cell) => areEqual(cell.coordinate, current));
        const content = (() => {
          if (cells.length === 0) return "  ";
          if (cells.length === 1)
            return cells[0].step.id.toString().padStart(2);
          if (cells.length > 1) return "XX";
        })();
        row += `[${content}]`;
      }
      console.log(row);
    }
  }
}

export const formatSolution = (solution: Solution): string =>
  solution.map((step) => `${step.length}${step.direction}`).join("/");

const getCube = (solution: Solution): Cube => solution.reduce(addStep, []);

const getAllPossibleNextSteps = (length: number, id: number): Step[] =>
  ALL_DIRECTIONS.map((direction) => ({
    length,
    direction,
    id,
  }));

function isValid(solution: Solution, size: number) {
  const cube = getCube(solution);
  const bound = getBoundingCube(cube);
  if (bound.maxX - bound.minX >= size) return false;
  if (bound.maxY - bound.minY >= size) return false;
  if (bound.maxZ - bound.minZ >= size) return false;
  if (
    cube.some((a) =>
      cube.some((b) => a !== b && areEqual(a.coordinate, b.coordinate))
    )
  )
    return false;
  return true;
}

export function solve(input: number[], size: number): Solution | null {
  let solutions: Solution[] = [
    [{ direction: Direction.Forward, length: input[0], id: 1 }],
  ];
  let discovered: Set<string> = new Set<string>();
  while (solutions.length > 0) {
    let current = solutions.pop()!;
    let description = formatSolution(current);
    if (current.length === input.length) return current;
    if (!discovered.has(description)) {
      discovered.add(description);
      const last = current[current.length - 1];
      const length = input[last.id]; // next index = previous id (index + 1)
      const next = getAllPossibleNextSteps(length, last.id + 1)
        .map((step) => [...current, step])
        .filter((sol) => isValid(sol, size));
      solutions.push(...next);
    }
  }
  return null;
}
