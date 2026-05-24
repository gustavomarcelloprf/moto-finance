import * as React from 'react';
import { cn } from './cn.js';

export type NumberCardVariant = 'positive' | 'neutral' | 'negative';
export type NumberCardSize = 'sm' | 'md' | 'lg';

export interface NumberCardProps {
  label: string;
  valueCents: number;
  variant: NumberCardVariant;
  size?: NumberCardSize;
}

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const VALUE_SIZE: Record<NumberCardSize, string> = {
  sm: 'text-financial-sm',
  md: 'text-financial-md',
  lg: 'text-financial-lg'
};

const VARIANT_COLOR: Record<NumberCardVariant, string> = {
  positive: 'text-positive',
  neutral: 'text-fg',
  negative: 'text-negative'
};

export function NumberCard({
  label,
  valueCents,
  variant,
  size = 'md'
}: NumberCardProps): React.JSX.Element {
  const formatted = BRL.format(valueCents / 100);

  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-muted p-4">
      <span className="text-base font-medium text-fg/80">{label}</span>
      <span className={cn('tabular-nums', VALUE_SIZE[size], VARIANT_COLOR[variant])}>
        {formatted}
      </span>
    </div>
  );
}
