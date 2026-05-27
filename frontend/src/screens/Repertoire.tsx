import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '../components/ui/input';
import { api } from '../services/api';
import { getPlaceholderImage } from '../utils/placeholderImage';

interface Performance {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  image_url?: string;
  imageUrl?: string;  //也可能是 camelCase
  description: string;
  short_description: string;
  duration: string;
}

export function Repertoire() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'Все' | 'Опера' | 'Балет' | 'Спектакль'>('Все');
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
      console.log('Загруженные спектакли:', data);
      setPerformances(data);
    } catch (err) {
      console.error('Failed to load performances:', err);
      setError('Не удалось загрузить репертуар. Проверьте подключение к серверу.');
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
    
    // Поддерживаем оба варианта: image_url и imageUrl
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

  const filteredPerformances = performances.filter((performance) => {
    const matchesSearch = performance.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'Все' || performance.type === selectedType;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="pb-24 min-h-screen">
        <div className="px-6 pt-12 pb-6">
          <h1 className="text-3xl mb-2">Репертуар</h1>
          <p className="text-gray-400">Познакомьтесь с нашими спектаклями</p>
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
        <div className="px-6 pt-12 pb-6">
          <h1 className="text-3xl mb-2">Репертуар</h1>
          <p className="text-gray-400">Познакомьтесь с нашими спектаклями</p>
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
      <div className="px-6 pt-12 pb-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl mb-2">Репертуар</h1>
          <p className="text-gray-400">Познакомьтесь с нашими спектаклями</p>
        </motion.div>
      </div>

      <div className="px-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Поиск спектаклей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12"
          />
        </div>
      </div>

      <div className="px-6 mb-6 overflow-x-auto">
        <div className="flex gap-3 whitespace-nowrap pb-1">
          {['Все', 'Опера', 'Балет', 'Спектакль'].map((type) => (
            <motion.button
              key={type}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedType(type as any)}
              className={`px-6 py-2 rounded-full transition-all ${
                selectedType === type
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
            >
              {type}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-6">
        {filteredPerformances.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {searchQuery ? 'Спектакли не найдены по вашему запросу' : 'В этой категории пока нет спектаклей'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredPerformances.map((performance, index) => {
              const imageUrl = getImageUrl(performance);
              return (
                <Link key={performance.id} to={`/performance/${performance.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative rounded-xl overflow-hidden h-48 group"
                  >
                    <img
                      src={imageUrl}
                      alt={performance.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={() => handleImageError(performance.id)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        performance.type === 'Балет'
                          ? 'bg-[#D4AF37] text-black'
                          : 'bg-[#B8941F] text-black'
                      }`}>
                        {performance.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-xl mb-2">{performance.title}</h3>
                      <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                        {performance.short_description || performance.description?.substring(0, 100)}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(performance.date).toLocaleDateString('ru-RU', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {performance.duration}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}