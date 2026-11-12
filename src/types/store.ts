export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  categoryId: 'men_thobes' | 'emirati_shirts' | 'boys_clothing' | 'circumcision_outfits' | 'perfumes' | 'niqab' | 'islamic_accessories';
  priceDZD: number;
  originalPriceDZD?: number;
  descriptionAr: string;
  image: string;
  additionalImages?: string[];
  sizes: string[];
  colors: ProductColor[];
  inStock: boolean;
  stockCount?: number; // الكمية الموجودة في المخزن
  featured?: boolean;
  fabricAr?: string;
  badge?: string;
}

export interface Category {
  id: string;
  nameAr: string;
  descriptionAr?: string;
}

export interface PartnerCompany {
  id: string;
  name: string; // اسم الشركة الشريكة أو شركة التوصيل (مثل: ياليدين إكسبريس، ZR Express)
  type: 'delivery' | 'supplier' | 'logistics' | 'other';
  phone: string;
  coverageWilayas?: string;
  address?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
}

export interface ConfirmationStaff {
  id: string;
  name: string; // اسم الموظف
  phone: string; // رقم هاتف الموظف
  role: string; // الوظيفة (تأكيد الطلبيات / خدمة العملاء)
  active: boolean;
  ordersConfirmedCount?: number;
  notes?: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  headline: string;
  subheadline: string;
  whatsappNumber: string; // e.g. "+213671234567"
  phoneNumber: string;
  city: string; // "تاوقريت"
  wilaya: string; // "الشلف"
  wilayaNumber: string; // "02"
  address: string; // "حي النصر / وسط المدينة، تاوقريت، الشلف"
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl?: string;
  announcementText: string;
  isAnnouncementActive: boolean;
}

export interface CartItem {
  id: string; // unique item instance id
  productId: string;
  product: Product;
  selectedSize: string;
  selectedColor: ProductColor;
  quantity: number;
}

export interface CodOrder {
  id: string;
  orderNumber: string;
  customerName: string; // الاسم
  customerLastName?: string; // اللقب
  phone: string;
  wilaya: string;
  baladiya: string;
  deliveryAddress?: string; // مكان التوصيل بالتفصيل
  product: {
    id: string;
    nameAr: string;
    image: string;
    priceDZD: number;
  };
  selectedSize?: string;
  selectedColor?: string;
  quantity: number;
  subtotalDZD: number;
  shippingDZD: number;
  totalDZD: number;
  deliveryType?: 'المنزل' | 'المكتب' | string;
  createdAt: string;
  status: 'new' | 'confirmed' | 'rejected' | 'delivered' | 'cancelled';
  confirmedByStaffId?: string;
  confirmedByStaffName?: string;
  rejectionReason?: string;
  notes?: string;
}

