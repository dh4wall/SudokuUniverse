import React from 'react';
import { SudokuGrid as GridType } from '@/types/sudoku';

interface SudokuGridProps {
  grid: GridType;
  originalGrid?: GridType | null;
  onCellChange?: (row: number, col: number, value: number) => void;
  title: string;
}

const SudokuGrid: React.FC<SudokuGridProps> = ({ grid, originalGrid, onCellChange, title }) => {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, row: number, col: number) => {
    if (!onCellChange) return;
    
    const value = e.target.value.slice(-1);
    if (/^[1-9]$/.test(value)) {
      onCellChange(row, col, parseInt(value));
    } else if (value === '') {
      onCellChange(row, col, 0);
    }
  };

  return (
    <div className="mt-6 w-full flex flex-col items-center">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 self-start">{title}</h2>
      {/* Removed the redundant background color from this container */}
      <div className="grid grid-cols-9 w-full max-w-[405px] aspect-square border-2 border-slate-700 dark:border-slate-400">
        {grid.map((row, i) =>
          row.map((cell, j) => {
            const isOriginal = !!(originalGrid && originalGrid[i][j] !== 0);
            
            // --- THIS IS THE FIX ---
            // Added explicit background colors for both themes to the input itself.
            let cellClasses = 'flex items-center justify-center text-2xl font-bold w-full h-full text-center bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 disabled:bg-slate-100 dark:disabled:bg-slate-800';
            let containerClasses = 'relative';

            if (isOriginal) {
              cellClasses += ' text-slate-800 dark:text-slate-200';
            } else {
              cellClasses += ' text-blue-600 dark:text-blue-400';
            }

            if ((j + 1) % 3 === 0 && j < 8) containerClasses += ' border-r-2 border-r-slate-700 dark:border-r-slate-400';
            if ((i + 1) % 3 === 0 && i < 8) containerClasses += ' border-b-2 border-b-slate-700 dark:border-b-slate-400';
            if (j < 8 && (j + 1) % 3 !== 0) containerClasses += ' border-r border-r-slate-300 dark:border-r-slate-700';
            if (i < 8 && (i + 1) % 3 !== 0) containerClasses += ' border-b border-b-slate-300 dark:border-b-slate-700';
            
            return (
              <div key={`${i}-${j}`} className={containerClasses}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cell !== 0 ? cell : ''}
                  onChange={(e) => handleInputChange(e, i, j)}
                  disabled={isOriginal}
                  className={cellClasses}
                  maxLength={1}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SudokuGrid;