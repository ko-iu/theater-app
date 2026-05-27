import { motion } from 'motion/react';
import { X, Building2, Calendar, Users, Award } from 'lucide-react';
import { Logo } from '../components/Logo';

interface TheaterInfoProps {
  onClose: () => void;
}

export function TheaterInfo({ onClose }: TheaterInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center px-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-gradient-to-br from-zinc-900 to-black border border-[#D4AF37]/30 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Logo */}
        <div className="mb-6">
          <Logo showSubtitle />
        </div>

        {/* Theater Info */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl mb-3 text-[#D4AF37]">О Театре</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Государственный Театр оперы и балета Республики Саха (Якутия) имени Д.К. Сивцева-Суоруна Омоллоона – первый  стационарный театр оперы и балета в Дальневосточном Федеральном округе, входит в Ассоциацию музыкальных театров России, международную Федерацию балетных конкурсов.
              Театр оперы и балета ведет свой отсчет с 7 октября 1971 г., когда Якутский государственный музыкально-драматический театр им. П.А.Ойунского был реорганизован в два самостоятельных коллектива: Якутский государственный драматический театр им. П.А. Ойунского и Якутский государственный Музыкальный театр.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
              <Calendar className="w-6 h-6 text-[#D4AF37] mb-2" />
              <p className="text-xs text-gray-400 mb-1">Основан</p>
              <p className="text-sm">1971 год</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
              <Building2 className="w-6 h-6 text-[#D4AF37] mb-2" />
              <p className="text-xs text-gray-400 mb-1">Тип</p>
              <p className="text-sm">Государственный</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/30">
            <Users className="w-6 h-6 text-[#D4AF37] mb-2" />
            <h3 className="text-sm mb-2">Директор</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Лёвочкин Владислав Валерьевич
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/30">
            <Award className="w-6 h-6 text-[#D4AF37] mb-2" />
            <h3 className="text-sm mb-2">Достижения</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Этнобалет «Сияющий камень» победитель в номинациях в Национальной театральной премии «Золотая маска».
              Опера-олонхо «Ньургун Боотур» и спектакль «Зори здесь тихие» стали лауреатами всероссийских конкурсов.
              Балет «Подвиг» отмечен наградой Министерства обороны РФ.
              Главный балетмейстер Екатерина Тайшина получила приз «Душа танца», солистка оперы Екатерина Захарова удостоилась звания заслуженная артистка РС (Я) и блистала на премии «Онегин». Звания заслуженных артистов были присвоены Марии Кузьминой, Валерию Аргунову и многим другим нашим героям!
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400 text-center">
              Продолжая традиции мирового театрального искусства
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
