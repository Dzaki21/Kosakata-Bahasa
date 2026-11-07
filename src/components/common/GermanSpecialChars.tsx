import React from 'react';

interface GermanSpecialCharsProps {
  onInsert: (char: string) => void;
  className?: string;
}

export const GermanSpecialChars: React.FC<GermanSpecialCharsProps> = ({ onInsert, className = '' }) => {
  const chars = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'];

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <span className="text-xs text-slate-400 dark:text-slate-500 mr-1 font-medium select-none">
        Umlaut:
      </span>
      {chars.map(char => (
        <button
          key={char}
          type="button"
          onClick={() => onInsert(char)}
          title={`Sisipkan ${char}`}
          className="w-7 h-7 inline-flex items-center justify-center text-xs font-semibold rounded bg-slate-100 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm active:scale-95"
        >
          {char}
        </button>
      ))}
    </div>
  );
};
