import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles, LogIn, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import { api } from '../services/api';

interface BalletElement {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

export function Ballet() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [balletElements, setBalletElements] = useState<BalletElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadBalletElements();
    }
  }, [user]);

  const loadBalletElements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getBalletElements();
      setBalletElements(data);
    } catch (err) {
      console.error('Failed to load ballet elements:', err);
      setError('Не удалось загрузить балетные элементы');
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-3xl mb-2">Балет</h1>
          </div>
        </div>

        <div className="px-6 text-center py-12">
          <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl mb-2">Требуется авторизация</h2>
          <p className="text-gray-400 mb-6">
            Войдите или зарегистрируйтесь, чтобы изучать балетные элементы
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
            <h1 className="text-3xl mb-2">Балет</h1>
          </div>
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
        <div className="px-6 pt-12 pb-6 flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-3xl mb-2">Балет</h1>
          </div>
        </div>
        <div className="px-6 text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
          <button 
            onClick={loadBalletElements}
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
      <div className="px-6 pt-12 pb-6 flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <div>
          <h1 className="text-3xl mb-2">Балет</h1>
        </div>
      </div>

      <div className="px-6 mb-8">
        <div className="p-6 rounded-xl bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37]/10 to-[#D4AF37]/20 border border-[#D4AF37]/30">
          <Sparkles className="w-8 h-8 text-[#D4AF37] mb-3" />
          <h2 className="text-xl mb-2">Основы балета</h2>
          <p className="text-sm text-gray-300">
            Изучите основные позиции и движения, составляющие основу классического балета.
          </p>
        </div>
      </div>

      <div className="px-6">
        {balletElements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Балетные элементы не найдены</p>
          </div>
        ) : (
          <div className="space-y-4">
            {balletElements.map((element, index) => (
              <motion.div
                key={element.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl overflow-hidden bg-gradient-to-br from-white/5 to-transparent border border-white/10"
              >
                <div className="relative h-48">
                  <img
                    src={element.image_url || 'https://via.placeholder.com/800x400?text=No+Image'}
                    alt={element.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=No+Image';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl mb-1">{element.name}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-gray-300 leading-relaxed">{element.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}