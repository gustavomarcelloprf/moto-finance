'use client';

import * as React from 'react';
import { EXPENSE_CATEGORIES, type ExpenseCategoryId } from '@motofinance/shared';
import { cn } from './cn.js';

export interface CategoryChipProps {
  categoryId: ExpenseCategoryId;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

// Nota: o constants/EXPENSE_CATEGORIES expõe `icon` como nome de ícone Lucide,
// mas lucide-react não está instalado no workspace. Mantemos apenas label
// (T-039 fallback definido pelo orquestrador). Quando lucide-react entrar,
// renderizar <Icon name={category.icon} /> antes do label.

export function CategoryChip({
  categoryId,
  selected = false,
  onClick,
  disabled = false
}: CategoryChipProps): React.JSX.Element | null {
  const category = EXPENSE_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return null;

  return (
    <button
      type="button"
      role="button"
      aria-pressed={selected}
      aria-label={`Categoria ${category.label}`}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'min-h-touch min-w-touch rounded-2xl px-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        selected ? 'bg-accent text-accent-fg ring-2 ring-accent' : 'bg-muted text-fg',
        disabled && 'pointer-events-none opacity-50'
      )}
    >
      <span className="text-base font-medium">{category.label}</span>
    </button>
  );
}
