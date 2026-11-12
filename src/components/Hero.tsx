import { ArrowDown } from 'lucide-react';
import { StoreSettings } from '../types/store';

interface HeroProps {
  settings: StoreSettings;
  onExploreClick: () => void;
}

export function Hero({ settings, onExploreClick }: HeroProps) {
  return (
    // تعريض الـ Hero ليمتد بعرض أوسع مع حواف دائرية
    <div className="w-full max-w-[1560px] mx-auto px-2 sm:px-4 lg:px-6 pt-2 pb-3">
      {/* Hero Section */}
      <section className="relative h-[46vh] sm:h-[60vh] min-h-[340px] sm:min-h-[440px] max-h-[580px] w-full flex items-end justify-start overflow-hidden rounded-[24px] sm:rounded-[40px] lg:rounded-[48px] border border-[#E5DECD] shadow-sm bg-[#1A1713]">
        {/* Background High-Fidelity Photography Asset */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_luxury_islamic_clothing_1793266734202.jpg"
            alt="الأزياء الإسلامية الرجالية الفاخرة - الطاهرون"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-[0.82] contrast-[1.05]"
          />
          {/* Measured Scrim for contrast especially towards bottom-right */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-transparent to-transparent" />
        </div>

        {/* كتلة النصوص وزر اكتشف منتجاتنا معاً في أسفل الـ Hero من اليمين */}
        <div className="relative z-10 p-5 sm:p-9 lg:p-11 text-right flex flex-col items-start max-w-2xl">
          {/* Store Name: الطاهرون للثوب الإسلامي */}
          <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#DFC17B] uppercase mb-1 sm:mb-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {settings.storeName}
          </span>

          {/* Short Headline: الأناقة تبدأ من الطاهرون */}
          <h1 className="text-xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-arabic-luxury mb-4 sm:mb-5 leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            الأناقة تبدأ من{' '}
            <span className="text-gold-gradient inline-block font-extrabold">
              الطاهرون
            </span>
          </h1>

          {/* زر اكتشف منتجاتنا: خلفية بلون الموقع وكتابة بالأسود */}
          <button
            type="button"
            onClick={onExploreClick}
            className="group relative inline-flex items-center gap-2.5 px-6 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-[#1A1713] bg-[#FAF9F5] hover:bg-[#F3EFE6] border border-[#DDD5C5] rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden"
          >
            <span className="font-arabic-luxury tracking-wide text-[#1A1713]">
              اكتشف منتجاتنا
            </span>
            <ArrowDown className="w-4 h-4 text-[#1A1713] transition-transform duration-200 group-hover:translate-y-0.5 stroke-[2.5]" />
          </button>
        </div>
      </section>
    </div>
  );
}
