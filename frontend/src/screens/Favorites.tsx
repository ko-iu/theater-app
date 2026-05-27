import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, ArrowLeft, LogIn } from 'lucide-react';
import { useFavoritesStore } from '../store/favoritesStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import { getPlaceholderImage } from '../utils/placeholderImage';

export function Favorites() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { performances, artists, isLoading, loadFavorites } = useFavoritesStore();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user, loadFavorites]);

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const getImageUrl = (item: any): string => {
    if (imageErrors[item.id]) {
      return getPlaceholderImage('Нет изображения', 200, 200);
    }
    
    const imageUrl = item.image_url || item.imageUrl;
    
    if (imageUrl) {
      if (imageUrl.startsWith('/uploads')) {
        return `http://localhost:5000${imageUrl}`;
      }
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      return `http://localhost:5000/${imageUrl}`;
    }
    return getPlaceholderImage('Нет изображения', 200, 200);
  };

  // Если пользователь не авторизован — показываем сообщение
  if (!user) {
    return (
      <div className="pb-24 min-h-screen">
        <div className="px-6 pt-12 pb-6 flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-3xl mb-2">Избранное</h1>
          </div>
        </div>

        <div className="px-6 text-center py-12">
          <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl mb-2">Требуется авторизация</h2>
          <p className="text-gray-400 mb-6">
            Войдите или зарегистрируйтесь, чтобы добавлять спектакли и артистов в избранное
          </p>
          <Link to="/profile">
            <Button className="bg-[#D4AF37] text-black hover:bg-[#B8941F]">
              <LogIn className="w-4 h-4 mr-2" />
              Войти / Регистрация
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="pb-24 min-h-screen">
      <div className="px-6 pt-12 pb-6 flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <div>
          <h1 className="text-3xl mb-2">Избранное</h1>
          <p className="text-gray-400">Ваши сохраненные материалы</p>
        </div>
      </div>

      {performances.length === 0 && artists.length === 0 ? (
        <div className="px-6 text-center py-12">
          <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">У вас пока нет избранных материалов</p>
          <p className="text-sm text-gray-500 mt-2">
            Добавляйте спектакли и артистов, чтобы не потерять их
          </p>
        </div>
      ) : (
        <>
          {/* Favorite Performances */}
          {performances.length > 0 && (
            <div className="px-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-xl">Спектакли</h2>
              </div>
              <div className="space-y-4">
                {performances.map((performance, index) => (
                  <Link key={performance.id} to={`/performance/${performance.id}`}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex gap-4 p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-[#D4AF37]/30 transition-colors"
                    >
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                        <img
                          src={getImageUrl(performance)}
                          alt={performance.title}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(performance.id)}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs mb-2 ${performance.type === 'Балет' ? 'bg-[#D4AF37] text-black' : 'bg-[#B8941F] text-black'}`}>
                          {performance.type?.toUpperCase()}
                        </span>
                        <h3 className="mb-1 truncate">{performance.title}</h3>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {performance.short_description || performance.shortDescription}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Artists */}
          {artists.length > 0 && (
            <div className="px-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-xl">Артисты</h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {artists.map((artist, index) => (
                  <Link key={artist.id} to={`/artist/${artist.id}`}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="group"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-gray-800">
                        <img
                          src={getImageUrl(artist)}
                          alt={artist.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={() => handleImageError(artist.id)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                      </div>
                      <h3 className="text-sm line-clamp-1">
                        {artist.first_name ? `${artist.first_name} ${artist.last_name}` : artist.name}
                      </h3>
                      <p className="text-xs text-[#D4AF37] line-clamp-1">{artist.role}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}