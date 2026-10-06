import React from 'react';

interface FractionProps {
  num: number | string;
  den: number | string;
  whole?: number | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Fraction: React.FC<FractionProps> = ({
  num,
  den,
  whole,
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    xs: {
      container: 'text-xs',
      whole: 'text-xs font-bold mr-1',
      line: 'border-b-[1.5px] border-current',
      num: 'px-1 pb-0.5 leading-tight',
      den: 'px-1 pt-0.5 leading-tight',
    },
    sm: {
      container: 'text-sm',
      whole: 'text-sm font-bold mr-1.5',
      line: 'border-b-2 border-current',
      num: 'px-1.5 pb-0.5 leading-tight',
      den: 'px-1.5 pt-0.5 leading-tight',
    },
    md: {
      container: 'text-base',
      whole: 'text-lg font-bold mr-2',
      line: 'border-b-2 border-current',
      num: 'px-2 pb-0.5 leading-tight',
      den: 'px-2 pt-0.5 leading-tight',
    },
    lg: {
      container: 'text-lg',
      whole: 'text-2xl font-bold mr-2.5',
      line: 'border-b-[2.5px] border-current',
      num: 'px-2.5 pb-1 leading-tight',
      den: 'px-2.5 pt-1 leading-tight',
    },
    xl: {
      container: 'text-2xl',
      whole: 'text-3xl font-bold mr-3',
      line: 'border-b-3 border-current',
      num: 'px-3 pb-1 leading-tight',
      den: 'px-3 pt-1 leading-tight',
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      className={`inline-flex items-center align-middle font-mono font-bold select-none ${currentSize.container} ${className}`}
    >
      {whole !== undefined && whole !== null && (
        <span className={currentSize.whole}>{whole}</span>
      )}
      <span className="inline-flex flex-col items-center justify-center text-center">
        <span className={`${currentSize.num} ${currentSize.line} w-full`}>
          {num}
        </span>
        <span className={`${currentSize.den} w-full`}>
          {den}
        </span>
      </span>
    </span>
  );
};
