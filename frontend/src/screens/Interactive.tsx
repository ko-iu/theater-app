import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trophy, Sparkles, CheckCircle2, LogIn, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { api, QuizQuestion, Performance } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { getPlaceholderImage } from '../utils/placeholderImage';

export function Interactive() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  
  // Читаем параметр tab из URL
  const getInitialTab = (): 'bingo' | 'quiz' => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    return tab === 'quiz' ? 'quiz' : 'bingo';
  };
  
  const [activeTab, setActiveTab] = useState<'bingo' | 'quiz'>(getInitialTab());
  const [bingoSquares, setBingoSquares] = useState<string[]>([]);
  const [bingoState, setBingoState] = useState<boolean[]>([]);
  const [isBingoLoading, setIsBingoLoading] = useState(true);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizState, setQuizState] = useState({
    currentQuestion: 0,
    answers: [] as string[],
    showResult: false,
  });
  const [recommendedPerformance, setRecommendedPerformance] = useState<Performance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Загрузка данных
  useEffect(() => {
    if (user) {
      loadData();
      loadBingoState();
    } else {
      setIsLoading(false);
      setIsBingoLoading(false);
    }
  }, [user]);

  // Обновляем URL при смене вкладки
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentTab = params.get('tab');
    const targetTab = activeTab === 'quiz' ? 'quiz' : 'bingo';
    if (currentTab !== targetTab) {
      navigate(`/interactive?tab=${targetTab}`, { replace: true });
    }
  }, [activeTab, location.search, navigate]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [squares, questions] = await Promise.all([
        api.getBingoSquares(),
        api.getQuizQuestions(),
      ]);
      setBingoSquares(squares);
      setQuizQuestions(questions);
    } catch (err) {
      console.error('Failed to load interactive data:', err);
      setError('Не удалось загрузить интерактивные данные');
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка сохраненного состояния бинго
  const loadBingoState = async () => {
    setIsBingoLoading(true);
    try {
      const saved = await api.getBingoState();
      if (saved.hasSaved && saved.squares && saved.completedSquares) {
        setBingoSquares(saved.squares);
        setBingoState(saved.completedSquares);
      } else {
        const squares = await api.getBingoSquares();
        setBingoSquares(squares);
        setBingoState(new Array(squares.length).fill(false));
      }
    } catch (err) {
      console.error('Failed to load bingo state:', err);
      const squares = await api.getBingoSquares();
      setBingoSquares(squares);
      setBingoState(new Array(squares.length).fill(false));
    } finally {
      setIsBingoLoading(false);
    }
  };

  // Сохранение состояния бинго
  const saveBingoState = async (squares: string[], completedSquares: boolean[]) => {
    try {
      const isCompleted = completedSquares.every(v => v === true);
      await api.saveBingoState(squares, completedSquares, isCompleted);
    } catch (err) {
      console.error('Failed to save bingo state:', err);
    }
  };

  const toggleBingo = async (index: number) => {
    const newState = [...bingoState];
    newState[index] = !newState[index];
    setBingoState(newState);
    await saveBingoState(bingoSquares, newState);
  };

  const resetBingo = async () => {
    try {
      const result = await api.resetBingo();
      setBingoSquares(result.squares);
      setBingoState(result.completedSquares);
    } catch (err) {
      console.error('Failed to reset bingo:', err);
      const squares = [...bingoSquares];
      setBingoState(new Array(squares.length).fill(false));
      await saveBingoState(squares, new Array(squares.length).fill(false));
    }
  };

  const handleQuizAnswer = async (value: string) => {
    const newAnswers = [...quizState.answers, value];
    
    if (quizState.currentQuestion < quizQuestions.length - 1) {
      setQuizState({
        ...quizState,
        currentQuestion: quizState.currentQuestion + 1,
        answers: newAnswers,
      });
    } else {
      const counts: Record<string, number> = {
        Балет: newAnswers.filter(a => a === 'Балет').length,
        Опера: newAnswers.filter(a => a === 'Опера').length,
        Спектакль: newAnswers.filter(a => a === 'Спектакль').length,
      };
      
      let recommendedType = 'Спектакль';
      let maxCount = 0;
      for (const [type, count] of Object.entries(counts)) {
        if (count > maxCount) {
          maxCount = count;
          recommendedType = type;
        }
      }
      
      const performances = await api.getPerformances({ type: recommendedType });
      const recommendation = performances[0] || null;
      
      setRecommendedPerformance(recommendation);
      
      if (recommendation && user) {
        await api.submitQuizResult(newAnswers, recommendation.id);
      }
      
      setQuizState({
        ...quizState,
        answers: newAnswers,
        showResult: true,
      });
    }
  };

  const resetQuiz = () => {
    setQuizState({
      currentQuestion: 0,
      answers: [],
      showResult: false,
    });
    setRecommendedPerformance(null);
    setImageError(false);
  };

  const getQuizMessage = () => {
    const counts = {
      Балет: quizState.answers.filter(a => a === 'Балет').length,
      Опера: quizState.answers.filter(a => a === 'Опера').length,
      Спектакль: quizState.answers.filter(a => a === 'Спектакль').length,
    };
    
    let recommendedType = 'Спектакль';
    let maxCount = 0;
    for (const [type, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        recommendedType = type;
      }
    }
    
    if (recommendedType === 'Балет') {
      return 'Танец говорит громче слов! Балет — это идеальный выбор для вас. Наслаждайтесь грацией и красотой движения.';
    } else if (recommendedType === 'Опера') {
      return 'Сила голоса и эмоций! Опера ждёт вас. Погрузитесь в мир великой музыки и драматических сюжетов.';
    }
    return 'Живая игра и захватывающие истории! Драматический спектакль — ваш идеальный вечер в театре.';
  };

  const getImageUrl = (performance: Performance | null): string => {
    if (!performance) return getPlaceholderImage('Нет изображения', 800, 400);
    if (imageError) return getPlaceholderImage('Изображение отсутствует', 800, 400);
    
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
            <h1 className="text-3xl mb-2">Интерактив</h1>
          </div>
        </div>

        <div className="px-6 text-center py-12">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl mb-2">Требуется авторизация</h2>
          <p className="text-gray-400 mb-6">
            Войдите или зарегистрируйтесь, чтобы играть в бинго и проходить тест на подбор спектакля
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

  if (isLoading || isBingoLoading) {
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
            <h1 className="text-3xl mb-2">Интерактив</h1>
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
            <h1 className="text-3xl mb-2">Интерактив</h1>
          </div>
        </div>
        <div className="px-6 text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
          <button 
            onClick={loadData}
            className="mt-4 px-6 py-2 rounded-lg bg-[#D4AF37] text-black"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  const completedCount = bingoState.filter(Boolean).length;
  const isBingoCompleted = completedCount === bingoSquares.length;

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
          <h1 className="text-3xl mb-2">Интерактив</h1>
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('bingo')}
            className={`flex-1 py-3 rounded-xl transition-all ${
              activeTab === 'bingo'
                ? 'bg-[#D4AF37] text-black'
                : 'bg-white/5 text-gray-400 border border-white/10'
            }`}
          >
            <Trophy className="w-5 h-5 inline mr-2" />
            Театральное бинго
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 py-3 rounded-xl transition-all ${
              activeTab === 'quiz'
                ? 'bg-[#D4AF37] text-black'
                : 'bg-white/5 text-gray-400 border border-white/10'
            }`}
          >
            <Sparkles className="w-5 h-5 inline mr-2" />
            Тест
          </motion.button>
        </div>
      </div>

      <div className="px-6">
        <AnimatePresence mode="wait">
          {activeTab === 'bingo' ? (
            <motion.div
              key="bingo"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl mb-2">Театральное бинго</h2>
                  <p className="text-gray-400 text-sm">
                    Отмечайте интересные моменты во время посещения театра!
                  </p>
                </div>
                <button
                  onClick={resetBingo}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  title="Начать новую игру"
                >
                  <RefreshCw className="w-5 h-5 text-[#D4AF37]" />
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {bingoSquares.map((square, index) => (
                  <motion.button
                    key={index}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleBingo(index)}
                    className={`aspect-square p-2 rounded-lg text-xs flex items-center justify-center text-center transition-all ${
                      bingoState[index]
                        ? 'bg-[#D4AF37] text-black'
                        : square === 'FREE'
                        ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                        : 'bg-white/5 text-gray-300 border border-white/10'
                    }`}
                  >
                    {bingoState[index] && <CheckCircle2 className="w-4 h-4 absolute" />}
                    <span className={bingoState[index] ? 'opacity-0' : ''}>{square}</span>
                  </motion.button>
                ))}
              </div>
              
              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-gray-300 text-center">
                  Выполнено: {completedCount} / {bingoSquares.length}
                  {isBingoCompleted && (
                    <span className="block text-[#D4AF37] mt-1">🎉 Поздравляем! Бинго завершено! 🎉</span>
                  )}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {!quizState.showResult ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl mb-2">Какой спектакль вам подходит?</h2>
                    <p className="text-gray-400 text-sm mb-4">
                      Вопрос {quizState.currentQuestion + 1} из {quizQuestions.length}
                    </p>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#D4AF37]"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${((quizState.currentQuestion + 1) / quizQuestions.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-2xl">{quizQuestions[quizState.currentQuestion]?.question}</h3>
                    <div className="space-y-3">
                      {quizQuestions[quizState.currentQuestion]?.options.map((option, index) => (
                        <motion.button
                          key={index}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleQuizAnswer(option.value)}
                          className="w-full p-5 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-[#D4AF37]/50 transition-all text-left"
                        >
                          {option.text}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <Sparkles className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
                    <h2 className="text-2xl mb-3">Вам идеально подойдет!</h2>
                    <p className="text-gray-300">{getQuizMessage()}</p>
                  </div>

                  {recommendedPerformance && (
                    <div className="rounded-xl overflow-hidden bg-gradient-to-br from-white/5 to-transparent border border-white/10">
                      <div className="relative h-48">
                        <img
                          src={getImageUrl(recommendedPerformance)}
                          alt={recommendedPerformance.title}
                          className="w-full h-full object-cover"
                          onError={() => setImageError(true)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <span className="inline-block px-3 py-1 rounded-full text-xs mb-2 bg-[#D4AF37] text-black">
                            РЕКОМЕНДАЦИЯ
                          </span>
                          <h3 className="text-xl mb-1">{recommendedPerformance.title}</h3>
                        </div>
                      </div>
                      <div className="p-5">
                        <p className="text-gray-300 mb-4">
                          {recommendedPerformance.short_description || recommendedPerformance.shortDescription}
                        </p>
                        <Button
                          onClick={() => navigate(`/performance/${recommendedPerformance.id}`)}
                          className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#A07A1A]"
                        >
                          Посмотреть спектакль
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={resetQuiz}
                    className="w-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                  >
                    Пройти тест заново
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}