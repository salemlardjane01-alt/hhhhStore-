import { doc, setDoc, getDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Product, StoreSettings, CodOrder, PartnerCompany, ConfirmationStaff } from '../types/store';
import { INITIAL_PRODUCTS, INITIAL_STORE_SETTINGS } from '../data/initialData';

const PRODUCTS_KEY = 'attahiroun_products_v2';
const PRODUCTS_INITIALIZED_KEY = 'attahiroun_products_initialized_v2';
const SETTINGS_KEY = 'attahiroun_settings_v1';
const COD_ORDERS_KEY = 'attahiroun_cod_orders_v1';
const PARTNERS_KEY = 'attahiroun_partners_v1';
const STAFF_KEY = 'attahiroun_staff_v1';

export const INITIAL_PARTNERS: PartnerCompany[] = [
  {
    id: 'partner-yalidine',
    name: 'ياليدين إكسبريس (Yalidine Express)',
    type: 'delivery',
    phone: '0982404040',
    coverageWilayas: 'توصيل سريع لكافة 58 ولاية (مكتب والمنزل)',
    address: 'وكالة تاوقريت / الشلف',
    notes: 'شريك التوصيل الرئيسي للمتجر بنظام الدفع عند الاستلام COD',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'partner-zrexpress',
    name: 'زد آر إكسبريس (ZR Express)',
    type: 'delivery',
    phone: '0770554433',
    coverageWilayas: 'توصيل للولايات الكبرى والشمالية',
    address: 'الشلف وسط المدينة',
    notes: 'توصيل سريع وخدمة إرجاع الطرود',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'partner-fabrics-dubai',
    name: 'مورد أقمشة الثوب الإماراتي والقطن الطبيعي',
    type: 'supplier',
    phone: '0661223344',
    coverageWilayas: 'توريد أقمشة مستوردة دبي واليابان',
    address: 'الجزائر العاصمة / دبي',
    notes: 'توريد أقمشة البوليستر الكوري المعالج والقطن الفاخر للصيف والشتاء',
    active: true,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_STAFF: ConfirmationStaff[] = [
  {
    id: 'staff-1',
    name: 'أحمد الطاهر',
    phone: '0671889900',
    role: 'مسؤول تأكيد الطلبيات الأول',
    active: true,
    ordersConfirmedCount: 142,
    notes: 'مكلف بالاتصال الهاتفي بالزبائن وتأكيد المقاسات والعناوين',
    createdAt: new Date().toISOString()
  },
  {
    id: 'staff-2',
    name: 'ياسين الجزائري',
    phone: '0550112233',
    role: 'موظف مبيعات وخدمة العملاء',
    active: true,
    ordersConfirmedCount: 89,
    notes: 'مكلف بمتابعة وتتبع وصول الشحنات مع شركات التوصيل',
    createdAt: new Date().toISOString()
  }
];

/**
 * Recursively cleans an object so that no keys with `undefined` values exist,
 * preventing Firestore from throwing "Unsupported field value: undefined" errors.
 */
export function cleanFirestorePayload<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (value !== null && typeof value === 'object') {
      if (Array.isArray(value)) {
        result[key] = value
          .filter((item) => item !== undefined)
          .map((item) => (item !== null && typeof item === 'object' ? cleanFirestorePayload(item) : item));
      } else {
        result[key] = cleanFirestorePayload(value);
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

async function seedInitialProductsToFirestore(): Promise<void> {
  try {
    for (const prod of INITIAL_PRODUCTS) {
      await setDoc(doc(db, 'products', prod.id), cleanFirestorePayload(prod), { merge: true });
    }
  } catch (err) {
    console.warn('Initial seeding note:', err);
  }
}

export function getStoredProducts(): Product[] {
  try {
    const isInitialized = localStorage.getItem(PRODUCTS_INITIALIZED_KEY) === 'true';
    const raw = localStorage.getItem(PRODUCTS_KEY);

    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    if (!isInitialized) {
      localStorage.setItem(PRODUCTS_INITIALIZED_KEY, 'true');
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
      seedInitialProductsToFirestore();
      return INITIAL_PRODUCTS;
    }

    return [];
  } catch (e) {
    console.error('Failed to parse stored products', e);
    return [];
  }
}

export async function saveSingleProduct(product: Product): Promise<void> {
  try {
    const existing = getStoredProducts();
    const index = existing.findIndex((p) => p.id === product.id);
    let updated: Product[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = product;
    } else {
      updated = [product, ...existing];
    }
    localStorage.setItem(PRODUCTS_INITIALIZED_KEY, 'true');
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('attahiroun_store_updated'));
  } catch (e) {
    console.error('Failed to update product locally', e);
  }

  const path = `products/${product.id}`;
  try {
    const payload = cleanFirestorePayload(product);
    await setDoc(doc(db, 'products', product.id), payload);
    console.log(`Product ${product.id} synced to Firestore`);
  } catch (error) {
    console.error(`Error saving product ${product.id} to Firestore`, error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
    console.log(`Product ${productId} deleted permanently from Firestore`);
  } catch (error) {
    console.error(`Error deleting product ${productId} from Firestore`, error);
    handleFirestoreError(error, OperationType.DELETE, path);
  }

  try {
    const existing = getStoredProducts();
    const updated = existing.filter((p) => p.id !== productId);
    localStorage.setItem(PRODUCTS_INITIALIZED_KEY, 'true');
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('attahiroun_store_updated'));
  } catch (e) {
    console.error('Failed to delete product locally', e);
  }
}

export async function deleteAllProducts(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, 'products'));
    for (const docSnap of snap.docs) {
      await deleteDoc(doc(db, 'products', docSnap.id));
    }
    console.log('All products deleted from Firestore');
  } catch (err) {
    console.error('Error deleting products from Firestore', err);
  }

  try {
    localStorage.setItem(PRODUCTS_INITIALIZED_KEY, 'true');
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent('attahiroun_store_updated'));
  } catch (e) {
    console.error('Failed to clear products locally', e);
  }
}

export async function saveProducts(products: Product[]): Promise<void> {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('attahiroun_store_updated'));
  } catch (e) {
    console.error('Failed to save products locally', e);
  }

  for (const prod of products) {
    try {
      await setDoc(doc(db, 'products', prod.id), cleanFirestorePayload(prod), { merge: true });
    } catch (error) {
      console.warn(`Could not sync product ${prod.id} to Firestore`, error);
    }
  }
}

export function getStoredSettings(): StoreSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return INITIAL_STORE_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return { ...INITIAL_STORE_SETTINGS, ...parsed };
  } catch (e) {
    console.error('Failed to parse stored settings', e);
    return INITIAL_STORE_SETTINGS;
  }
}

export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('attahiroun_store_updated'));
  } catch (e) {
    console.error('Failed to save store settings locally', e);
  }

  const path = 'settings/store';
  try {
    await setDoc(doc(db, 'settings', 'store'), cleanFirestorePayload(settings), { merge: true });
  } catch (error) {
    console.warn('Could not sync store settings to Firestore', error);
  }
}

export function resetStoreToDefaults(): void {
  try {
    localStorage.removeItem(PRODUCTS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    window.dispatchEvent(new CustomEvent('attahiroun_store_updated'));
  } catch (e) {
    console.error('Failed to reset store', e);
  }
}

// ----------------- PARTNER COMPANIES -----------------
export function getStoredPartners(): PartnerCompany[] {
  try {
    const raw = localStorage.getItem(PARTNERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(PARTNERS_KEY, JSON.stringify(INITIAL_PARTNERS));
    return INITIAL_PARTNERS;
  } catch (e) {
    console.error('Failed to load partners', e);
    return INITIAL_PARTNERS;
  }
}

export async function savePartner(partner: PartnerCompany): Promise<void> {
  try {
    const existing = getStoredPartners();
    const index = existing.findIndex((p) => p.id === partner.id);
    let updated: PartnerCompany[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = partner;
    } else {
      updated = [partner, ...existing];
    }
    localStorage.setItem(PARTNERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('attahiroun_partners_updated'));
  } catch (e) {
    console.error('Failed to save partner locally', e);
  }

  try {
    await setDoc(doc(db, 'partners', partner.id), cleanFirestorePayload(partner), { merge: true });
  } catch (err) {
    console.warn('Firestore partner sync note:', err);
  }
}

export async function deletePartner(partnerId: string): Promise<void> {
  try {
    const existing = getStoredPartners();
    const updated = existing.filter((p) => p.id !== partnerId);
    localStorage.setItem(PARTNERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('attahiroun_partners_updated'));
  } catch (e) {
    console.error('Failed to delete partner locally', e);
  }

  try {
    await deleteDoc(doc(db, 'partners', partnerId));
  } catch (err) {
    console.warn('Firestore delete partner note:', err);
  }
}

// ----------------- CONFIRMATION STAFF -----------------
export function getStoredStaff(): ConfirmationStaff[] {
  try {
    const raw = localStorage.getItem(STAFF_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(STAFF_KEY, JSON.stringify(INITIAL_STAFF));
    return INITIAL_STAFF;
  } catch (e) {
    console.error('Failed to load staff', e);
    return INITIAL_STAFF;
  }
}

export async function saveStaffMember(staff: ConfirmationStaff): Promise<void> {
  try {
    const existing = getStoredStaff();
    const index = existing.findIndex((s) => s.id === staff.id);
    let updated: ConfirmationStaff[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = staff;
    } else {
      updated = [staff, ...existing];
    }
    localStorage.setItem(STAFF_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('attahiroun_staff_updated'));
  } catch (e) {
    console.error('Failed to save staff member locally', e);
  }

  try {
    await setDoc(doc(db, 'staff', staff.id), cleanFirestorePayload(staff), { merge: true });
  } catch (err) {
    console.warn('Firestore staff sync note:', err);
  }
}

export async function deleteStaffMember(staffId: string): Promise<void> {
  try {
    const existing = getStoredStaff();
    const updated = existing.filter((s) => s.id !== staffId);
    localStorage.setItem(STAFF_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('attahiroun_staff_updated'));
  } catch (e) {
    console.error('Failed to delete staff member locally', e);
  }

  try {
    await deleteDoc(doc(db, 'staff', staffId));
  } catch (err) {
    console.warn('Firestore delete staff note:', err);
  }
}

// ----------------- COD CUSTOMER ORDERS -----------------
export function getStoredOrders(): CodOrder[] {
  try {
    const raw = localStorage.getItem(COD_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse stored COD orders', e);
    return [];
  }
}

export async function saveCodOrder(order: CodOrder): Promise<void> {
  try {
    const existing = getStoredOrders();
    const updated = [order, ...existing.filter((o) => o.id !== order.id)];
    localStorage.setItem(COD_ORDERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('attahiroun_orders_updated'));
  } catch (e) {
    console.error('Failed to save COD order locally', e);
  }

  const path = `orders/${order.id}`;
  try {
    const payload = cleanFirestorePayload({
      ...order,
      createdAt: order.createdAt || new Date().toISOString()
    });
    await setDoc(doc(db, 'orders', order.id), payload);
    console.log('Order persisted to Firestore successfully:', order.orderNumber);
  } catch (error) {
    console.error('Firestore saveCodOrder error:', error);
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateCodOrderStatus(orderId: string, status: CodOrder['status']): Promise<void> {
  try {
    const existing = getStoredOrders();
    const updated = existing.map((o) => (o.id === orderId ? { ...o, status } : o));
    localStorage.setItem(COD_ORDERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('attahiroun_orders_updated'));
  } catch (e) {
    console.error('Failed to update COD order status locally', e);
  }

  const path = `orders/${orderId}`;
  try {
    await setDoc(doc(db, 'orders', orderId), { status }, { merge: true });
  } catch (error) {
    console.warn('Could not sync order status to Firestore:', error);
  }
}

export async function updateCodOrderFull(
  orderId: string,
  updates: Partial<CodOrder>
): Promise<void> {
  try {
    const existing = getStoredOrders();
    const updated = existing.map((o) => (o.id === orderId ? { ...o, ...updates } : o));
    localStorage.setItem(COD_ORDERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('attahiroun_orders_updated'));
  } catch (e) {
    console.error('Failed to update order locally', e);
  }

  const path = `orders/${orderId}`;
  try {
    await setDoc(doc(db, 'orders', orderId), cleanFirestorePayload(updates), { merge: true });
  } catch (error) {
    console.warn('Could not sync order update to Firestore:', error);
  }
}

export async function deleteCodOrder(orderId: string): Promise<void> {
  try {
    const existing = getStoredOrders();
    const updated = existing.filter((o) => o.id !== orderId);
    localStorage.setItem(COD_ORDERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('attahiroun_orders_updated'));
  } catch (e) {
    console.error('Failed to delete COD order locally', e);
  }

  const path = `orders/${orderId}`;
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (error) {
    console.warn('Could not delete order from Firestore:', error);
  }
}

// Fetch orders from Firestore
export async function syncOrdersFromFirestore(): Promise<CodOrder[]> {
  try {
    const snap = await getDocs(collection(db, 'orders'));
    const orders: CodOrder[] = [];
    snap.forEach((docSnap) => {
      orders.push(docSnap.data() as CodOrder);
    });
    if (orders.length > 0) {
      localStorage.setItem(COD_ORDERS_KEY, JSON.stringify(orders));
      window.dispatchEvent(new CustomEvent('attahiroun_orders_updated'));
    }
    return orders;
  } catch (error) {
    console.warn('Could not fetch orders from Firestore:', error);
    return getStoredOrders();
  }
}

// Fetch store settings from Firestore
export async function syncSettingsFromFirestore(): Promise<StoreSettings | null> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'store'));
    if (snap.exists()) {
      const data = snap.data() as StoreSettings;
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('attahiroun_store_updated'));
      return data;
    }
    return null;
  } catch (error) {
    console.warn('Could not fetch settings from Firestore:', error);
    return null;
  }
}

// Fetch products from Firestore
export async function syncProductsFromFirestore(): Promise<Product[]> {
  try {
    const snap = await getDocs(collection(db, 'products'));
    const isInitialized = localStorage.getItem(PRODUCTS_INITIALIZED_KEY) === 'true';

    if (!snap.empty) {
      const prods: Product[] = [];
      snap.forEach((docSnap) => {
        prods.push(docSnap.data() as Product);
      });
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(prods));
      localStorage.setItem(PRODUCTS_INITIALIZED_KEY, 'true');
      window.dispatchEvent(new CustomEvent('attahiroun_store_updated'));
      return prods;
    }

    if (isInitialized) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify([]));
      window.dispatchEvent(new CustomEvent('attahiroun_store_updated'));
      return [];
    }

    localStorage.setItem(PRODUCTS_INITIALIZED_KEY, 'true');
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    seedInitialProductsToFirestore();
    return INITIAL_PRODUCTS;
  } catch (error) {
    console.warn('Could not fetch products from Firestore:', error);
    return getStoredProducts();
  }
}

export function formatPriceDZD(amount: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    maximumFractionDigits: 0
  }).format(amount) + ' د.ج';
}

export function buildWhatsAppLink(
  whatsappNumber: string,
  message: string
): string {
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

