import { ReactNode } from 'react';

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
}

export function MobileContainer({ children, className = '' }: MobileContainerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#1a0000] to-black flex items-center justify-center">
      <div className={`w-full max-w-[428px] min-h-screen bg-black text-white relative ${className}`}>
        {children}
      </div>
    </div>
  );
}