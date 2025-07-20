import { SudokuGrid } from '@/types/sudoku';

// Helper function to be used by both validator and solver
const isValidPlacement = (grid: SudokuGrid, row: number, col: number, num: number): boolean => {
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num || grid[x][col] === num) return false;
  }
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i + startRow][j + startCol] === num) return false;
    }
  }
  return true;
};

// --- New Validation Function ---
// This function checks the initial board for any rule violations.
export const validateInitialGrid = (grid: SudokuGrid): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const num = grid[row][col];
      if (num !== 0) {
        // Temporarily empty the cell to check if the number is valid against the rest of the grid
        grid[row][col] = 0;
        const isValid = isValidPlacement(grid, row, col, num);
        // Restore the number
        grid[row][col] = num;

        if (!isValid) {
          return false; // Found a duplicate
        }
      }
    }
  }
  return true; // The initial grid is valid
};


export const solveSudoku = (inputGrid: SudokuGrid): { solvedGrid: SudokuGrid | null; steps: string[] } => {
  const steps: string[] = [];
  const grid = inputGrid.map(row => [...row]);

  const solve = (grid: SudokuGrid): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValidPlacement(grid, row, col, num)) {
              grid[row][col] = num;
              steps.push(`Place ${num} at (${row + 1}, ${col + 1})`);
              if (solve(grid)) return true;
              grid[row][col] = 0;
              steps.push(`Backtrack: Remove ${num} from (${row + 1}, ${col + 1})`);
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  if (solve(grid)) {
    return { solvedGrid: grid, steps };
  }
  return { solvedGrid: null, steps };
};