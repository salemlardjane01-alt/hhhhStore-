import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  Plus,
  Minus,
  MessageCircle,
  Check,
  Home,
  Building2
} from 'lucide-react';
import { Product, ProductColor, StoreSettings, CodOrder } from '../types/store';
import { ALGERIA_WILAYAS } from '../data/initialData';
import { getCommunesForWilaya } from '../data/algerianCommunes';
import { formatPriceDZD, saveCodOrder, buildWhatsAppLink } from '../services/storeStorage';

interface ProductLandingPageProps {
  product: Product;
  settings: StoreSettings;
  onBack: () => void;
  onOpenWhatsAppModal?: (product: Product) => void;
}

export function ProductLandingPage({
  product,
  settings,
  onBack
}: ProductLandingPageProps) {
  // Scroll to top on mount or when product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  // Gallery images: primary + secondary images
  const allImages = [
    product.image,
    ...(product.additionalImages && product.additionalImages.length > 0
      ? product.additionalImages.filter((img) => img !== product.image)
      : [
          '/src/assets/images/hero_luxury_islamic_clothing_1793266734202.jpg',
          '/src/assets/images/product_qamis_emirati_black_1793266735856.jpg',
          '/src/assets/images/product_oud_perfume_luxury_1793266736317.jpg'
        ].filter((img) => img !== product.image))
  ];

  const [activeImage, setActiveImage] = useState<string>(product.image);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'قياسي'
  );
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    product.colors && product.colors.length > 0
      ? product.colors[0]
      : { name: 'الأصلي', hex: '#FFFFFF' }
  );

  // COD Form States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilaya, setWilaya] = useState('02 - الشلف');
  const availableCommunes = getCommunesForWilaya(wilaya);
  const [baladiya, setBaladiya] = useState(availableCommunes[0] || 'تاوقريت (مقر المتجر)');
  const [deliveryType, setDeliveryType] = useState<'المنزل' | 'المكتب'>('المنزل');
  const [quantity, setQuantity] = useState(1);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<CodOrder | null>(null);

  const orderFormRef = useRef<HTMLDivElement>(null);

  // تحديث البلدية المحددة تلقائياً عند تغيير الولاية
  useEffect(() => {
    const communes = getCommunesForWilaya(wilaya);
    if (!communes.includes(baladiya)) {
      setBaladiya(communes[0] || '');
    }
  }, [wilaya]);

  // Delivery fee calculation (Free for Chlef 02, 500 DZD for other wilayas)
  const isChlef = wilaya.startsWith('02');
  const shippingDZD = isChlef ? 0 : 500;
  const subtotalDZD = product.priceDZD * quantity;
  const totalDZD = subtotalDZD + shippingDZD;

  const handleQuantityChange = (delta: number) => {
    const next = quantity + delta;
    if (next >= 1 && next <= 10) {
      setQuantity(next);
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      errors.fullName = 'يرجى كتابة الاسم واللقب الكامل (على الأقل 3 أحرف)';
    }

    const cleanPhone = phone.replace(/[\s-]/g, '');
    const algerianPhoneRegex = /^(0)(5|6|7|2|3|4)[0-9]{8}$/;
    if (!cleanPhone) {
      errors.phone = 'يرجى إدخال رقم الهاتف';
    } else if (!algerianPhoneRegex.test(cleanPhone)) {
      errors.phone = 'يرجى إدخال رقم هاتف جزائري صحيح مكون من 10 أرقام (مثال: 0671234567)';
    }

    if (!wilaya) {
      errors.wilaya = 'يرجى اختيار الولاية';
    }

    if (!baladiya.trim()) {
      errors.baladiya = 'يرجى اختيار البلدية';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `TAH-${randomSuffix}`;

    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || fullName.trim();
    const lastName = nameParts.slice(1).join(' ');

    const newOrder: CodOrder = {
      id: `order-${Date.now()}`,
      orderNumber,
      customerName: firstName,
      ...(lastName ? { customerLastName: lastName } : {}),
      phone: phone.trim(),
      wilaya,
      baladiya: baladiya.trim(),
      deliveryType,
      deliveryAddress: `البلدية: ${baladiya.trim()} - توصيل إلى: ${deliveryType === 'المنزل' ? 'باب المنزل' : 'مكتب وكالة التوصيل'}`,
      product: {
        id: product.id,
        nameAr: product.nameAr,
        image: product.image,
        priceDZD: product.priceDZD
      },
      selectedSize,
      selectedColor: selectedColor.name,
      quantity,
      subtotalDZD,
      shippingDZD,
      totalDZD,
      createdAt: new Date().toISOString(),
      status: 'new'
    };

    try {
      await saveCodOrder(newOrder);
    } catch (err) {
      console.warn('Order saved with local fallback', err);
    }

    setIsSubmitting(false);
    setConfirmedOrder(newOrder);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const orderWhatsAppMessage = confirmedOrder
    ? `السلام عليكم ورحمة الله،
لقد قمت بتسجيل طلب جديد (الدفع عند الاستلام) من متجركم «الطاهرون للثوب الإسلامي - تاوقريت»:

• رقم الطلب: ${confirmedOrder.orderNumber}
• المنتج: ${confirmedOrder.product.nameAr}
• الكمية: ${confirmedOrder.quantity}
• المقاس: ${confirmedOrder.selectedSize}
• اللون: ${confirmedOrder.selectedColor}
• الاسم واللقب: ${confirmedOrder.customerName}
• رقم الهاتف: ${confirmedOrder.phone}
• الولاية: ${confirmedOrder.wilaya}
• البلدية: ${confirmedOrder.baladiya}
• التوصيل إلى: ${confirmedOrder.deliveryType || 'المنزل'}
• المجموع المطلوب عند الاستلام: ${formatPriceDZD(confirmedOrder.totalDZD)}

يرجى تأكيد الطلبية وتجهيز الشحن. بارك الله فيكم.`
    : '';

  const orderWhatsAppUrl = buildWhatsAppLink(
    settings.whatsappNumber,
    orderWhatsAppMessage
  );

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1A1713] flex flex-col font-arabic-luxury selection:bg-[#C8A64D]/25 selection:text-[#8C6819]">
      {/* 1. الشريط العلوي الخاص بصفحة المنتج: اسم المتجر على اليمين وزر العودة على اليسار */}
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-[#E8E2D4]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* اسم المتجر وشعاره (على اليمين) */}
          <div
            onClick={onBack}
            className="flex items-center gap-2 cursor-pointer select-none"
            title="العودة للصفحة الرئيسية"
          >
            <div className="w-7 h-7 shrink-0 relative flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                <defs>
                  <linearGradient id="pageBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#DFBF75" />
                    <stop offset="50%" stopColor="#C8A64D" />
                    <stop offset="100%" stopColor="#8C6E2D" />
                  </linearGradient>
                </defs>
                <path
                  d="M50 2 L62 26 L88 12 L74 38 L98 50 L74 62 L88 88 L62 74 L50 98 L38 74 L12 88 L26 62 L2 50 L26 38 L12 12 L38 26 Z"
                  fill="#231E15"
                  stroke="url(#pageBrandGrad)"
                  strokeWidth="2.5"
                />
                <circle cx="50" cy="50" r="16" fill="#18140E" stroke="url(#pageBrandGrad)" strokeWidth="1" />
                <path
                  d="M45 42 L45 56 M45 49 C47 44 55 44 57 49 C58 54 52 56 42 56"
                  stroke="url(#pageBrandGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-sm sm:text-base font-bold text-[#1A1713]">
              الطاهرون للثوب الإسلامي
            </span>
          </div>

          {/* أيقونة الرجوع إلى المتجر (على اليسار): حوافه بالأسود وهو بالأبيض */}
          <button
            type="button"
            onClick={onBack}
            title="الرجوع إلى المتجر"
            aria-label="الرجوع إلى المتجر"
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border-2 border-black text-black hover:bg-[#1A1713] hover:text-white transition-all shadow-xs cursor-pointer group"
          >
            <ArrowLeft className="w-5 h-5 text-black group-hover:text-white transition-all group-hover:-translate-x-0.5 stroke-[2.5]" />
          </button>
        </div>
      </header>

      {/* المحتوى الرئيسي لصفحة الهبوط */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full text-right">
        {confirmedOrder ? (
          /* ======================================================== */
          /* حالة نجاح تسجيل الطلب (شاشة التأكيد والفاتورة الكاملة) */
          /* ======================================================== */
          <div className="bg-white border-2 border-[#C8A64D]/60 rounded-3xl p-6 sm:p-10 shadow-lg max-w-2xl mx-auto text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
              <CheckCircle2 className="w-12 h-12 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold px-3.5 py-1.5 bg-[#C8A64D]/15 text-[#8C6819] rounded-full border border-[#C8A64D]/30 inline-block">
                رقم الطلب: {confirmedOrder.orderNumber}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1713] font-arabic-luxury">
                تم تسجيل طلبك بنجاح!
              </h1>
              <p className="text-sm text-[#5C5343] max-w-md mx-auto leading-relaxed">
                شكراً لثقتكم بمتجر <strong className="text-[#1A1713]">الطاهرون للثوب الإسلامي</strong> (تاوقريت، الشلف). سيتم الاتصال بكم هاتفياً لتأكيد الشحن والتسليم.
              </p>
            </div>

            {/* تفاصيل الفاتورة الملخصة */}
            <div className="bg-[#FAF9F5] border border-[#DDD5C5] rounded-2xl p-4 sm:p-5 text-right space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-[#E8E2D4]">
                <span className="text-[#6B6150]">المنتج:</span>
                <span className="font-bold text-[#1A1713]">{confirmedOrder.product.nameAr}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#E8E2D4]">
                <span className="text-[#6B6150]">المقاس واللون:</span>
                <span className="font-bold text-[#1A1713]">
                  مقاس {confirmedOrder.selectedSize} - لون {confirmedOrder.selectedColor}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#E8E2D4]">
                <span className="text-[#6B6150]">الكمية:</span>
                <span className="font-bold text-[#1A1713]">{confirmedOrder.quantity} قطعة</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#E8E2D4]">
                <span className="text-[#6B6150]">العنوان المستهدف:</span>
                <span className="font-bold text-[#1A1713]">
                  {confirmedOrder.wilaya} - {confirmedOrder.baladiya}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#E8E2D4]">
                <span className="text-[#6B6150]">التوصيل إلى:</span>
                <span className="font-bold text-[#1A1713]">
                  {confirmedOrder.deliveryType || 'المنزل'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#E8E2D4]">
                <span className="text-[#6B6150]">رقم الهاتف:</span>
                <span className="font-bold text-[#1A1713] font-mono">{confirmedOrder.phone}</span>
              </div>
              <div className="flex justify-between items-center pt-1 text-sm sm:text-base">
                <span className="font-bold text-[#1A1713]">المبلغ المطلوب عند الاستلام:</span>
                <span className="font-bold text-[#8C6819] text-lg font-mono">
                  {formatPriceDZD(confirmedOrder.totalDZD)}
                </span>
              </div>
            </div>

            {/* إجراءات المتابعة */}
            <div className="space-y-3 pt-2">
              <a
                href={orderWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>إرسال تفاصيل الطلب عبر واتساب للتأكيد السريع</span>
              </a>

              <button
                type="button"
                onClick={onBack}
                className="w-full py-3 px-6 rounded-2xl bg-white border border-[#DDD5C5] hover:border-[#C8A64D] text-[#4A4134] font-bold text-sm transition-colors cursor-pointer"
              >
                العودة للتسوق واستعراض باقي المنتجات
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* عرض صفحة الهبوط الكاملة للمنتج */
          /* ======================================================== */
          <div className="space-y-8">

            {/* القسم العلوي: الصورة الرئيسية في الأعلى والأسفل صور ثانوية مصغرة + تفاصيل المنتج */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              
              {/* العمود الأول: معرض الصور (الصورة الرئيسية في الأعلى والمصغرات أسفلها مباشرة) */}
              <div className="lg:col-span-7 space-y-4">
                {/* 1. الصورة الرئيسية الكبيرة في الأعلى */}
                <div className="relative aspect-[4/5] sm:aspect-[1/1] md:aspect-[4/5] w-full bg-[#F3EFE6] rounded-3xl overflow-hidden border-2 border-[#E8E2D4] shadow-sm">
                  <img
                    src={activeImage}
                    alt={product.nameAr}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center transition-all duration-300"
                  />
                </div>

                {/* 2. الصور الثانوية المصغرة أسفل الصورة الرئيسية مباشرة */}
                {allImages.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                    {allImages.map((imgSrc, idx) => {
                      const isSelected = activeImage === imgSrc;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImage(imgSrc)}
                          className={`relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#C8A64D] ring-2 ring-[#C8A64D]/40 scale-102 shadow-md'
                              : 'border-[#DDD5C5] opacity-75 hover:opacity-100 hover:border-[#8C6819]'
                          }`}
                        >
                          <img
                            src={imgSrc}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-center"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-[#C8A64D]/15 pointer-events-none" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

              </div>

              {/* العمود الثاني: بيانات المنتج وتفاصيل الطلب واستمارة الدفع عند الاستلام */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* العنوان والسعر: ثمن المنتج على اليسار وفي أسفله السعر القديم مشطوب */}
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1713] font-arabic-luxury leading-tight flex-1">
                    {product.nameAr}
                  </h1>

                  {/* ثمن المنتج على اليسار وفي أسفله السعر القديم مشطوب */}
                  <div className="flex flex-col items-end text-left shrink-0">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#8C6819] font-mono leading-tight">
                      {formatPriceDZD(product.priceDZD)}
                    </span>
                    {product.originalPriceDZD && product.originalPriceDZD > product.priceDZD && (
                      <span className="text-sm sm:text-base text-[#9C8F7A] line-through font-mono mt-0.5">
                        {formatPriceDZD(product.originalPriceDZD)}
                      </span>
                    )}
                  </div>
                </div>

                {/* الوصف المختصر */}
                <div className="text-sm text-[#5C5343] leading-relaxed border-t border-b border-[#E8E2D4] py-3.5">
                  <p>{product.descriptionAr}</p>
                </div>

                {/* اختيار المقاس واللون والكمية */}
                <div className="space-y-4">
                  {/* اختيار المقاس */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#1A1713]">المقاس المطلوب:</span>
                        <span className="text-[#8C6819] font-bold">{selectedSize}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setSelectedSize(sz)}
                            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                              selectedSize === sz
                                ? 'bg-[#1A1713] text-[#FAF9F5] border-[#1A1713] shadow-xs'
                                : 'bg-white text-[#4A4134] border-[#DDD5C5] hover:border-[#8C6819]'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* اختيار اللون - ثلاث دوائر واضحة مع عنوان وبدون نقطة داخلية */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="space-y-2">
                      <span className="block text-xs font-bold text-[#1A1713]">إختيار اللون:</span>
                      <div className="flex items-center gap-3.5 pt-0.5">
                        {product.colors.slice(0, 3).map((c) => {
                          const isColSelected = selectedColor.hex === c.hex || selectedColor.name === c.name;
                          return (
                            <button
                              key={c.hex || c.name}
                              type="button"
                              onClick={() => setSelectedColor(c)}
                              aria-label={`اختيار اللون`}
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-200 cursor-pointer relative flex items-center justify-center ${
                                isColSelected
                                  ? 'ring-3 ring-black ring-offset-2 ring-offset-white shadow-md scale-105'
                                  : 'ring-1 ring-black/20 hover:scale-105 hover:shadow-sm opacity-85 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: c.hex }}
                            >
                              {/* إطار دائري ناعم لتوضيح حدود الدائرة خصوصاً للألوان الفاتحة أو البيضاء */}
                              <span className="absolute inset-0 rounded-full border border-black/15 pointer-events-none" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* ======================================================== */}
                {/* 3. استمارة الدفع عند الاستلام (COD) مباشرة في الصفحة */}
                {/* ======================================================== */}
                <div
                  ref={orderFormRef}
                  className="bg-white rounded-2xl p-5 sm:p-6 space-y-4"
                >
                  {/* شريط عنوان الاستمارة: شريط أسود والكتابة بالأبيض */}
                  <div className="flex items-center justify-center py-2.5 px-4 bg-[#1A1713] text-white rounded-xl text-center shadow-xs">
                    <h3 className="text-base sm:text-lg font-bold text-white font-arabic-luxury tracking-wide">
                      نموذج الطلب
                    </h3>
                  </div>

                  <form onSubmit={handleOrderSubmit} className="space-y-4">
                    {/* 1. الاسم واللقب */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#1A1713]">
                        الاسم واللقب <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#8A806D]">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: '' });
                          }}
                          placeholder="مثال: محمد بن علي"
                          className={`w-full pr-10 pl-3 py-2.5 bg-white border rounded-xl text-xs sm:text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C8A64D] transition-all ${
                            formErrors.fullName ? 'border-rose-400 bg-rose-50/30' : 'border-[#DDD5C5]'
                          }`}
                        />
                      </div>
                      {formErrors.fullName && (
                        <p className="text-[11px] text-rose-600 font-bold">{formErrors.fullName}</p>
                      )}
                    </div>

                    {/* 2. رقم الهاتف */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#1A1713]">
                        رقم الهاتف <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#8A806D]">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          required
                          dir="ltr"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                          }}
                          placeholder="06XXXXXXXX"
                          className={`w-full pr-10 pl-3 py-2.5 bg-white border rounded-xl text-xs sm:text-sm font-mono text-stone-700 placeholder-stone-400 text-right focus:outline-none focus:ring-2 focus:ring-[#C8A64D] transition-all ${
                            formErrors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-[#DDD5C5]'
                          }`}
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="text-[11px] text-rose-600 font-bold">{formErrors.phone}</p>
                      )}
                    </div>

                    {/* 3. الولاية */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#1A1713]">
                        الولاية (58 ولاية) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#8A806D]">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <select
                          value={wilaya}
                          onChange={(e) => {
                            setWilaya(e.target.value);
                            if (formErrors.wilaya) setFormErrors({ ...formErrors, wilaya: '' });
                          }}
                          className="w-full pr-10 pl-3 py-2.5 bg-white border border-[#DDD5C5] rounded-xl text-xs sm:text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#C8A64D] transition-all cursor-pointer"
                        >
                          {ALGERIA_WILAYAS.map((w) => (
                            <option key={w} value={w}>
                              {w}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 4. البلدية (اختيار بنقرة واحدة من القائمة المنسدلة) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#1A1713]">
                        البلدية <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#8A806D]">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <select
                          value={baladiya}
                          onChange={(e) => {
                            setBaladiya(e.target.value);
                            if (formErrors.baladiya) setFormErrors({ ...formErrors, baladiya: '' });
                          }}
                          className={`w-full pr-10 pl-3 py-2.5 bg-white border rounded-xl text-xs sm:text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#C8A64D] transition-all cursor-pointer ${
                            formErrors.baladiya ? 'border-rose-400 bg-rose-50/30' : 'border-[#DDD5C5]'
                          }`}
                        >
                          {availableCommunes.map((communeName) => (
                            <option key={communeName} value={communeName}>
                              {communeName}
                            </option>
                          ))}
                        </select>
                      </div>
                      {formErrors.baladiya && (
                        <p className="text-[11px] text-rose-600 font-bold">{formErrors.baladiya}</p>
                      )}
                    </div>

                    {/* 5. الكمية (مباشرة أسفل البلدية) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#1A1713]">
                        الكمية
                      </label>
                      <div className="flex items-center justify-between bg-white border border-[#DDD5C5] rounded-xl px-3 py-2">
                        <div className="inline-flex items-center bg-[#FAF9F5] border border-[#DDD5C5] rounded-lg p-0.5 shadow-xs">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(1)}
                            className="w-8 h-8 rounded-md hover:bg-white flex items-center justify-center text-stone-700 font-bold cursor-pointer transition-colors"
                            aria-label="زيادة الكمية"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-9 text-center font-bold text-sm font-mono text-stone-700">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(-1)}
                            disabled={quantity <= 1}
                            className="w-8 h-8 rounded-md hover:bg-white flex items-center justify-center text-stone-700 font-bold disabled:opacity-30 cursor-pointer transition-colors"
                            aria-label="إنقاص الكمية"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-xs text-stone-600">
                          المجموع: <strong className="text-stone-800 font-mono">{formatPriceDZD(subtotalDZD)}</strong>
                        </span>
                      </div>
                    </div>

                    {/* 6. التوصيل إلى (اختيار بنقرة زر: المنزل أو المكتب) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#1A1713]">
                        التوصيل إلى <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setDeliveryType('المنزل')}
                          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            deliveryType === 'المنزل'
                              ? 'bg-[#1A1713] text-[#F3EAD8] shadow-sm ring-2 ring-[#C8A64D]'
                              : 'bg-white text-stone-700 hover:bg-[#FAF9F5] border border-[#DDD5C5]'
                          }`}
                        >
                          <Home className="w-4 h-4" />
                          <span>المنزل</span>
                          {deliveryType === 'المنزل' && (
                            <Check className="w-3.5 h-3.5 text-[#C8A64D] stroke-[3]" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeliveryType('المكتب')}
                          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            deliveryType === 'المكتب'
                              ? 'bg-[#1A1713] text-[#F3EAD8] shadow-sm ring-2 ring-[#C8A64D]'
                              : 'bg-white text-stone-700 hover:bg-[#FAF9F5] border border-[#DDD5C5]'
                          }`}
                        >
                          <Building2 className="w-4 h-4" />
                          <span>المكتب</span>
                          {deliveryType === 'المكتب' && (
                            <Check className="w-3.5 h-3.5 text-[#C8A64D] stroke-[3]" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* ملخص الحساب والتوصيل */}
                    <div className="bg-white border border-[#DDD5C5] rounded-2xl p-3.5 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-stone-600">
                        <span>سعر المنتجات ({quantity}):</span>
                        <span className="font-mono font-bold text-stone-800">{formatPriceDZD(subtotalDZD)}</span>
                      </div>
                      <div className="flex justify-between items-center text-stone-600">
                        <span>تكلفة التوصيل:</span>
                        <span className={`font-mono font-bold ${shippingDZD === 0 ? 'text-emerald-700' : 'text-stone-800'}`}>
                          {shippingDZD === 0 ? 'مجاني' : formatPriceDZD(shippingDZD)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-[#DDD5C5] text-sm">
                        <span className="font-bold text-stone-800">المجموع عند الاستلام:</span>
                        <span className="font-mono font-extrabold text-stone-800 text-base">
                          {formatPriceDZD(totalDZD)}
                        </span>
                      </div>
                    </div>

                    {/* زر تأكيد الطلب: شريط أسود والكتابة بالأبيض */}
                    <div className="pt-2 flex justify-center">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto min-w-[200px] max-w-xs py-2.5 px-5 rounded-xl bg-[#1A1713] hover:bg-[#2C2720] active:scale-[0.99] text-white font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 border border-[#1A1713]"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="text-white">جاري تسجيل طلبكم...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 stroke-[2.5] text-white" />
                            <span className="text-white">تأكيد الطلب الٱن</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
