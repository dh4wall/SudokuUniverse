'use client';

import { useState, useCallback } from 'react';
import SudokuGrid from '@/components/SudokuGrid';
import { solveSudoku } from '@/utils/sudokuSolver';
import { SudokuGrid as GridType } from '@/types/sudoku';

const checkSolution = (puzzle: GridType, userSolution: GridType): boolean => {
  const { solvedGrid } = solveSudoku(puzzle);
  if (!solvedGrid) return false;
  return JSON.stringify(userSolution) === JSON.stringify(solvedGrid);
};

export default function HomePage() {
  const [puzzle, setPuzzle] = useState<GridType | null>(null);
  const [playerGrid, setPlayerGrid] = useState<GridType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'correct' | 'incorrect' | 'incomplete' | 'revealed' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNewGame = useCallback(async () => {
    setIsGenerating(true);
    setPuzzle(null);
    setPlayerGrid(null);
    setValidationStatus(null);
    setError(null);
    try {
      const response = await fetch('/api/generate-sudoku');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setPuzzle(result.grid);
      setPlayerGrid(result.grid);
    } catch (err) { // This block is now fixed
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while generating a puzzle.");
      }
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handlePlayerCellChange = (row: number, col: number, value: number) => {
    if (!playerGrid) return;
    const newGrid = playerGrid.map(r => [...r]);
    newGrid[row][col] = value;
    setPlayerGrid(newGrid);
    setValidationStatus(null);
  };

  const handleCheckSolution = () => {
    if (!puzzle || !playerGrid) return;
    if (playerGrid.flat().includes(0)) {
      setValidationStatus('incomplete');
      return;
    }
    const isCorrect = checkSolution(puzzle, playerGrid);
    setValidationStatus(isCorrect ? 'correct' : 'incorrect');
  };

  const handleGiveUp = () => {
    if (!puzzle) return;
    const { solvedGrid } = solveSudoku(puzzle);
    if (solvedGrid) {
      setPlayerGrid(solvedGrid);
      setValidationStatus('revealed');
    }
  };

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md mt-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-200 mb-4">Sudoku Challenge</h2>
          <div className="flex justify-center mb-6">
            <button onClick={handleNewGame} disabled={isGenerating} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50">
              {isGenerating ? "Generating..." : "Start New Game"}
            </button>
          </div>
          
          {error && <p className="text-center text-red-500 mb-4">{error}</p>}

          {playerGrid && puzzle ? (
            <>
              <SudokuGrid grid={playerGrid} originalGrid={puzzle} onCellChange={handlePlayerCellChange} title="Fill in the grid:" />
              <div className="mt-6 flex justify-center items-center space-x-4">
                <button onClick={handleCheckSolution} disabled={validationStatus === 'revealed'} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50">
                  Check My Solution
                </button>
                <button onClick={handleGiveUp} disabled={validationStatus === 'revealed'} className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 disabled:opacity-50">
                  Give Up
                </button>
              </div>
            </>
          ) : (
            !isGenerating && <p className="text-center text-slate-500">Click &quot;Start New Game&quot; to begin!</p>
          )}

          {validationStatus && (
            <p className={`mt-4 text-center font-bold text-lg ${
              validationStatus === 'correct' ? 'text-green-500' : 
              validationStatus === 'incorrect' ? 'text-red-500' :
              validationStatus === 'revealed' ? 'text-blue-500' : 'text-yellow-500'
            }`}>
              {validationStatus === 'correct' && '🎉 Congratulations! You solved it correctly!'}
              {validationStatus === 'incorrect' && '🤔 Not quite right. Keep trying!'}
              {validationStatus === 'incomplete' && 'Looks like you missed a few spots!'}
              {validationStatus === 'revealed' && 'Here is the full solution.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}