import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Heart, Calendar, Clock, Users, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { getPlaceholderImage } from '../utils/placeholderImage';

interface CastMember {
  role: string;
  artist: string;
  artistId: string;
}

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
  history?: string;
  duration: string;
  ticket_url?: string;
  cast: CastMember[];
  is_featured?: boolean;
  isFeatured?: boolean;
}

export function PerformanceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isPerformanceFavorite, togglePerformance } = useFavoritesStore();
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    loadPerformance();
  }, [id]);

  const loadPerformance = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    setImageError(false);
    try {
      const data = await api.getPerformanceById(id);
      console.log('Загруженный спектакль:', data);
      setPerformance(data);
    } catch (err) {
      console.error('Failed to load performance:', err);
      setError('Не удалось загрузить информацию о спектакле');
    } finally {
      setIsLoading(false);
    }
  };

  const isFavorite = performance ? isPerformanceFavorite(performance.id) : false;

  const handleFavoriteToggle = async () => {
    if (performance && user) {
      await togglePerformance(performance.id);
    } else if (!user) {
      navigate('/profile');
    }
  };

  const handleBuyTicket = () => {
    if (performance?.ticket_url) {
      window.open(performance.ticket_url, '_blank');
    } else {
      alert('Билеты можно приобрести в кассе театра');
    }
  };

  const getImageUrl = (): string => {
    if (imageError) {
      return getPlaceholderImage('Изображение отсутствует', 800, 400);
    }
    
    // Поддерживаем оба варианта: image_url и imageUrl
    const imageUrl = performance?.image_url || performance?.imageUrl;
    
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  if (error || !performance) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <p className="text-red-400 text-center mb-4">{error || 'Спектакль не найден'}</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-6 py-2 rounded-lg bg-[#D4AF37] text-black"
        >
          Вернуться назад
        </button>
      </div>
    );
  }

  const currentImageUrl = getImageUrl();

  return (
    <div className="pb-24 min-h-screen">
      <div className="relative h-80">
        <img
          key={currentImageUrl}
          src={currentImageUrl}
          alt={performance.title}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          onLoad={() => console.log('Изображение загружено:', currentImageUrl)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="absolute top-12 left-6 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>

        {user && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleFavoriteToggle}
            className="absolute top-12 right-6 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-white'
              }`}
            />
          </motion.button>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs ${
              performance.type === 'Балет'
                ? 'bg-[#D4AF37] text-black'
                : 'bg-[#ffffff] text-black'
            }`}>
              {performance.type.toUpperCase()}
            </span>
          </div>
          <h1 className="text-3xl mb-2">{performance.title}</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <Calendar className="w-5 h-5 text-[#D4AF37] mb-2" />
            <p className="text-xs text-gray-400 mb-1">Дата</p>
            <p className="text-sm">
              {new Date(performance.date).toLocaleDateString('ru-RU', {
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <Clock className="w-5 h-5 text-[#D4AF37] mb-2" />
            <p className="text-xs text-gray-400 mb-1">Время</p>
            <p className="text-sm">{performance.time}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <Clock className="w-5 h-5 text-[#D4AF37] mb-2" />
            <p className="text-xs text-gray-400 mb-1">Продолжит.</p>
            <p className="text-sm">{performance.duration}</p>
          </div>
        </div>

        {performance.history && (
          <div className="mb-6">
            <h2 className="text-xl mb-3">История создания</h2>
            <p className="text-gray-300 leading-relaxed">{performance.history}</p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl mb-3">Описание</h2>
          <p className="text-gray-300 leading-relaxed">{performance.description}</p>
        </div>

        {performance.cast && performance.cast.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-xl">Артисты</h2>
            </div>
            <div className="space-y-3">
              {performance.cast.map((member, index) => (
                <Link key={index} to={`/artist/${member.artistId}`}>
                  <motion.div whileTap={{ scale: 0.98 }} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/30 transition-colors">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">{member.role}</p>
                      <p>{member.artist}</p>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Button onClick={handleBuyTicket} className="w-full h-14 bg-gradient-to-r from-[#ffffff] to-[#f8f8f8] hover:from-[#f5f5f5] hover:to-[#f8f8f8] text-black text-lg">
          Купить билет
        </Button>
      </div>
    </div>
  );
}