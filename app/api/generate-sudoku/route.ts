import { NextResponse } from 'next/server';
import { SudokuGrid } from '@/types/sudoku';


import { solveSudoku } from '@/utils/sudokuSolver';
import { GoogleGenerativeAI } from '@google/generative-ai';
// Local Sudoku generator as fallback
const generateSudoku = (): SudokuGrid => {
  const grid: SudokuGrid = Array(9).fill(0).map(() => Array(9).fill(0));
  const fillGrid = (grid: SudokuGrid): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          const nums = Array.from({ length: 9 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
          for (const num of nums) {
            if (isValid(grid, row, col, num)) {
              grid[row][col] = num;
              if (fillGrid(grid)) return true;
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  const isValid = (grid: SudokuGrid, row: number, col: number, num: number): boolean => {
    for (let x = 0; x < 9; x++) if (grid[row][x] === num) return false;
    for (let x = 0; x < 9; x++) if (grid[x][col] === num) return false;
    const startRow = row - row % 3, startCol = col - col % 3;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
      if (grid[i + startRow][j + startCol] === num) return false;
    return true;
  };

  fillGrid(grid);
  // Remove some numbers to create a puzzle (medium difficulty)
  const cellsToRemove = 40; // Adjust for difficulty
  const positions = Array.from({ length: 81 }, (_, i) => i).sort(() => Math.random() - 0.5);
  for (let i = 0; i < cellsToRemove; i++) {
    const [row, col] = [Math.floor(positions[i] / 9), positions[i] % 9];
    grid[row][col] = 0;
  }
  return grid;
};

const parseSudokuString = (sudokuString: string): SudokuGrid | null => {
  const cleaned = sudokuString.replace(/\s/g, '').replace(/[^0-9]/g, '').trim();
  if (cleaned.length !== 81) return null;
  const grid: SudokuGrid = [];
  for (let i = 0; i < 9; i++) {
    const row = cleaned.substring(i * 9, (i + 1) * 9).split('').map(Number);
    if (row.some(n => n < 0 || n > 9)) return null;
    grid.push(row);
  }
  return grid;
};

export async function GET() {
  const maxAttempts = 3;
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!).getGenerativeModel({ model: "gemini-pro" });
      const prompt = "Generate a 9x9 Sudoku puzzle with a single unique solution and medium difficulty. Provide only a single line of exactly 81 characters, using 1-9 for clues and 0 for empty cells. No extra text, explanations, or formatting.";
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const grid = parseSudokuString(text);

      if (grid) {
        // Verify the grid has a unique solution (simplified check)
        const { solvedGrid } = solveSudoku(grid);
        if (solvedGrid) return NextResponse.json({ grid });
      }
      console.warn(`Attempt ${attempts + 1}: Gemini returned invalid Sudoku.`);
    } catch (error) {
      console.error(`Gemini API Error on attempt ${attempts + 1}:`, error);
    }
    attempts++;
  }

  // Fallback to local generator if Gemini fails
  console.log("Falling back to local Sudoku generator.");
  const fallbackGrid = generateSudoku();
  const { solvedGrid } = solveSudoku(fallbackGrid);
  if (solvedGrid) return NextResponse.json({ grid: fallbackGrid });
  
  return NextResponse.json({ error: "Failed to generate a valid puzzle." }, { status: 500 });
}