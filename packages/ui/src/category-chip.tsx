'use client';

import * as React from 'react';
import * as Icons from 'lucide-react';
import { EXPENSE_CATEGORIES, type ExpenseCategoryId } from '@motofinance/shared';
import { cn } from './cn.js';

export interface CategoryChipProps {
  categoryId: ExpenseCategoryId;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

function kebabToPascal(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

type LucideIconComponent = React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

function resolveIcon(iconName: string): LucideIconComponent {
  const pascalName = kebabToPascal(iconName) as keyof typeof Icons;
  const Resolved = Icons[pascalName] as LucideIconComponent | undefined;
  return Resolved ?? (Icons.MoreHorizontal as LucideIconComponent);
}

export function CategoryChip({
  categoryId,
  selected = false,
  onClick,
  disabled = false
}: CategoryChipProps): React.JSX.Element | null {
  const category = EXPENSE_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return null;

  const Icon = resolveIcon(category.icon);

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
        'inline-flex min-h-touch min-w-touch items-center gap-2 rounded-2xl px-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        selected ? 'bg-accent text-accent-fg ring-2 ring-accent' : 'bg-muted text-fg',
        disabled && 'pointer-events-none opacity-50'
      )}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden={true} />
      <span className="text-base font-medium">{category.label}</span>
    </button>
  );
}
