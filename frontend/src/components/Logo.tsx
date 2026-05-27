import { Music } from 'lucide-react';
import { motion } from 'motion/react';

interface LogoProps {
  variant?: 'full' | 'compact' | 'icon';
  className?: string;
  showSubtitle?: boolean;
  onClick?: () => void;
}

export function Logo({ variant = 'full', className = '', showSubtitle = false, onClick }: LogoProps) {
  if (variant === 'icon') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center justify-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick}
        whileTap={onClick ? { scale: 0.95 } : {}}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-[#D4AF37] blur-xl opacity-30" />
          <img 
            src="/logo.png" 
            alt="Theater Logo" 
            className="w-20 h-20 object-contain relative z-10"
          />
        </div>
      </motion.div>
    );
  }

  if (variant === 'compact') {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-4 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.98 } : {}}
    >
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 bg-[#D4AF37] blur-lg opacity-40 rounded-full" />
        <img 
          src="/logo.png" 
          alt="Theater Logo" 
          className="w-14 h-14 object-contain relative z-10"
        />
      </div>
      <div className="flex flex-col justify-center">
        <span className="text-base font-light tracking-wider text-white">
          ТЕАТР ОПЕРЫ И БАЛЕТА
        </span>
      </div>
    </motion.div>
  );
}

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className={`flex flex-col items-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.98 } : {}}
    >
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] blur-2xl opacity-40" />
        <img 
          src="/logo.png" 
          alt="Theater Logo" 
          className="w-20 h-20 object-contain relative z-10"
        />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-light tracking-[0.2em] text-white mb-1">
          ТЕАТР
        </h1>
        <div className="flex items-center gap-2 justify-center mb-2">
          <div className="h-px w-8 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
          <p className="text-sm font-light tracking-[0.3em] text-[#D4AF37]">
            ОПЕРЫ И БАЛЕТА
          </p>
          <div className="h-px w-8 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
        </div>
        {showSubtitle && (
          <p className="text-xs font-light tracking-widest text-gray-400 uppercase">
            имени Д.К.Сивцева - Суоруна Омоллоона
          </p>
        )}
      </div>
    </motion.div>
  );
}
