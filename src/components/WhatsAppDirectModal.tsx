import { useState } from 'react';
import { X, MessageCircle, Send } from 'lucide-react';
import { Product, ProductColor, StoreSettings } from '../types/store';
import { formatPriceDZD, buildWhatsAppLink } from '../services/storeStorage';

interface WhatsAppDirectModalProps {
  product: Product | null;
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsAppDirectModal({
  product,
  settings,
  isOpen,
  onClose
}: WhatsAppDirectModalProps) {
  if (!isOpen || !product) return null;

  const [customerName, setCustomerName] = useState('');
  const [customerWilaya, setCustomerWilaya] = useState(settings.wilaya);
  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'قياسي'
  );
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    product.colors && product.colors.length > 0
      ? product.colors[0]
      : { name: 'الأصلي', hex: '#FFFFFF' }
  );

  const formattedMsg = `السلام عليكم ورحمة الله،
أود طلب المنتج من متجر الطاهرون للثوب الإسلامي (تاوقريت، الشلف):

• المنتج: ${product.nameAr}
• السعر: ${formatPriceDZD(product.priceDZD)}
• المقاس: ${selectedSize}
• اللون: ${selectedColor.name}
${customerName ? `• الاسم: ${customerName}` : ''}
${customerWilaya ? `• الولاية: ${customerWilaya}` : ''}

يرجى إفادتي بإمكانية الشحن وتأكيد الطلب. شكراً لكم.`;

  const waUrl = buildWhatsAppLink(settings.whatsappNumber, formattedMsg);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FAF9F5] border border-[#C8A64D]/50 rounded-2xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.2)] space-y-5 text-right">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-[#666] hover:text-[#111] rounded-full bg-[#FFFFFF] border border-[#DDD5C5]"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#E8E2D4] pb-4">
          <div className="w-10 h-10 rounded-full bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center text-[#25D366]">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1A1713] font-arabic-luxury">
              طلب مباشر عبر واتساب
            </h3>
            <p className="text-xs text-[#7A7160]">
              سيتم فتح محادثة واتساب مع متجر «{settings.storeName}» فوراً
            </p>
          </div>
        </div>

        {/* Product snapshot */}
        <div className="flex items-center gap-4 p-3 bg-[#FFFFFF] border border-[#DDD5C5] rounded-xl shadow-2xs">
          <img
            src={product.image}
            alt={product.nameAr}
            referrerPolicy="no-referrer"
            className="w-16 h-16 object-cover rounded-lg border border-[#DDD5C5]"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-[#1A1713] line-clamp-1">
              {product.nameAr}
            </h4>
            <p className="text-sm font-bold text-gold-gradient font-mono">
              {formatPriceDZD(product.priceDZD)}
            </p>
          </div>
        </div>

        {/* Quick customization: Size & Color */}
        <div className="grid grid-cols-2 gap-3">
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="block text-xs text-[#615746] mb-1.5 font-medium">المقاس:</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#DDD5C5] text-xs text-[#1A1713] rounded-lg p-2.5 focus:border-[#C8A64D] focus:outline-none"
              >
                {product.sizes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {product.colors && product.colors.length > 0 && (
            <div>
              <label className="block text-xs text-[#615746] mb-1.5 font-medium">اللون:</label>
              <select
                value={selectedColor.name}
                onChange={(e) => {
                  const found = product.colors.find((c) => c.name === e.target.value);
                  if (found) setSelectedColor(found);
                }}
                className="w-full bg-[#FFFFFF] border border-[#DDD5C5] text-xs text-[#1A1713] rounded-lg p-2.5 focus:border-[#C8A64D] focus:outline-none"
              >
                {product.colors.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#615746] mb-1 font-medium">اسمك الكريم (اختياري):</label>
            <input
              type="text"
              placeholder="مثال: محمد الجزائري"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#DDD5C5] text-xs text-[#1A1713] rounded-lg p-2.5 focus:border-[#C8A64D] focus:outline-none placeholder-[#999]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#615746] mb-1 font-medium">الولاية / المدينة:</label>
            <input
              type="text"
              placeholder="مثال: الشلف، وهران، العاصمة..."
              value={customerWilaya}
              onChange={(e) => setCustomerWilaya(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#DDD5C5] text-xs text-[#1A1713] rounded-lg p-2.5 focus:border-[#C8A64D] focus:outline-none placeholder-[#999]"
            />
          </div>
        </div>

        {/* Preview of pre-filled text */}
        <div className="p-3 bg-[#FFFFFF] border border-[#DDD5C5] rounded-lg">
          <span className="block text-[10px] text-[#7A7160] mb-1 font-medium">معاينة الرسالة الجاهزة للإرسال:</span>
          <p className="text-[11px] text-[#524939] font-mono whitespace-pre-line leading-relaxed max-h-24 overflow-y-auto">
            {formattedMsg}
          </p>
        </div>

        {/* Open WhatsApp Button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white hover:brightness-105 active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(37,211,102,0.3)]"
        >
          <Send className="w-4 h-4" />
          <span>إرسال الطلب عبر تطبيق واتساب</span>
        </a>
      </div>
    </div>
  );
}
