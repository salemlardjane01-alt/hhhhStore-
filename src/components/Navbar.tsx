import { Search, Menu } from 'lucide-react';
import { Category, StoreSettings } from '../types/store';

interface NavbarProps {
  settings: StoreSettings;
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  onOpenSearch: () => void;
  onOpenMenu: () => void;
}

export function Navbar({
  settings,
  categories,
  selectedCategoryId,
  onSelectCategory,
  onOpenSearch,
  onOpenMenu
}: NavbarProps) {
  return (
    // شريط علوي شفاف بنسبة معينة وبدون أي خطوط فاصلة أو مفاصل
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#E8E2D4]/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* السطر الأول: اسم وشعار البراند على اليمين، وأيقونتا البحث والقائمة على اليسار (مباشرة فوق الشريط بدون مربعات) */}
        <div className="flex items-center justify-between pt-2.5 pb-1">
          {/* Brand Logo & Name */}
          <a
            href="#"
            className="flex items-center gap-2 sm:gap-2.5 text-base sm:text-lg font-bold tracking-tight text-[#1A1713] whitespace-nowrap group"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 relative flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full transition-transform duration-200 group-hover:scale-105"
                fill="none"
              >
                <defs>
                  <linearGradient id="navBrandGradClear2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#DFBF75" />
                    <stop offset="50%" stopColor="#C8A64D" />
                    <stop offset="100%" stopColor="#8C6E2D" />
                  </linearGradient>
                </defs>
                <path
                  d="M50 2 L62 26 L88 12 L74 38 L98 50 L74 62 L88 88 L62 74 L50 98 L38 74 L12 88 L26 62 L2 50 L26 38 L12 12 L38 26 Z"
                  fill="#231E15"
                  stroke="url(#navBrandGradClear2)"
                  strokeWidth="2.5"
                />
                <circle cx="50" cy="50" r="16" fill="#18140E" stroke="url(#navBrandGradClear2)" strokeWidth="1" />
                <path
                  d="M45 42 L45 56 M45 49 C47 44 55 44 57 49 C58 54 52 56 42 56"
                  stroke="url(#navBrandGradClear2)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="font-arabic-luxury text-[#1A1713] font-bold text-base sm:text-lg">
              {settings.storeName}
            </span>
          </a>

          {/* زر البحث وأيقونة القائمة جنباً إلى جنب مباشرة فوق الشريط بدون مربعات */}
          <div className="flex items-center gap-2 shrink-0">
            {/* أيقونة البحث */}
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="البحث"
              title="البحث عن منتج"
              className="p-1.5 text-[#1A1713] hover:text-[#8C6819] transition-colors cursor-pointer active:scale-95"
            >
              <Search className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* أيقونة القائمة المنسحبة بجانب البحث */}
            <button
              type="button"
              onClick={onOpenMenu}
              aria-label="القائمة"
              title="القائمة"
              className="p-1.5 text-[#1A1713] hover:text-[#8C6819] transition-colors cursor-pointer active:scale-95"
            >
              <Menu className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* الكاتيڨوري: واضحة وبارزة كأسماء نقية بدون مستطيلات وبدون أي خط فاصل */}
        <div className="overflow-x-auto scrollbar-none pb-2 pt-1">
          <nav className="flex items-center justify-start sm:justify-center gap-5 sm:gap-7 min-w-max px-1">
            {categories.map((cat) => {
              const isActive = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className={`text-xs sm:text-sm tracking-wide transition-all duration-200 whitespace-nowrap cursor-pointer py-1 ${
                    isActive
                      ? 'text-[#8C6819] font-bold'
                      : 'text-[#5A503F] hover:text-[#1A1713] font-medium'
                  }`}
                >
                  <span>{cat.nameAr}</span>
                  {isActive && (
                    <span className="block h-0.5 bg-[#C8A64D] rounded-full mt-0.5" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

      </div>
    </header>
  );
}
