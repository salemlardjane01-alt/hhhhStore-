import { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowLeft } from 'lucide-react';
import { Product } from '../types/store';
import { formatPriceDZD } from '../services/storeStorage';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onFilterByCategory: (categoryId: string) => void;
}

export function SearchModal({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  onFilterByCategory
}: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = searchTerm.trim()
    ? products.filter((p) => {
        const q = searchTerm.trim().toLowerCase();
        return (
          p.nameAr.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.descriptionAr.toLowerCase().includes(q) ||
          (p.fabricAr && p.fabricAr.toLowerCase().includes(q))
        );
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FAF9F5] border border-[#C8A64D]/50 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden text-right">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E8E2D4] flex items-center gap-3 bg-[#FFFFFF]">
          <Search className="w-5 h-5 text-[#8C6819] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث بالاسم، القماش، أو النوع (مثل: ثوب سعودي، قميص أسود، عود، ختان)..."
            className="flex-1 bg-transparent text-sm sm:text-base text-[#1A1713] placeholder-[#8A806D] focus:outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="p-1 text-[#888] hover:text-[#111]"
              aria-label="مسح"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-[#DDD5C5] text-xs font-semibold text-[#554D3F] hover:bg-[#FAF9F5]"
          >
            إلغاء
          </button>
        </div>

        {/* Results or Suggestions Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-5">
          {searchTerm.trim() ? (
            results.length > 0 ? (
              <div className="space-y-2.5">
                <span className="block text-xs font-semibold text-[#8C6819] mb-2">
                  تم العثور على {results.length} منتج:
                </span>
                {results.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="p-3 bg-[#FFFFFF] border border-[#E8E2D4] hover:border-[#C8A64D] rounded-xl flex items-center gap-3.5 cursor-pointer transition-all hover:shadow-xs group"
                  >
                    <img
                      src={product.image}
                      alt={product.nameAr}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 object-cover rounded-lg border border-[#DDD5C5] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#1A1713] group-hover:text-[#8C6819] transition-colors line-clamp-1">
                        {product.nameAr}
                      </h4>
                      <p className="text-xs font-mono font-bold text-gold-gradient mt-0.5">
                        {formatPriceDZD(product.priceDZD)}
                      </p>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-[#8C6819] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#776E5E]">
                لا توجد منتجات مطابقة لبحثك «{searchTerm}»
              </div>
            )
          ) : (
            <div className="space-y-4 py-2">
              <span className="block text-xs font-semibold text-[#7A7160]">
                عمليات بحث شائعة في المتجر:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {['ثوب ملكي', 'قميص إماراتي', 'طقم ختان', 'عود ملكي', 'سبحة كهرمان', 'نقاب كوري'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setSearchTerm(term)}
                    className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#DDD5C5] text-xs text-[#4A4132] hover:border-[#C8A64D] hover:text-[#8C6819] transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
