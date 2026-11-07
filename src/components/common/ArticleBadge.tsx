import React from 'react';
import { GermanArticle } from '../../types';

interface ArticleBadgeProps {
  article: GermanArticle;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ArticleBadge: React.FC<ArticleBadgeProps> = ({
  article,
  className = '',
  size = 'md',
}) => {
  if (!article) return null;

  const normalized = article.toLowerCase();

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 rounded font-semibold',
    md: 'text-xs px-2 py-0.5 rounded-md font-semibold tracking-wide',
    lg: 'text-sm px-2.5 py-1 rounded-lg font-bold tracking-wider',
  };

  const articleStyles: Record<string, string> = {
    der: 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    die: 'bg-pink-100 text-pink-700 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800',
    das: 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  };

  const style = articleStyles[normalized] || 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300';

  return (
    <span className={`inline-flex items-center uppercase ${sizeClasses[size]} ${style} ${className}`}>
      {normalized}
    </span>
  );
};

