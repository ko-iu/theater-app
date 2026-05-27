import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, BookOpen, Calendar, Trophy, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Logo } from '../components/Logo';
import { TheaterInfo } from './TheaterInfo';
import { api } from '../services/api';
import { getPlaceholderImage } from '../utils/placeholderImage';

interface Performance {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  image_url?: string;
  imageUrl?: string;
  description: string;
  short_description: string;
  duration: string;
  is_featured?: boolean;
  isFeatured?: boolean;
}

export function Home() {
  const navigate = useNavigate();
  const [showTheaterInfo, setShowTheaterInfo] = useState(false);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadPerformances();
  }, []);

  const loadPerformances = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getPerformances({});
      console.log('Загруженные спектакли для главной:', data);
      setPerformances(data);
    } catch (err) {
      console.error('Failed to load performances:', err);
      setError('Не удалось загрузить афишу');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (performanceId: string) => {
    setImageErrors(prev => ({ ...prev, [performanceId]: true }));
  };

  const getImageUrl = (performance: Performance): string => {
    if (imageErrors[performance.id]) {
      return getPlaceholderImage('Нет изображения', 800, 400);
    }
    
    const imageUrl = performance.image_url || performance.imageUrl;
    
    if (imageUrl) {
      if (imageUrl.startsWith('/uploads')) {
        return `http://localhost:5000${imageUrl}`;
      }
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      return `http://localhost:5000/${imageUrl}`;
    }
    return getPlaceholderImage('Нет изображения', 800, 400);
  };

  const handleStartQuiz = () => {
    navigate('/interactive?tab=quiz');
  };

  const featuredPerformances = performances.filter((p) => p.is_featured || p.isFeatured);
  const upcomingPerformances = performances.slice(0, 3);

  if (isLoading) {
    return (
      <div className="pb-24 min-h-screen">
        <div className="px-6 pt-8 pb-6">
          <Logo variant="compact" onClick={() => setShowTheaterInfo(true)} />
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-24 min-h-screen">
        <div className="px-6 pt-8 pb-6">
          <Logo variant="compact" onClick={() => setShowTheaterInfo(true)} />
        </div>
        <div className="px-6 text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
          <button 
            onClick={loadPerformances}
            className="mt-4 px-6 py-2 rounded-lg bg-[#D4AF37] text-black"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 min-h-screen">
      <div className="px-6 pt-8 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Logo variant="compact" onClick={() => setShowTheaterInfo(true)} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-gray-400">Добро пожаловать</p>
        </motion.div>
      </div>

      {featuredPerformances[0] && (
        <Link to={`/performance/${featuredPerformances[0].id}`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.98 }}
            className="mx-6 mb-8 relative rounded-2xl overflow-hidden h-64 group"
          >
            <img
              src={getImageUrl(featuredPerformances[0])}
              alt={featuredPerformances[0].title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => handleImageError(featuredPerformances[0].id)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-[#D4AF37] text-black text-xs rounded-full">
                  Главное
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full">
                  {featuredPerformances[0].type.toUpperCase()}
                </span>
              </div>
              <h3 className="text-2xl mb-1">{featuredPerformances[0].title}</h3>
              <p className="text-gray-300 text-sm">
                {new Date(featuredPerformances[0].date).toLocaleDateString('ru-RU', {
                  month: 'long',
                  day: 'numeric',
                })} • {featuredPerformances[0].time}
              </p>
            </div>
          </motion.div>
        </Link>
      )}

      <div className="px-6 mb-8">
        <div className="grid grid-cols-4 gap-3">
          <Link to="/favorites">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-colors"
            >
              <Heart className="w-6 h-6 text-[#D4AF37]" />
              <span className="text-xs text-center">Избранное</span>
            </motion.div>
          </Link>
          <Link to="/glossary">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-colors"
            >
              <BookOpen className="w-6 h-6 text-[#D4AF37]" />
              <span className="text-xs text-center">Словарь</span>
            </motion.div>
          </Link>
          <Link to="/ballet">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-colors"
            >
              <Sparkles className="w-6 h-6 text-[#D4AF37]" />
              <span className="text-xs text-center">Балет</span>
            </motion.div>
          </Link>
          <Link to="/interactive">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-colors"
            >
              <Trophy className="w-6 h-6 text-[#D4AF37]" />
              <span className="text-xs text-center">Игры</span>
            </motion.div>
          </Link>
        </div>
      </div>

      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl">Предстоящие спектакли</h2>
          <Link to="/repertoire" className="text-[#D4AF37] text-sm">
            Все
          </Link>
        </div>

        {upcomingPerformances.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Нет предстоящих спектаклей</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingPerformances.map((performance, index) => (
              <Link key={performance.id} to={`/performance/${performance.id}`}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex gap-4 p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-[#D4AF37]/30 transition-colors"
                >
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={getImageUrl(performance)}
                      alt={performance.title}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(performance.id)}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] text-xs rounded">
                        {performance.type}
                      </span>
                    </div>
                    <h3 className="mb-1 truncate">{performance.title}</h3>
                    <p className="text-sm text-gray-400 mb-1 line-clamp-1">
                      {performance.short_description || performance.description?.substring(0, 80)}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(performance.date).toLocaleDateString('ru-RU', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span>{performance.time}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 mt-8">
        <h2 className="text-xl mb-4">Для вас</h2>
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="p-6 rounded-xl bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37]/10 to-[#D4AF37]/20 border border-[#D4AF37]/30 cursor-pointer"
          onClick={handleStartQuiz}
        >
          <Sparkles className="w-8 h-8 text-[#D4AF37] mb-3" />
          <h3 className="text-lg mb-2">Откройте идеальный спектакль</h3>
          <p className="text-sm text-gray-300 mb-4">
            Пройдите тест и получите персональные рекомендации
          </p>
          <Button
            variant="outline"
            className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
          >
            Начать тест
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showTheaterInfo && <TheaterInfo onClose={() => setShowTheaterInfo(false)} />}
      </AnimatePresence>
    </div>
  );
}