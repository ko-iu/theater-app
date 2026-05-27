import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, AlertCircle } from 'lucide-react';
import { Input } from '../components/ui/input';
import { api } from '../services/api';

type FilterType = 'all' | 'direction' | 'ballet' | 'opera' | 'choir' | 'orchestra';

interface Artist {
  id: string;
  name?: string;           // если API возвращает name
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  category: string;
  biography?: string;
  bio?: string;            // если API возвращает bio
  image_url?: string;
  imageUrl?: string;
}

export function Artists() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'direction', label: 'Руководство' },
    { value: 'ballet', label: 'Балетная труппа' },
    { value: 'opera', label: 'Оперная труппа' },
    { value: 'choir', label: 'Хор' },
    { value: 'orchestra', label: 'Оркестр' },
  ];

  useEffect(() => {
    loadArtists();
  }, []);

  const loadArtists = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getArtists({});
      console.log('Загруженные артисты:', data); // ОТЛАДКА: посмотреть в консоли
      setArtists(data);
    } catch (err) {
      console.error('Failed to load artists:', err);
      setError('Не удалось загрузить список артистов. Проверьте подключение к серверу.');
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для получения имени артиста
  const getArtistName = (artist: Artist): string => {
    // Пробуем разные варианты
    if (artist.name) return artist.name;
    if (artist.first_name && artist.last_name) return `${artist.first_name} ${artist.last_name}`;
    if (artist.firstName && artist.lastName) return `${artist.firstName} ${artist.lastName}`;
    if (artist.first_name) return artist.first_name;
    if (artist.firstName) return artist.firstName;
    if (artist.last_name) return artist.last_name;
    if (artist.lastName) return artist.lastName;
    return 'Без имени';
  };

  // Функция для получения биографии
  const getArtistBio = (artist: Artist): string => {
    if (artist.biography) return artist.biography;
    if (artist.bio) return artist.bio;
    return '';
  };

  const getCategoryFilter = (filter: FilterType): string | null => {
    switch (filter) {
      case 'direction': return 'Руководство';
      case 'ballet': return 'Балет';
      case 'opera': return 'Опера';
      case 'choir': return 'Хор';
      case 'orchestra': return 'Оркестр';
      default: return null;
    }
  };

  const filteredArtists = artists.filter((artist) => {
    const artistName = getArtistName(artist).toLowerCase();
    const matchesSearch = 
      artistName.includes(searchQuery.toLowerCase()) ||
      (artist.role || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'all') return matchesSearch;
    
    const categoryFilter = getCategoryFilter(activeFilter);
    return matchesSearch && categoryFilter && artist.category === categoryFilter;
  });

  if (isLoading) {
    return (
      <div className="pb-24 min-h-screen">
        <div className="px-6 pt-12 pb-6">
          <h1 className="text-3xl mb-2">Коллектив</h1>
          <p className="text-gray-400">Наши талантливые артисты</p>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-24 min-h-screen">
        <div className="px-6 pt-12 pb-6">
          <h1 className="text-3xl mb-2">Коллектив</h1>
          <p className="text-gray-400">Наши талантливые артисты</p>
        </div>
        <div className="px-6 text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
          <button 
            onClick={loadArtists}
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
          <h1 className="text-3xl mb-2">Коллектив</h1>
          <p className="text-gray-400">Наши талантливые артисты</p>
        </motion.div>
      </div>

      <div className="px-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Поиск артистов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12"
          />
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <motion.button
              key={filter.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm transition-all ${
                activeFilter === filter.value
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-[#D4AF37]/30'
              }`}
            >
              {filter.label}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-6">
        {filteredArtists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {searchQuery ? 'Артисты не найдены по вашему запросу' : 'В этой категории пока нет артистов'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredArtists.map((artist, index) => {
              const artistName = getArtistName(artist);
              const bio = getArtistBio(artist);
              return (
                <Link key={artist.id} to={`/artist/${artist.id}`}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group"
                  >
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-gray-800">
                      <img
                        src={artist.image_url || artist.imageUrl || 'https://via.placeholder.com/400x500?text=Нет+фото'}
                        alt={artistName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x500?text=Нет+фото';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                    </div>
                    <h3 className="mb-1 line-clamp-1 text-white font-medium">{artistName}</h3>
                    <p className="text-sm text-[#D4AF37]">{artist.role || 'Должность не указана'}</p>
                    {bio && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{bio.substring(0, 80)}</p>
                    )}
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