import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Product } from '../types/store';
import { formatPriceDZD } from '../services/storeStorage';

interface ProductCardProps {
  product: Product;
  onViewProduct: (product: Product) => void;
  onDirectOrder?: (product: Product) => void;
}

export function ProductCard({
  product,
  onViewProduct
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    // مظهر نقي وبدون إطار بطاقة: الصورة والنصوص موضوعة مباشرة فوق خلفية المتجر
    <article
      onClick={() => onViewProduct(product)}
      className="group bg-transparent flex flex-col cursor-pointer transition-all duration-200"
    >
      {/* صورة المنتج بارتفاع أطول بنسبة 30% بحواف دائرية أنيقة */}
      <div className="relative aspect-[3/4] w-full bg-[#F3EFE6] rounded-2xl overflow-hidden border border-[#E8E2D4] group-hover:border-[#C8A64D] transition-all duration-300">
        {(!imageLoaded || imageError) && (
          <div className="absolute inset-0 bg-[#EDE7D8] flex flex-col items-center justify-center p-4 text-center">
            <Sparkles className="w-5 h-5 text-[#8C6819] mb-1" />
            <span className="text-[11px] text-[#635745] line-clamp-1">{product.nameAr}</span>
          </div>
        )}

        {!imageError && (
          <img
            src={product.image}
            alt={product.nameAr}
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-104 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* حالة نفاذ المخزون */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-20">
            <span className="text-[11px] font-bold text-rose-700 border border-rose-300 bg-rose-50 px-2.5 py-1 rounded">
              نفذ من المخزون
            </span>
          </div>
        )}
      </div>

      {/* تفاصيل المنتج: مباشرة فوق الخلفية وبدون أي إطار أو خلفية بيضاء */}
      <div className="pt-2.5 pb-1 px-1 flex items-start justify-between gap-2 text-right">
        {/* اسم المنتج في اليمين */}
        <h3 className="text-sm sm:text-base font-bold text-[#1A1713] font-arabic-luxury group-hover:text-[#8C6819] transition-colors line-clamp-2 leading-snug flex-1">
          {product.nameAr}
        </h3>

        {/* السعر في الجهة اليسرى: السعر الأصلي وأسفله السعر المشطوب بحجم صغير */}
        <div className="flex flex-col items-end text-left shrink-0">
          <span className="text-sm sm:text-base font-bold font-mono text-[#8C6819] tabular-nums leading-tight">
            {formatPriceDZD(product.priceDZD)}
          </span>
          {product.originalPriceDZD && (
            <span className="text-[10px] sm:text-xs text-[#998E7B] line-through font-mono tabular-nums leading-tight mt-0.5">
              {formatPriceDZD(product.originalPriceDZD)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
