import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Heart, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { getPlaceholderImage } from '../utils/placeholderImage';

interface Performance {
  id: string;
  title: string;
}

interface Artist {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  imageUrl?: string;
  bio?: string;
  category: string;
  performances?: Performance[];
}

export function ArtistProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isArtistFavorite, toggleArtist } = useFavoritesStore();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    loadArtist();
  }, [id]);

  const loadArtist = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getArtistById(id);
      console.log('Загруженный артист:', data);
      setArtist(data);
    } catch (err) {
      console.error('Failed to load artist:', err);
      setError('Не удалось загрузить информацию об артисте');
    } finally {
      setIsLoading(false);
    }
  };

  const isFavorite = artist ? isArtistFavorite(artist.id) : false;

  const handleFavoriteToggle = async () => {
    if (artist && user) {
      await toggleArtist(artist.id);
    } else if (!user) {
      navigate('/profile');
    }
  };

  const getFullName = (): string => {
    if (!artist) return '';
    if (artist.name) return artist.name;
    if (artist.firstName && artist.lastName) return `${artist.firstName} ${artist.lastName}`;
    if (artist.firstName) return artist.firstName;
    if (artist.lastName) return artist.lastName;
    return 'Без имени';
  };

  const getBio = (): string => {
    if (!artist) return '';
    if (artist.bio) return artist.bio;
    return '';
  };

  const getImageUrl = (): string => {
    if (imageError) {
      return getPlaceholderImage('Нет фото', 400, 600);
    }
    const imageUrl = artist?.imageUrl;
    if (imageUrl) {
      if (imageUrl.startsWith('/uploads')) {
        return `http://localhost:5000${imageUrl}`;
      }
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      return `http://localhost:5000/${imageUrl}`;
    }
    return getPlaceholderImage('Нет фото', 400, 600);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <p className="text-red-400 text-center mb-4">{error || 'Артист не найден'}</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-6 py-2 rounded-lg bg-[#D4AF37] text-black"
        >
          Вернуться назад
        </button>
      </div>
    );
  }

  const fullName = getFullName();
  const bio = getBio();
  const performances = artist.performances || [];

  return (
    <div className="pb-24 min-h-screen">
      <div className="relative h-96">
        <img
          src={getImageUrl()}
          alt={fullName}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
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
          <h1 className="text-3xl mb-2">{fullName}</h1>
          <p className="text-[#D4AF37] text-lg">{artist.role || 'Должность не указана'}</p>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="mb-6">
          <h2 className="text-xl mb-3">Биография</h2>
          <p className="text-gray-300 leading-relaxed">
            {bio && bio.trim() !== '' ? bio : 'Информация отсутствует'}
          </p>
        </div>

        {performances.length > 0 && (
          <div>
            <h2 className="text-xl mb-4">Репертуар</h2>
            <div className="space-y-3">
              {performances.map((performance, index) => (
                <Link key={performance.id} to={`/performance/${performance.id}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-white/10 hover:border-[#D4AF37]/30 transition-colors cursor-pointer"
                  >
                    <p className="text-gray-300">{performance.title}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}