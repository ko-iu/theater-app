import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Plus, Edit2, Trash2, X, 
  Theater, Users, BookOpen, Sparkles,
  HelpCircle, Grid, Image as ImageIcon, Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { Button } from '../components/ui/button';

type TabType = 'performances' | 'artists' | 'glossary' | 'ballet' | 'quiz' | 'bingo';

interface Performance {
  id: string;
  title: string;
  type: string;
  description: string;
  short_description: string;
  date: string;
  time: string;
  image_url: string;
  duration: string;
  is_featured: boolean;
}

interface Artist {
  id: string;
  first_name: string;
  last_name: string;
  firstName?: string;
  lastName?: string;
  role: string;
  category: string;
  biography: string;
  image_url: string;
  imageUrl?: string;
}

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
}

interface BalletElement {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: Array<{ id?: string; text: string; value: string }>;
}

export function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('performances');
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [bingoSquares, setBingoSquares] = useState<string[]>([]);
  const [tempBingoSquares, setTempBingoSquares] = useState<string[]>([]);
  const [isEditingBingo, setIsEditingBingo] = useState(false);

  // Проверка прав администратора
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/profile');
    }
  }, [user, navigate]);

  // Загрузка данных
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'performances':
         const perf = await api.getPerformances({});

          const normalizedPerf = perf.map((p: any) => ({
            ...p,
            image_url: p.image_url || p.imageUrl || '',
            short_description:
              p.short_description ||
              p.shortDescription ||
              '',
          }));

          setItems(normalizedPerf);
          break;
        case 'artists':
          const arts = await api.getArtists({});
          const normalizedArts = arts.map((a: any) => ({
            ...a,
            first_name: a.first_name || a.firstName || '',
            last_name: a.last_name || a.lastName || '',
            image_url: a.image_url || a.imageUrl || '',
          }));
          setItems(normalizedArts);
          break;
        case 'glossary':
          const gloss = await api.getGlossaryTerms();
          setItems(gloss);
          break;
        case 'ballet':
          const bal = await api.getBalletElements();
          setItems(bal);
          break;
        case 'quiz':
          await loadQuizQuestions();
          break;
        case 'bingo':
          await loadBingoSquares();
          break;
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuizQuestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/quiz', {
        headers: { 'Authorization': `Bearer ${api.getToken()}` }
      });
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to load quiz:', error);
    }
  };

  const loadBingoSquares = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/bingo', {
        headers: { 'Authorization': `Bearer ${api.getToken()}` }
      });
      const data = await response.json();
      setBingoSquares(data);
      setTempBingoSquares([...data]);
    } catch (error) {
      console.error('Failed to load bingo squares:', error);
    }
  };

  const saveBingoSquares = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/bingo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api.getToken()}`
        },
        body: JSON.stringify({ squares: tempBingoSquares })
      });
      if (response.ok) {
        setBingoSquares([...tempBingoSquares]);
        setIsEditingBingo(false);
        alert('Квадраты бинго сохранены');
      }
    } catch (error) {
      console.error('Failed to save bingo squares:', error);
    }
  };

  const handleUploadImage = async (file: File) => {
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api.getToken()}`
        },
        body: formData
      });
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveQuizQuestion = async (data: any) => {
    try {
      const url = 'http://localhost:5000/api/admin/quiz';
      const method = editingItem ? 'PUT' : 'POST';
      const endpoint = editingItem ? `${url}/${editingItem.id}` : url;
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api.getToken()}`
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        setShowModal(false);
        setEditingItem(null);
        await loadQuizQuestions();
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleSave = async (data: any) => {
    if (activeTab === 'quiz') {
      await handleSaveQuizQuestion(data);
      return;
    }
    
    try {
      const url = `http://localhost:5000/api/admin/${activeTab}`;
      const method = editingItem ? 'PUT' : 'POST';
      const endpoint = editingItem ? `${url}/${editingItem.id}` : url;
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api.getToken()}`
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        setShowModal(false);
        setEditingItem(null);
        loadData();
      } else {
        const error = await response.json();
        console.error('Save failed:', error);
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleDeleteQuizQuestion = async (id: string) => {
    if (confirm('Удалить этот вопрос?')) {
      try {
        await fetch(`http://localhost:5000/api/admin/quiz/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${api.getToken()}` }
        });
        await loadQuizQuestions();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (activeTab === 'quiz') {
      await handleDeleteQuizQuestion(id);
      return;
    }
    
    if (confirm('Удалить этот элемент?')) {
      try {
        await fetch(`http://localhost:5000/api/admin/${activeTab}/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${api.getToken()}`
          }
        });
        loadData();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const getItemDisplayName = (item: any) => {
    if (activeTab === 'quiz') {
      return item.question || 'Без вопроса';
    }
    switch (activeTab) {
      case 'performances':
        return item.title || 'Без названия';
      case 'artists': {
        const firstName = item.first_name || item.firstName || '';
        const lastName = item.last_name || item.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        if (fullName) return fullName;
        if (item.name) return item.name;
        return 'Без имени';
      }
      case 'glossary':
        return item.term || 'Без термина';
      case 'ballet':
        return item.name || 'Без названия';
      default:
        return 'Элемент';
    }
  };

  const getItemDescription = (item: any) => {
    if (activeTab === 'quiz') {
      const options = item.options?.map((o: any) => o.text).join(', ') || '';
      return `Варианты: ${options.substring(0, 100)}`;
    }
    switch (activeTab) {
      case 'performances':
        return item.short_description || item.description?.substring(0, 100) || '';
      case 'artists':
        return item.biography?.substring(0, 100) || item.role || '';
      case 'glossary':
        return item.definition?.substring(0, 100) || '';
      case 'ballet':
        return item.description?.substring(0, 100) || '';
      default:
        return '';
    }
  };

  const tabs = [
    { id: 'performances', label: 'Спектакли', icon: Theater },
    { id: 'artists', label: 'Артисты', icon: Users },
    { id: 'glossary', label: 'Словарь', icon: BookOpen },
    { id: 'ballet', label: 'Балет', icon: Sparkles },
    { id: 'quiz', label: 'Тест', icon: HelpCircle },
    { id: 'bingo', label: 'Бинго', icon: Grid },
  ];

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl mb-2">Админ-панель</h1>
          <p className="text-gray-400">Управление контентом</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-6 overflow-x-auto">
        <div className="flex gap-3">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#D4AF37] text-black' 
                    : 'bg-white/5 text-gray-400 border border-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bingo Editor */}
      {activeTab === 'bingo' && (
        <div className="px-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl text-white">Квадраты бинго</h2>
            {!isEditingBingo ? (
              <button
                onClick={() => setIsEditingBingo(true)}
                className="px-4 py-2 rounded-lg bg-[#D4AF37] text-black"
              >
                Редактировать
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditingBingo(false);
                    setTempBingoSquares([...bingoSquares]);
                  }}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white"
                >
                  Отмена
                </button>
                <button
                  onClick={saveBingoSquares}
                  className="px-4 py-2 rounded-lg bg-[#D4AF37] text-black"
                >
                  Сохранить
                </button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {(isEditingBingo ? tempBingoSquares : bingoSquares).map((square, index) => (
              <div key={index} className="relative">
                {isEditingBingo ? (
                  <input
                    type="text"
                    value={square}
                    onChange={(e) => {
                      const newSquares = [...tempBingoSquares];
                      newSquares[index] = e.target.value;
                      setTempBingoSquares(newSquares);
                    }}
                    className="w-full aspect-square p-2 rounded-lg bg-white/5 border border-white/10 text-white text-center text-sm focus:outline-none focus:border-[#D4AF37]"
                  />
                ) : (
                  <div className="w-full aspect-square p-2 rounded-lg bg-white/5 border border-white/10 text-white text-center text-sm flex items-center justify-center">
                    {square}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Button (for non-bingo tabs) */}
      {activeTab !== 'bingo' && (
        <div className="px-6 mb-6">
          <button
            onClick={() => {
              setEditingItem(null);
              setShowModal(true);
            }}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-[#D4AF37]/20 to-transparent border border-dashed border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/30 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Добавить
          </button>
        </div>
      )}

      {/* Items List (for non-bingo tabs) */}
      {activeTab !== 'bingo' && (
        <div className="px-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Нет данных. Нажмите "Добавить", чтобы создать первый элемент.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/30 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">
                      {getItemDisplayName(item)}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-1">
                      {getItemDescription(item)}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setShowModal(true);
                      }}
                      className="p-2 rounded-lg bg-white/10 hover:bg-[#D4AF37]/20 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-[#D4AF37]" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {showModal && activeTab !== 'bingo' && (
          <EditModal
            tab={activeTab}
            item={editingItem}
            onClose={() => {
              setShowModal(false);
              setEditingItem(null);
            }}
            onSave={handleSave}
            onUploadImage={handleUploadImage}
            uploadingImage={uploadingImage}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Компонент модального окна для редактирования
function EditModal({ tab, item, onClose, onSave, onUploadImage, uploadingImage }: any) {
  const [formData, setFormData] = useState<any>({});
  const [imagePreview, setImagePreview] = useState('');

  // Инициализация формы при открытии
  useEffect(() => {
    if (item) {
      if (tab === 'artists') {
        setFormData({
          first_name: item.first_name || item.firstName || '',
          last_name: item.last_name || item.lastName || '',
          role: item.role || '',
          category: item.category || 'Балет',
          biography: item.biography || '',
          image_url: item.image_url || item.imageUrl || '',
        });
        setImagePreview(item.image_url || item.imageUrl || '');
      } else if (tab === 'performances') {
        setFormData({
          title: item.title || '',
          type: item.type || 'Балет',
          description: item.description || '',
          short_description: item.short_description || item.shortDescription || '',
          duration: item.duration || '',
          date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
          time: item.time || '',
          image_url: item.image_url || item.imageUrl || '',
          is_featured: item.is_featured || false,
        });
        setImagePreview(item.image_url || item.imageUrl || '');
      } else if (tab === 'glossary') {
        setFormData({
          term: item.term || '',
          definition: item.definition || '',
        });
      } else if (tab === 'ballet') {
        setFormData({
          name: item.name || '',
          description: item.description || '',
          image_url: item.image_url || '',
        });
        setImagePreview(item.image_url || '');
      } else if (tab === 'quiz') {
        setFormData({
          question: item.question || '',
          options: item.options || [
            { text: '', value: 'Балет' },
            { text: '', value: 'Опера' },
            { text: '', value: 'Спектакль' }
          ],
        });
      }
    } else {
      // Пустая форма для нового элемента
      if (tab === 'artists') {
        setFormData({ first_name: '', last_name: '', role: '', category: 'Балет', biography: '', image_url: '' });
        setImagePreview('');
      } else if (tab === 'performances') {
        setFormData({ title: '', type: 'Балет', description: '', short_description: '', duration: '', date: '', time: '', image_url: '', is_featured: false });
        setImagePreview('');
      } else if (tab === 'glossary') {
        setFormData({ term: '', definition: '' });
      } else if (tab === 'ballet') {
        setFormData({ name: '', description: '', image_url: '' });
        setImagePreview('');
      } else if (tab === 'quiz') {
        setFormData({
          question: '',
          options: [
            { text: '', value: 'Балет' },
            { text: '', value: 'Опера' },
            { text: '', value: 'Спектакль' }
          ],
        });
      }
    }
  }, [item, tab]);

  const getImagePreviewUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return `http://localhost:5000/uploads/${url}`;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await onUploadImage(file);
      if (url) {
        setImagePreview(url);
        setFormData({ ...formData, image_url: url });
      }
    }
  };

  const updateOption = (index: number, field: string, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: '', value: 'Спектакль' }]
    });
  };

  const removeOption = (index: number) => {
    const newOptions = formData.options.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const getFields = () => {
    if (tab === 'quiz') {
      return (
        <>
          <textarea
            name="question"
            placeholder="Введите вопрос"
            rows={3}
            value={formData.question || ''}
            onChange={e => setFormData({ ...formData, question: e.target.value })}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#D4AF37]"
            required
          />
          <div className="space-y-3">
            <label className="text-sm text-gray-400">Варианты ответов:</label>
            {formData.options?.map((opt: any, idx: number) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Текст ответа"
                  value={opt.text}
                  onChange={e => updateOption(idx, 'text', e.target.value)}
                  className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#D4AF37]"
                  required
                />
                <select
                  value={opt.value}
                  onChange={e => updateOption(idx, 'value', e.target.value)}
                  className="w-32 p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="Балет" className="bg-zinc-900 text-white">Балет</option>
                  <option value="Опера" className="bg-zinc-900 text-white">Опера</option>
                  <option value="Спектакль" className="bg-zinc-900 text-white">Спектакль</option>
                </select>
                {formData.options.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="p-3 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="w-full p-2 rounded-lg border border-dashed border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
            >
              + Добавить вариант
            </button>
          </div>
        </>
      );
    }
    
    if (tab === 'performances') {
      return (
        <>
          <input 
            name="title" 
            placeholder="Название" 
            value={formData.title || ''} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#D4AF37]" 
            required 
          />
          <select 
            name="type" 
            value={formData.type || 'Балет'} 
            onChange={e => setFormData({...formData, type: e.target.value})} 
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="Балет" className="bg-zinc-900 text-white">Балет</option>
            <option value="Опера" className="bg-zinc-900 text-white">Опера</option>
            <option value="Спектакль" className="bg-zinc-900 text-white">Спектакль</option>
          </select>
          <textarea 
            name="description" 
            placeholder="Полное описание" 
            rows={6} 
            value={formData.description || ''} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#D4AF37]" 
          />
          <textarea 
            name="short_description" 
            placeholder="Краткое описание (отображается в списке)" 
            rows={2} 
            value={formData.short_description || ''} 
            onChange={e => setFormData({...formData, short_description: e.target.value})} 
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#D4AF37]" 
          />
          <input 
            name="duration" 
            placeholder="Длительность (например: 2 часа 30 минут)" 
            value={formData.duration || ''} 
            onChange={e => setFormData({...formData, duration: e.target.value})} 
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#D4AF37]" 
          />
          <input 
            type="date" 
            name="date" 
            value={formData.date || ''} 
            onChange={e => setFormData({...formData, date: e.target.value})} 
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#D4AF37]" 
          />
          <input 
            type="time" 
            name="time" 
            value={formData.time || ''} 
            onChange={e => setFormData({...formData, time: e.target.value})} 
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#D4AF37]" 
          />
          <label className="flex items-center gap-2 text-white cursor-pointer">
            <input 
              type="checkbox" 
              checked={formData.is_featured || false} 
              onChange={e => setFormData({...formData, is_featured: e.target.checked})} 
              className="w-4 h-4 accent-[#D4AF37]" 
            />
            <span>Рекомендуемый (показывать на главной)</span>
          </label>
        </>
      );
    }
    
    if (tab === 'artists') {
      return (
        <>
          <input
            name="first_name"
            placeholder="Имя"
            value={formData.first_name || ''}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#D4AF37]"
            required
          />
          <input
            name="last_name"
            placeholder="Фамилия"
            value={formData.last_name || ''}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#D4AF37]"
            required
          />
          <input
            name="role"
            placeholder="Должность"
            value={formData.role || ''}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#D4AF37]"
            required
          />
          <select
            name="category"
            value={formData.category || 'Балет'}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="Руководство" className="bg-zinc-900 text-white">Руководство</option>
            <option value="Балет" className="bg-zinc-900 text-white">Балет</option>
            <option value="Опера" className="bg-zinc-900 text-white">Опера</option>
            <option value="Хор" className="bg-zinc-900 text-white">Хор</option>
            <option value="Оркестр" className="bg-zinc-900 text-white">Оркестр</option>
          </select>
          <textarea
            name="biography"
            placeholder="Биография"
            rows={4}
            value={formData.biography || ''}
            onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#D4AF37]"
          />
        </>
      );
    }
    
    if (tab === 'glossary') {
      return (
        <>
          <input 
            name="term" 
            placeholder="Термин" 
            value={formData.term || ''} 
            onChange={e => setFormData({...formData, term: e.target.value})} 
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#D4AF37]" 
            required 
          />
          <textarea 
            name="definition" 
            placeholder="Определение" 
            rows={4} 
            value={formData.definition || ''} 
            onChange={e => setFormData({...formData, definition: e.target.value})} 
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#D4AF37]" 
            required 
          />
        </>
      );
    }
    
    if (tab === 'ballet') {
      return (
        <>
          <input 
            name="name" 
            placeholder="Название" 
            value={formData.name || ''} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#D4AF37]" 
            required 
          />
          <textarea 
            name="description" 
            placeholder="Описание" 
            rows={4} 
            value={formData.description || ''} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#D4AF37]" 
            required 
          />
        </>
      );
    }
    
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl text-white">{item ? 'Редактировать' : 'Добавить'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Upload - только для типов с изображениями */}
        {(tab === 'performances' || tab === 'artists' || tab === 'ballet') && (
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Изображение</label>
            <div className="flex gap-3 items-start">
              {imagePreview ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                  <img 
                    src={getImagePreviewUrl(imagePreview)} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/200x200/333/white?text=Нет+изображения';
                    }}
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg bg-white/5 border border-dashed border-white/10 flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-8 h-8 text-gray-500" />
                </div>
              )}
              <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                <ImageIcon className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-sm text-white">{uploadingImage ? 'Загрузка...' : imagePreview ? 'Изменить' : 'Загрузить'}</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploadingImage} />
              </label>
            </div>
          </div>
        )}

        {/* Dynamic Fields */}
        <div className="space-y-3 mb-6">
          {getFields()}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 p-3 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 transition-colors">
            Отмена
          </button>
          <button onClick={() => onSave(formData)} className="flex-1 p-3 rounded-lg bg-[#D4AF37] text-black flex items-center justify-center gap-2 hover:bg-[#B8941F] transition-colors">
            <Save className="w-4 h-4" />
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}