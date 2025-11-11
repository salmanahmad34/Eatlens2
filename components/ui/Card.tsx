import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ children, className = '', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`bg-white border border-slate-200/60 rounded-2xl p-6 shadow-lg shadow-slate-200/20 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = 'Card';