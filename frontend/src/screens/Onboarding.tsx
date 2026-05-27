import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Calendar, Users, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';

const onboardingScreens = [
  {
    isLogo: true,
    title: 'Добро пожаловать в "Театр оперы и балета"',
    color: '#D4AF37',
  },
  {
    icon: Calendar,
    title: 'Изучите спектакли',
    description: 'Ознакомьтесь с полным репертуаром наших постановок.',
    color: '#B8941F',
  },
  {
    icon: Users,
    title: 'Познакомьтесь с артистами',
    description: 'Добавляйте любимых артистов в избранное.',
    color: '#D4AF37',
  },
  {
    icon: Sparkles,
    title: 'и немного интерактива',
    description: 'Воспользуйтесь интересными функциями.',
    color: '#B8941F',
  },
];

export function Onboarding() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentScreen < onboardingScreens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      navigate('/home');
    }
  };

  const handleSkip = () => {
    navigate('/home');
  };

  const screen = onboardingScreens[currentScreen];
  const Icon = screen.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center">
      <div className="w-full max-w-[428px] min-h-screen bg-black text-white flex flex-col px-8 py-12">
        {/* Skip button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Пропустить
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="mb-12"
              >
                <div
                  className="w-48 h-48 rounded-full flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle, ${screen.color}20 0%, transparent 70%)`,
                  }}
                >
                  {screen.isLogo ? (
                    <img 
                      src="/logo2.png" 
                      alt="Логотип театра" 
                      className="w-40 h-40 object-contain relative z-10"
                    />
                  ) : (
                    Icon && <Icon className="w-24 h-24" style={{ color: screen.color }} />
                  )}
                </div>
              </motion.div>

              <h1 className="text-3xl mb-6 max-w-sm">{screen.title}</h1>
              <p className="text-gray-400 text-lg max-w-xs leading-relaxed">
                {screen.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2 mb-8">
          {onboardingScreens.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentScreen
                  ? 'w-8 bg-[#D4AF37]'
                  : 'w-2 bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Next button */}
        <Button
          onClick={handleNext}
          className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#A07A1A] text-black h-14 text-lg group"
        >
          {currentScreen < onboardingScreens.length - 1 ? 'Далее' : 'Начать'}
          <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}