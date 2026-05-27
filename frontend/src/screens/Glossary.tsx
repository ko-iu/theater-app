import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
}

export function Glossary() {
  const navigate = useNavigate();
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGlossaryTerms();
  }, []);

  const loadGlossaryTerms = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getGlossaryTerms();
      setGlossaryTerms(data);
    } catch (err) {
      console.error('Failed to load glossary:', err);
      setError('Не удалось загрузить словарь терминов');
    } finally {
      setIsLoading(false);
    }
  };

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
            <h1 className="text-3xl mb-2">Словарь театрала</h1>
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
            <h1 className="text-3xl mb-2">Словарь театрала</h1>
          </div>
        </div>
        <div className="px-6 text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
          <button 
            onClick={loadGlossaryTerms}
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
          <h1 className="text-3xl mb-2">Словарь театрала</h1>
        </div>
      </div>

      <div className="px-6">
        {glossaryTerms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Термины не найдены</p>
          </div>
        ) : (
          <div className="space-y-4">
            {glossaryTerms.map((term, index) => (
              <motion.div
                key={term.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-5 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg mb-1">{term.term}</h3>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">{term.definition}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}