import { useState, useEffect } from 'react';
import { X, LogIn, LogOut, CheckCircle2, User as UserIcon } from 'lucide-react';
import { auth, loginWithGoogle, logoutUser } from '../services/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      setIsLoading(false);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('تعذر تسجيل الدخول، يرجى المحاولة مجدداً');
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-sm bg-[#FAF9F5] border border-[#DDD5C5] rounded-3xl p-6 shadow-2xl text-right space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* زر الإغلاق */}
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute top-4 left-4 p-2 text-[#7A6F5D] hover:text-[#1A1713] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* رأس النافذة */}
        <div className="text-center pt-2 space-y-1">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-[#DDD5C5] flex items-center justify-center shadow-xs text-[#8C6819]">
            <UserIcon className="w-7 h-7" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#1A1713] font-arabic-luxury">
            تسجيل الدخول
          </h3>
          <p className="text-xs text-[#7A6F5D]">
            متجر الطاهرون للثوب الإسلامي - تاوقريت، الشلف
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-center font-bold">
            {errorMsg}
          </div>
        )}

        {/* حالة المستخدم: مسجل دخول أم لا */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-white border border-[#DDD5C5] rounded-2xl flex items-center gap-3">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-11 h-11 rounded-full object-cover border border-[#DDD5C5]"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-[#1A1713] text-white flex items-center justify-center font-bold">
                  {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تم تسجيل الدخول بنجاح</span>
                </div>
                <p className="text-sm font-bold text-[#1A1713] truncate">
                  {currentUser.displayName || 'زبون مميز'}
                </p>
                <p className="text-xs text-[#7A6F5D] truncate font-mono">
                  {currentUser.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-white border-2 border-[#1A1713] text-[#1A1713] hover:bg-[#1A1713] hover:text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer group"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'جاري الاتصال...' : 'المتابعة بحساب Google'}</span>
            </button>
            <p className="text-[11px] text-[#8A7C64] text-center leading-relaxed">
              تسجيل الدخول يتيح لك متابعة طلباتك والاستفادة من عروض الطاهرون الخاصة.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
