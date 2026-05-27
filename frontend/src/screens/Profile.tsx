import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Heart, LogOut, ChevronRight, Mail, Edit2, X, Shield, Phone, Check, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';

export function Profile() {
  const navigate = useNavigate();
  const { user, isLoading, login, register, logout, updateProfile, loadUser } = useAuthStore();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  
  // Auth form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  // Согласие на обработку данных
  const [consentGiven, setConsentGiven] = useState(false);
  const [consentError, setConsentError] = useState('');

  // Загружаем пользователя при монтировании
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Форматирование телефона при вводе
  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    let formatted = '';
    if (cleaned.length <= 11) {
      if (cleaned.startsWith('7') || cleaned.startsWith('8')) {
        formatted = '+' + cleaned;
      } else if (cleaned.length > 0) {
        formatted = '+7' + cleaned;
      }
    }
    setPhone(formatted);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setConsentError('');
    setIsAuthLoading(true);
    
    if (!isLoginMode && !consentGiven) {
      setConsentError('Необходимо дать согласие на обработку персональных данных');
      setIsAuthLoading(false);
      return;
    }
    
    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await register(email, password, firstName, lastName, phone || undefined);
      }
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setPhone('');
      setConsentGiven(false);
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(editFirstName, editLastName, editPhone || undefined, editEmail || undefined);
      setShowEditModal(false);
      // Обновляем локальные состояния после сохранения
      loadUser();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/home');
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `+${cleaned[0]} ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)}`;
    }
    return phone;
  };

  // Открываем модальное окно с текущими данными
  const openEditModal = () => {
    setEditFirstName(user?.firstName || user?.name?.split(' ')[0] || '');
    setEditLastName(user?.lastName || (user?.name?.split(' ')[1] || ''));
    setEditPhone(user?.phone || '');
    setEditEmail(user?.email || '');
    setShowEditModal(true);
  };

  // Состояние загрузки
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  // Неавторизованный пользователь
  if (!user) {
    return (
      <div className="pb-24 min-h-screen">
        <div className="px-6 pt-12 pb-6">
          <h1 className="text-3xl mb-2">Профиль</h1>
          <p className="text-gray-400">Войдите или зарегистрируйтесь</p>
        </div>

        <div className="px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 via-[#D4AF37]/5 to-transparent border border-[#D4AF37]/30 p-8"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-[#D4AF37]" />
              </div>
              <h2 className="text-2xl mb-2">Добро пожаловать!</h2>
              <p className="text-gray-400 text-sm">Войдите или зарегистрируйтесь</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 pl-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37]"
                  required
                  disabled={isAuthLoading}
                />
              </div>

              {!isLoginMode && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Имя"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37]"
                      required
                      disabled={isAuthLoading}
                    />
                    <input
                      type="text"
                      placeholder="Фамилия"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37]"
                      required
                      disabled={isAuthLoading}
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="Телефон (необязательно)"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="w-full p-4 pl-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37]"
                      disabled={isAuthLoading}
                    />
                  </div>
                </>
              )}

              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37]"
                required
                disabled={isAuthLoading}
              />

              {!isLoginMode && (
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setConsentGiven(!consentGiven)}
                    className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center transition-colors ${
                      consentGiven ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-white/30 bg-transparent'
                    }`}
                    disabled={isAuthLoading}
                  >
                    {consentGiven && <Check className="w-3 h-3 text-black" />}
                  </button>
                  <label className="text-sm text-gray-300 leading-relaxed cursor-pointer" onClick={() => !isAuthLoading && setConsentGiven(!consentGiven)}>
                    Я принимаю условия <span className="text-[#D4AF37]">Пользовательского соглашения</span> и даю согласие на обработку моих персональных данных в соответствии с <span className="text-[#D4AF37]">Политикой конфиденциальности</span>
                  </label>
                </div>
              )}

              {(consentError || authError) && (
                <p className="text-red-400 text-sm text-center">{consentError || authError}</p>
              )}

              <Button type="submit" className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-black h-12" disabled={isAuthLoading}>
                {isAuthLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  isLoginMode ? 'Войти' : 'Зарегистрироваться'
                )}
              </Button>

              <p className="text-center text-sm text-gray-400">
                {isLoginMode ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setAuthError('');
                    setConsentError('');
                    setConsentGiven(false);
                  }}
                  className="ml-2 text-[#D4AF37] hover:underline"
                  disabled={isAuthLoading}
                >
                  {isLoginMode ? 'Зарегистрироваться' : 'Войти'}
                </button>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  // Авторизованный пользователь
  const userFirstName = user.firstName || (user.name?.split(' ')[0] || '');
  const userLastName = user.lastName || (user.name?.split(' ')[1] || '');

  return (
    <div className="pb-24 min-h-screen">
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-3xl mb-2">Профиль</h1>
      </div>

      <div className="px-6 mb-8">
        <motion.div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 via-[#D4AF37]/5 to-transparent border border-[#D4AF37]/30">
          <div className="relative p-8">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-[#D4AF37] blur-2xl opacity-40 rounded-full" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center ring-4 ring-[#D4AF37]/20">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={userFirstName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-black">
                      {userFirstName?.charAt(0).toUpperCase() || 'П'}
                    </span>
                  )}
                </div>
                <button
                  onClick={openEditModal}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center"
                >
                  <Edit2 className="w-4 h-4 text-black" />
                </button>
              </div>
              <h2 className="text-2xl mb-1">
                {userFirstName} {userLastName}
              </h2>
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Phone className="w-4 h-4" />
                  <span>{formatPhone(user.phone)}</span>
                </div>
              )}
              {user.role === 'admin' && (
                <div className="mt-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-xs">
                  Администратор
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-6 mb-6">
        <div className="space-y-2">
          <Link to="/favorites">
            <motion.div whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-[#D4AF37]/30 transition-colors">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-[#D4AF37]" />
                <span>Избранное</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.div>
          </Link>

          {user.role === 'admin' && (
            <Link to="/admin">
              <motion.div whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-[#D4AF37]" />
                  <span>Админ-панель</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </motion.div>
            </Link>
          )}
        </div>
      </div>

      <div className="px-6">
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Выйти</span>
        </button>
      </div>

      <div className="px-6 mt-8 text-center">
        <p className="text-xs text-gray-500">Театр оперы и балета им. Д.К. Сивцева – Суоруна Омоллоона</p>
        <p className="text-xs text-gray-500 mt-1">Version 1.0.0</p>
      </div>

      {/* Модальное окно редактирования профиля */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-[#D4AF37]/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-white">Редактировать профиль</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateProfile}>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <input
                  type="text"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#D4AF37] placeholder:text-gray-500"
                  placeholder="Имя"
                  required
                />
                <input
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#D4AF37] placeholder:text-gray-500"
                  placeholder="Фамилия"
                  required
                />
              </div>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white mb-4 focus:outline-none focus:border-[#D4AF37] placeholder:text-gray-500"
                placeholder="Email"
                required
              />
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white mb-4 focus:outline-none focus:border-[#D4AF37] placeholder:text-gray-500"
                placeholder="Телефон"
              />
              <Button type="submit" className="w-full bg-[#D4AF37] text-black">
                Сохранить
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}