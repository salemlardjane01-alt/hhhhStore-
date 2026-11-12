import { Category, Product, StoreSettings } from '../types/store';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'all', nameAr: 'جميع المنتجات' },
  { id: 'men_thobes', nameAr: 'ثياب رجالية', descriptionAr: 'ثياب ملكية سعودية ومغربية بخامات فاخرة' },
  { id: 'emirati_shirts', nameAr: 'أقمصة إماراتية', descriptionAr: 'أقمصة أنيقة بتطريز متقن وتصميم عصري' },
  { id: 'boys_clothing', nameAr: 'ألبسة ولادية', descriptionAr: 'أزياء إسلامية راقية للأطفال والفتيان' },
  { id: 'circumcision_outfits', nameAr: 'أطقم ختان', descriptionAr: 'أطقم تقليدية ملكية بالخيوط الذهبية' },
  { id: 'perfumes', nameAr: 'عطور وبخور', descriptionAr: 'عود مروكي، مسك الطهارة ودهن العود الملكي' },
  { id: 'niqab', nameAr: 'نقاب وحجاب شرعي', descriptionAr: 'خامات كورية فاخرة وساترة بأعلى درجات الراحة' },
  { id: 'islamic_accessories', nameAr: 'إكسسوارات إسلامية', descriptionAr: 'سبح كهرمان، سجادات صلاة فاخرة وشماغات' }
];

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'الطاهرون للثوب الإسلامي',
  headline: 'الأناقة تبدأ من الطاهرون',
  subheadline: 'أرقى الأزياء الإسلامية الرجالية والإكسسوارات الفاخرة - تاوقريت، الشلف',
  whatsappNumber: '+213671234567', // Customizable via CMS
  phoneNumber: '0671 23 45 67',
  city: 'تاوقريت',
  wilaya: 'ولاية الشلف',
  wilayaNumber: '02',
  address: 'شارع الشهداء، وسط مدينة تاوقريت، ولاية الشلف، الجزائر',
  instagramUrl: 'https://instagram.com/attahiroun_thobe',
  facebookUrl: 'https://facebook.com/attahiroun.thobe',
  tiktokUrl: 'https://tiktok.com/@attahiroun.thobe',
  announcementText: '✨ مرحباً بكم في متجر الطاهرون - التوصيل متوفر لـ 58 ولاية والدفع عند الاستلام',
  isAnnouncementActive: true
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'thobe-royal-white-01',
    name: 'Royal Saudi White Thobe',
    nameAr: 'ثوب سعودي ملكي أبيض فاخر',
    categoryId: 'men_thobes',
    priceDZD: 6800,
    originalPriceDZD: 7900,
    descriptionAr: 'ثوب ملكي كلاسيكي منسوج من أجود خيوط القطن الياباني الفاخر المعالج، بياقة كلاسيكية مشدودة وأزرار صدفيّة طبيعية. يتميز بانسدال انسيابي وقماش مقاوم للتجعد يمنحك حضوراً رفيعاً ومريحاً طوال اليوم.',
    image: '/src/assets/images/product_thobe_royal_white_1793266734727.jpg',
    additionalImages: [
      '/src/assets/images/hero_luxury_islamic_clothing_1793266734202.jpg',
      '/src/assets/images/product_qamis_emirati_black_1793266735856.jpg',
      '/src/assets/images/product_oud_perfume_luxury_1793266736317.jpg'
    ],
    sizes: ['52', '54', '56', '58', '60'],
    colors: [
      { name: 'أبيض ناصع', hex: '#FFFFFF' },
      { name: 'أوف وايت عاجي', hex: '#F7F4EA' },
      { name: 'رمادي لؤلؤي', hex: '#E2E5E9' }
    ],
    inStock: true,
    featured: true,
    fabricAr: 'قطن ياباني سلكون 100%',
    badge: 'الأكثر مبيعاً'
  },
  {
    id: 'qamis-emirati-black-01',
    name: 'Emirati Black Qamis with Gold Accents',
    nameAr: 'قميص إماراتي أسود بتطريز ذهبي خافت',
    categoryId: 'emirati_shirts',
    priceDZD: 5400,
    originalPriceDZD: 6200,
    descriptionAr: 'قميص إماراتي بتصميم مودرن راقٍ من الصوف الناعم والألياف الإيطالية، ياقة دائرية إماراتية مطرزة بخيوط برونزية ذهبية دقيقة، مع كبكات متناسقة وأكمام مصممة بعناية للمناسبات وصلاة الجمعة.',
    image: '/src/assets/images/product_qamis_emirati_black_1793266735856.jpg',
    additionalImages: [
      '/src/assets/images/product_thobe_royal_white_1793266734727.jpg',
      '/src/assets/images/hero_luxury_islamic_clothing_1793266734202.jpg',
      '/src/assets/images/product_khitan_outfit_gold_1793266736315.jpg'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'أسود مطفأ', hex: '#111111' },
      { name: 'كحلي ليلي', hex: '#161D2B' },
      { name: 'زيتي ملكي', hex: '#263426' }
    ],
    inStock: true,
    featured: true,
    fabricAr: 'قماش شتوي خفيف مقاوم للانكماش',
    badge: 'حصري'
  },
  {
    id: 'khitan-outfit-royal-01',
    name: 'Royal Algerian Circumcision Outfit',
    nameAr: 'طقم ختان ملكي تقليدي مطرز بالذهب',
    categoryId: 'circumcision_outfits',
    priceDZD: 11500,
    originalPriceDZD: 13000,
    descriptionAr: 'طقم ختان فاخر للأولاد مصنوع يدوياً من القطيفة الملكية (المخمل) بلون العنابي الفخم والمطرز بخيوط الفتلة والكانتيل الذهبية الأصيلة. يشمل سترة مطرزة، قميص حريري داخلي، بنطلون عربي، طربوش تقليدي بالهدب الذهبي وحذاء تقليدي (بلغة) متناسق.',
    image: '/src/assets/images/product_khitan_outfit_gold_1793266736315.jpg',
    additionalImages: [
      '/src/assets/images/hero_luxury_islamic_clothing_1793266734202.jpg',
      '/src/assets/images/product_oud_perfume_luxury_1793266736317.jpg',
      '/src/assets/images/product_thobe_royal_white_1793266734727.jpg'
    ],
    sizes: ['سنة واحدة', 'سنتان', '3 سنوات', '4 سنوات', '5 سنوات'],
    colors: [
      { name: 'عنابي بوردو مع ذهبي', hex: '#58111A' },
      { name: 'أخضر زمردي مع ذهبي', hex: '#1B3B2B' },
      { name: 'أزرق ملكي مع ذهبي', hex: '#1C2E52' }
    ],
    inStock: true,
    featured: true,
    fabricAr: 'قطيفة مخملية ملكية وحرير مقصب',
    badge: 'طقم متكامل'
  },
  {
    id: 'perfume-oud-malaki-01',
    name: 'Royal Oud Malaki Parfum',
    nameAr: 'عطر العود الملكي الفاخر - خشب ودهن العود',
    categoryId: 'perfumes',
    priceDZD: 4800,
    originalPriceDZD: 5500,
    descriptionAr: 'توليفة عطرية أصيلة تجمع بين نفحات العود الكمبودي المعتق، وخشب الصندل الدافئ مع لمسات من العنبر الفاخر والمسك الأبيض. تركيز عالي وثبات ممتد يدوم لأيام على الملابس والثياب.',
    image: '/src/assets/images/product_oud_perfume_luxury_1793266736317.jpg',
    additionalImages: [
      '/src/assets/images/hero_luxury_islamic_clothing_1793266734202.jpg',
      '/src/assets/images/product_khitan_outfit_gold_1793266736315.jpg',
      '/src/assets/images/product_thobe_royal_white_1793266734727.jpg'
    ],
    sizes: ['100 مل', '50 مل', 'تولة دهن نقي'],
    colors: [
      { name: 'زجاجة أسود مطفي مع ذهبي', hex: '#0B0B0B' }
    ],
    inStock: true,
    featured: true,
    fabricAr: 'مستخلص زيوت عطرية أصلية بدون كحول ضار',
    badge: 'ثبات يدوم 48 ساعة'
  },
  {
    id: 'boys-thobe-elegance-01',
    name: 'Boys Elegant White Festive Thobe',
    nameAr: 'ثوب ولادي ملكي للأعياد والمناسبات',
    categoryId: 'boys_clothing',
    priceDZD: 3800,
    originalPriceDZD: 4500,
    descriptionAr: 'ثوب ولادي فاخر مصمم بأناقة تماثل ثياب الكبار، خامة ناعمة على بشرة الأطفال وسهلة الكي مع ياقة مريحة وجيوب عملية للمناسبات والأعياد وصلاة الجمعة.',
    image: '/src/assets/images/product_thobe_royal_white_1793266734727.jpg',
    additionalImages: [
      '/src/assets/images/product_khitan_outfit_gold_1793266736315.jpg',
      '/src/assets/images/hero_luxury_islamic_clothing_1793266734202.jpg'
    ],
    sizes: ['34', '36', '38', '40', '44', '48'],
    colors: [
      { name: 'أبيض ناصع', hex: '#FFFFFF' },
      { name: 'بيج صحراوي', hex: '#E0D6C3' }
    ],
    inStock: true,
    featured: false,
    fabricAr: 'قطن مخلوط خفيف ومريح للأطفال',
    badge: 'مريح للأطفال'
  },
  {
    id: 'niqab-sharia-korean-01',
    name: 'Luxury Korean Crepe Sharia Niqab',
    nameAr: 'نقاب شرعي ملكي بطبقتين - قماش كوري فاخر',
    categoryId: 'niqab',
    priceDZD: 2600,
    originalPriceDZD: 3200,
    descriptionAr: 'نقاب شرعي إسلامي ساتر مصنوع من الكريب الكوري الملكي سوبر بلاك فاحم السواد. طبقتان خفيفتان تسمحان بالتنفس بسهولة مع رباط رأس مريح ومطاط جانبي لا يسبب ضغطاً على العينين.',
    image: '/src/assets/images/product_qamis_emirati_black_1793266735856.jpg',
    additionalImages: [
      '/src/assets/images/hero_luxury_islamic_clothing_1793266734202.jpg',
      '/src/assets/images/product_oud_perfume_luxury_1793266736317.jpg'
    ],
    sizes: ['مقاس موحد (طول 45 سم)', 'طول 50 سم'],
    colors: [
      { name: 'أسود فاحم سوبر بلاك', hex: '#050505' }
    ],
    inStock: true,
    featured: false,
    fabricAr: 'كريب كوري فرسان أصلي',
    badge: 'سواد فاحم ساتر'
  },
  {
    id: 'misbaha-amber-gold-01',
    name: 'Handcrafted Amber Prayer Beads',
    nameAr: 'سبحة كهرمان بلطيقي فاخرة بشرابة فضية وذهبية',
    categoryId: 'islamic_accessories',
    priceDZD: 3200,
    originalPriceDZD: 3900,
    descriptionAr: 'سبحة 33 حبة مسبوكة بدقة من الكهرمان المعالج مع ملمس مخملي وقصّة بيضاوية انسيابية، مزدانة بشرابة معدنية مطلية بالذهب المقاوم للأكسدة، تأتي في علبة فاخرة مبطنة بالمخمل الأسود.',
    image: '/src/assets/images/product_oud_perfume_luxury_1793266736317.jpg',
    additionalImages: [
      '/src/assets/images/product_khitan_outfit_gold_1793266736315.jpg',
      '/src/assets/images/hero_luxury_islamic_clothing_1793266734202.jpg'
    ],
    sizes: ['33 حبة (قطر 10 مم)', '99 حبة (قطر 8 مم)'],
    colors: [
      { name: 'عسلي كهرماني دافئ', hex: '#B87228' },
      { name: 'أحمر كرزي شفاف', hex: '#631821' },
      { name: 'أسود ملكي كوك', hex: '#1C1C1C' }
    ],
    inStock: true,
    featured: false,
    fabricAr: 'كهرمان نخب أول ومعدن مطلي',
    badge: 'صناعة متقنة'
  },
  {
    id: 'gandora-moroccan-algerian-01',
    name: 'Gandora Moroccan Algerian Heritage Thobe',
    nameAr: 'قندورة مغربية جزائرية صيفية بالسفيفة الذهبية',
    categoryId: 'men_thobes',
    priceDZD: 5900,
    originalPriceDZD: 6700,
    descriptionAr: 'قندورة صيفية راقية بقصة واسعة ومريحة، محاكة من قماش المليفة الممتاز مع تطريز السفيفة الحريرية على الصدر والأكمام، مثالية للاستقبال المنزلي والمناسبات العائلية والأعياد.',
    image: '/src/assets/images/hero_luxury_islamic_clothing_1793266734202.jpg',
    additionalImages: [
      '/src/assets/images/product_thobe_royal_white_1793266734727.jpg',
      '/src/assets/images/product_qamis_emirati_black_1793266735856.jpg'
    ],
    sizes: ['M (54)', 'L (56)', 'XL (58)', 'XXL (60)'],
    colors: [
      { name: 'عاجي طبيعي', hex: '#EFE9DA' },
      { name: 'أخضر زيتوني', hex: '#3B4D3C' },
      { name: 'رصاصي هادئ', hex: '#5A6368' }
    ],
    inStock: true,
    featured: true,
    fabricAr: 'مليفة ناعمة باردة',
    badge: 'طابع تقليدي أصيل'
  }
];

export const ALGERIA_WILAYAS = [
  '01 - أدرار', '02 - الشلف', '03 - الأغواط', '04 - أم البواقي', '05 - باتنة',
  '06 - بجاية', '07 - بسكرة', '08 - بشار', '09 - البليدة', '10 - البويرة',
  '11 - تمنراست', '12 - تبسة', '13 - تلمسان', '14 - تيارت', '15 - تيزي وزو',
  '16 - الجزائر العاصمة', '17 - الجلفة', '18 - جيجل', '19 - سطيف', '20 - سعيدة',
  '21 - سكيكدة', '22 - سيدي بلعباس', '23 - عنابة', '24 - قالمة', '25 - قسنطينة',
  '26 - المدية', '27 - مستغانم', '28 - المسيلة', '29 - معسكر', '30 - ورقلة',
  '31 - وهران', '32 - البيض', '33 - إليزي', '34 - برج بوعريريج', '35 - بومرداس',
  '36 - الطارف', '37 - تندوف', '38 - تسمسيلت', '39 - الوادي', '40 - خنشلة',
  '41 - سوق أهراس', '42 - تيبازة', '43 - ميلة', '44 - عين الدفلى', '45 - النعامة',
  '46 - عين تموشنت', '47 - غرداية', '48 - غليزان', '49 - تيميمون', '50 - برج باجي مختار',
  '51 - أولاد جلال', '52 - بني عباس', '53 - عين صالح', '54 - عين قزام', '55 - تقرت',
  '56 - جانت', '57 - المغير', '58 - المنيعة'
];
