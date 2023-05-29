import { formatSolution, printCube, solve } from "./solver";

const INPUT_SEQUENCE = [3, 3, 3, 3, 2, 2, 2, 3, 3, 2, 2, 3, 2, 3, 2, 2, 3];

function main() {
  const solution = solve(INPUT_SEQUENCE.reverse(), 3);
  if (solution === null) {
    console.log("no solution found");
  } else {
    console.log(formatSolution(solution));
    printCube(solution);
  }
}

main();
