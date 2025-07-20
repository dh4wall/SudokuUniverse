'use client';

import { useState, useCallback, useEffect } from 'react';
import SudokuGrid from '@/components/SudokuGrid';
import { solveSudoku, validateInitialGrid } from '@/utils/sudokuSolver';
import { SudokuGrid as GridType } from '@/types/sudoku';

const createEmptyGrid = (): GridType => Array(9).fill(0).map(() => Array(9).fill(0));

export default function SolvePage() {
  const [userGrid, setUserGrid] = useState<GridType>(createEmptyGrid());
  const [finalSolution, setFinalSolution] = useState<GridType | null>(null);
  const [animatedGrid, setAnimatedGrid] = useState<GridType | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [isSolving, setIsSolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!finalSolution || !userGrid) return;
    const animationSequence: { row: number, col: number, num: number }[] = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (userGrid[i][j] === 0 && finalSolution[i][j] !== 0) {
          animationSequence.push({ row: i, col: j, num: finalSolution[i][j] });
        }
      }
    }
    let step = 0;
    const interval = setInterval(() => {
      if (step >= animationSequence.length) {
        clearInterval(interval);
        return;
      }
      const { row, col, num } = animationSequence[step];
      setAnimatedGrid(prevGrid => {
        const newGrid = prevGrid!.map(r => [...r]);
        newGrid[row][col] = num;
        return newGrid;
      });
      step++;
    }, 75);
    return () => clearInterval(interval);
  }, [finalSolution, userGrid]);

  const handleUserCellChange = (row: number, col: number, value: number) => {
    const newGrid = userGrid.map(r => [...r]);
    newGrid[row][col] = value;
    setUserGrid(newGrid);
    setFinalSolution(null);
    setAnimatedGrid(null);
    setError(null);
    setSteps([]);
  };

  const handleSolveUserGrid = () => {
    setIsSolving(true);
    setError(null);
    setFinalSolution(null);
    setAnimatedGrid(userGrid);

    const isGridValid = validateInitialGrid(userGrid);
    if (!isGridValid) {
      setError("Invalid Puzzle: Duplicate number in a row, column, or box.");
      setIsSolving(false);
      return;
    }

    setTimeout(() => {
      const { solvedGrid, steps: solveSteps } = solveSudoku(userGrid);
      if (solvedGrid) {
        setFinalSolution(solvedGrid);
        setSteps(solveSteps);
      } else {
        setError("This puzzle has no solution.");
      }
      setIsSolving(false);
    }, 50);
  };

  const handleReset = () => {
    setUserGrid(createEmptyGrid());
    setFinalSolution(null);
    setAnimatedGrid(null);
    setError(null);
    setSteps([]);
  }

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md mt-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-200 mb-4">Manual Sudoku Solver</h2>
          
          <SudokuGrid 
            grid={animatedGrid || userGrid} 
            originalGrid={userGrid} 
            onCellChange={handleUserCellChange} 
            title={finalSolution ? "Here is the solution:" : "Enter your puzzle below:"} 
          />
          
          <div className="mt-6 flex justify-center space-x-4">
            <button onClick={handleSolveUserGrid} disabled={isSolving || !!finalSolution} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50">
              {isSolving ? "Solving..." : "Solve This Puzzle"}
            </button>
            <button onClick={handleReset} className="px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
              Reset
            </button>
          </div>

          {error && <p className="mt-4 text-center text-red-500">{error}</p>}

          {steps.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Solving Steps</h3>
              <div className="max-h-60 overflow-y-auto bg-slate-100 dark:bg-slate-800 p-3 rounded-md border border-slate-200 dark:border-slate-700">
                <ol className="list-decimal pl-5 text-sm text-slate-700 dark:text-slate-300 space-y-1">
                  {steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}