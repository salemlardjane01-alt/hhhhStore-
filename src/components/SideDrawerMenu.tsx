import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { StoreSettings } from '../types/store';
import { auth } from '../services/firebase';

interface SideDrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: StoreSettings;
  onOpenAuth: () => void;
  onOpenContact: () => void;
  onOpenAdmin?: () => void;
}

const ADMIN_EMAIL = 'salemlardjane01@gmail.com';

export function SideDrawerMenu({
  isOpen,
  onClose,
  onOpenAuth,
  onOpenContact,
  onOpenAdmin
}: SideDrawerMenuProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  // Track Firebase Auth user state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isAdmin = currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <>
      {/* خلفية معتمة عند فتح القائمة */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* القائمة المنسحبة من اليسار إلى غاية منتصف الصفحة تماماً بلون خلفية عاجي (#F7F4EA) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-1/2 min-w-[180px] bg-[#F7F4EA] border-r border-[#E0D7C6] shadow-2xl flex flex-col transition-transform duration-300 ease-out text-right ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="القائمة الجانبية"
      >
        {/* زر الإغلاق في الأعلى بدون أي عنوان */}
        <div className="p-4 sm:p-5 flex items-center justify-start">
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق القائمة"
            className="p-1.5 sm:p-2 rounded-xl bg-white/70 hover:bg-white border border-[#DDD5C5] text-[#1A1713] hover:text-[#8C6819] transition-all cursor-pointer shadow-2xs"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* محتوى القائمة: الخيارات بحجم خط أصغر مع سطر رقيق أسفل كل منها */}
        <div className="px-4 sm:px-7 py-2 space-y-3.5 text-right flex-1">
          {/* 1. عنوان: تسجيل الدخول */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAuth();
            }}
            className="text-right font-bold text-sm sm:text-base text-[#1A1713] hover:text-[#8C6819] font-arabic-luxury transition-colors py-1.5 cursor-pointer block w-full select-none"
          >
            تسجيل الدخول
          </button>

          {/* سطر رقيق أسفل تسجيل الدخول */}
          <div className="h-px bg-[#E2DAC9]/80 w-full" />

          {/* 2. عنوان: إتصل بنا */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenContact();
            }}
            className="text-right font-bold text-sm sm:text-base text-[#1A1713] hover:text-[#8C6819] font-arabic-luxury transition-colors py-1.5 cursor-pointer block w-full select-none"
          >
            إتصل بنا
          </button>

          {/* سطر رقيق أسفل إتصل بنا مثل سطر تسجيل الدخول */}
          <div className="h-px bg-[#E2DAC9]/80 w-full" />

          {/* 3. خيار يظهر فقط عند تسجيل الدخول بحساب salemlardjane01@gmail.com */}
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenAdmin) onOpenAdmin();
                }}
                className="text-right font-bold text-sm sm:text-base text-[#8C6819] hover:text-[#A37B24] font-arabic-luxury transition-colors py-1.5 cursor-pointer block w-full select-none"
              >
                إدارة المنتجات
              </button>

              {/* سطر رقيق أسفل إدارة المنتجات */}
              <div className="h-px bg-[#E2DAC9]/80 w-full" />
            </>
          )}
        </div>
      </aside>
    </>
  );
}
