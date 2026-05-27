import { Home, Calendar, Users, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';

export function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/home', icon: Home, label: 'Главная' },
    { path: '/repertoire', icon: Calendar, label: 'Репертуар' },
    { path: '/artists', icon: Users, label: 'Коллектив' },
    { path: '/profile', icon: User, label: 'Профиль' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-[#D4AF37]/20 z-50 pb-safe">
      <div className="max-w-[428px] mx-auto px-6 py-2">
        <div className="flex justify-between items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link key={item.path} to={item.path} className="relative flex flex-col items-center gap-1 py-2 px-3">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="relative"
                >
                  <Icon
                    className={`w-6 h-6 transition-colors ${
                      isActive ? 'text-[#D4AF37]' : 'text-gray-400'
                    }`}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#D4AF37]"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.div>
                <span
                  className={`text-xs transition-colors ${
                    isActive ? 'text-[#D4AF37]' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}