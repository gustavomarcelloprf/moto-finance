'use client';

import * as React from 'react';
import { PLATFORMS, type PlatformId } from '@motofinance/shared';
import { cn } from './cn.js';

export interface PlatformChipProps {
  platformId: PlatformId;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

// Escolhe texto preto/branco para contraste WCAG AAA sobre `bgHex` usando luminância relativa (sRGB).
function readableTextOn(bgHex: string): '#000000' | '#FFFFFF' {
  const r = parseInt(bgHex.slice(1, 3), 16) / 255;
  const g = parseInt(bgHex.slice(3, 5), 16) / 255;
  const b = parseInt(bgHex.slice(5, 7), 16) / 255;
  const toLinear = (c: number): number =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return L > 0.179 ? '#000000' : '#FFFFFF';
}

export function PlatformChip({
  platformId,
  selected = false,
  onClick,
  disabled = false
}: PlatformChipProps): React.JSX.Element | null {
  const platform = PLATFORMS.find((p) => p.id === platformId);
  if (!platform) return null;

  const inlineStyle: React.CSSProperties = selected
    ? { backgroundColor: platform.color, color: readableTextOn(platform.color) }
    : {};

  return (
    <button
      type="button"
      role="button"
      aria-pressed={selected}
      aria-label={`Plataforma ${platform.label}`}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onClick}
      style={inlineStyle}
      className={cn(
        'min-h-touch min-w-touch rounded-2xl px-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        !selected && 'bg-muted text-fg',
        selected && 'ring-2 ring-accent',
        disabled && 'pointer-events-none opacity-50'
      )}
    >
      <span className="text-base font-medium">{platform.label}</span>
    </button>
  );
}
