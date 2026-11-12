import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Check,
  AlertCircle,
  Upload,
  ArrowRight,
  Palette,
  Tag,
  Loader2,
  Eye,
  Settings,
  Package,
  Truck,
  Users,
  Phone,
  PhoneCall,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Boxes,
  Building2,
  ExternalLink,
  MessageSquare,
  Search,
  Filter,
  UserCheck,
  UserX,
  Save,
  RotateCcw
} from 'lucide-react';
import { Product, ProductColor, PartnerCompany, ConfirmationStaff, CodOrder } from '../types/store';
import { INITIAL_CATEGORIES } from '../data/initialData';
import {
  saveSingleProduct,
  deleteProduct,
  deleteAllProducts,
  formatPriceDZD,
  getStoredPartners,
  savePartner,
  deletePartner,
  getStoredStaff,
  saveStaffMember,
  deleteStaffMember,
  getStoredOrders,
  saveCodOrder,
  updateCodOrderFull,
  deleteCodOrder,
  buildWhatsAppLink,
  syncOrdersFromFirestore
} from '../services/storeStorage';
import { compressImageToWebP } from '../utils/imageCompression';

interface AdminProductManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onProductsChange?: () => void;
}

type MainTab = 'products' | 'settings';
type SettingsSubTab = 'quick_edit' | 'partners' | 'staff' | 'orders';

export function AdminProductManagerModal({
  isOpen,
  onClose,
  products,
  onProductsChange
}: AdminProductManagerModalProps) {
  // Navigation
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('products');
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsSubTab>('quick_edit');

  // Mode in Products tab: 'list' | 'add' | 'edit'
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State for Full Add/Edit
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    nameAr: '',
    categoryId: 'men_thobes',
    priceDZD: 5000,
    originalPriceDZD: 6000,
    descriptionAr: '',
    image: '',
    additionalImages: [],
    sizes: ['52', '54', '56', '58'],
    colors: [{ name: 'أبيض ناصع', hex: '#FFFFFF' }],
    inStock: true,
    stockCount: 30,
    fabricAr: 'قماش فاخر عالي الجودة',
    badge: ''
  });

  // State helpers for product form
  const [newSizeInput, setNewSizeInput] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#1A1713');
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // ----------------- SETTINGS SUB-STATES -----------------
  // 1. Quick Product & Stock & Color Edit Tab
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [quickNameAr, setQuickNameAr] = useState('');
  const [quickStockCount, setQuickStockCount] = useState<number>(30);
  const [quickInStock, setQuickInStock] = useState<boolean>(true);
  const [quickColors, setQuickColors] = useState<ProductColor[]>([]);
  const [quickNewColorName, setQuickNewColorName] = useState('');
  const [quickNewColorHex, setQuickNewColorHex] = useState('#1A1713');

  // 2. Partner Companies State
  const [partners, setPartners] = useState<PartnerCompany[]>([]);
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [partnerFormData, setPartnerFormData] = useState<Partial<PartnerCompany>>({
    name: '',
    type: 'delivery',
    phone: '',
    coverageWilayas: 'كافة 58 ولاية',
    address: '',
    notes: '',
    active: true
  });

  // 3. Confirmation Staff State
  const [staffList, setStaffList] = useState<ConfirmationStaff[]>([]);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [staffFormData, setStaffFormData] = useState<Partial<ConfirmationStaff>>({
    name: '',
    phone: '',
    role: 'مسؤول تأكيد الطلبيات',
    active: true,
    notes: ''
  });

  // 4. Customer Orders State
  const [orders, setOrders] = useState<CodOrder[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [rejectionModalOrderId, setRejectionModalOrderId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Sync data on open or changes
  useEffect(() => {
    if (isOpen) {
      setPartners(getStoredPartners());
      setStaffList(getStoredStaff());
      setOrders(getStoredOrders());
      syncOrdersFromFirestore().then((synced) => {
        if (synced && synced.length > 0) setOrders(synced);
      });
    }
  }, [isOpen]);

  // Sync selected product for quick edit
  useEffect(() => {
    if (products.length > 0) {
      const current = products.find((p) => p.id === selectedProductId) || products[0];
      if (current) {
        setSelectedProductId(current.id);
        setQuickNameAr(current.nameAr);
        setQuickStockCount(current.stockCount !== undefined ? current.stockCount : (current.inStock ? 25 : 0));
        setQuickInStock(current.inStock);
        setQuickColors(current.colors || [{ name: 'أبيض', hex: '#FFFFFF' }]);
      }
    }
  }, [selectedProductId, products]);

  if (!isOpen) return null;

  // Open Form for Adding full product
  const handleStartAdd = () => {
    const newId = `product-${Date.now()}`;
    setEditingProduct(null);
    setFormData({
      id: newId,
      name: 'منتج جديد',
      nameAr: '',
      categoryId: 'men_thobes',
      priceDZD: 4500,
      originalPriceDZD: 5500,
      descriptionAr: '',
      image: '',
      additionalImages: [],
      sizes: ['52', '54', '56'],
      colors: [{ name: 'أبيض', hex: '#FFFFFF' }],
      inStock: true,
      stockCount: 30,
      fabricAr: '',
      badge: ''
    });
    setMode('add');
    setActiveMainTab('products');
    setFeedbackMsg(null);
  };

  // Open Form for Editing full product
  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      ...product,
      additionalImages: product.additionalImages || [],
      sizes: product.sizes || [],
      colors: product.colors || [],
      stockCount: product.stockCount !== undefined ? product.stockCount : (product.inStock ? 25 : 0)
    });
    setMode('edit');
    setActiveMainTab('products');
    setFeedbackMsg(null);
  };

  // Handle Image Upload with instant WebP compression
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isPrimary = true) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressingImage(true);
    setFeedbackMsg(null);

    try {
      if (isPrimary) {
        const file = files[0];
        const webpDataUrl = await compressImageToWebP(file, 900, 900, 0.82);
        setFormData((prev) => ({ ...prev, image: webpDataUrl }));
        setFeedbackMsg({
          type: 'success',
          text: 'تم ضغط الصورة الرئيسية بنجاح بصيغة WebP وحفظها للرفع!'
        });
      } else {
        const compressedList: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const webp = await compressImageToWebP(files[i], 900, 900, 0.82);
          compressedList.push(webp);
        }
        setFormData((prev) => ({
          ...prev,
          additionalImages: [...(prev.additionalImages || []), ...compressedList]
        }));
        setFeedbackMsg({
          type: 'success',
          text: `تم ضغط ${compressedList.length} صورة بصيغة WebP وإضافتها لمعرض الصور!`
        });
      }
    } catch (err) {
      console.error(err);
      setFeedbackMsg({
        type: 'error',
        text: 'حدث خطأ أثناء معالجة وضغط الصورة، يرجى المحاولة مرة أخرى.'
      });
    } finally {
      setIsCompressingImage(false);
      e.target.value = '';
    }
  };

  // Add custom size
  const handleAddSize = () => {
    if (!newSizeInput.trim()) return;
    const trimmed = newSizeInput.trim();
    if (!formData.sizes?.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        sizes: [...(prev.sizes || []), trimmed]
      }));
    }
    setNewSizeInput('');
  };

  // Remove size
  const handleRemoveSize = (sizeToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes?.filter((s) => s !== sizeToRemove) || []
    }));
  };

  // Add Color to Full Product Form
  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    const newColor: ProductColor = {
      name: newColorName.trim(),
      hex: newColorHex
    };
    setFormData((prev) => ({
      ...prev,
      colors: [...(prev.colors || []), newColor]
    }));
    setNewColorName('');
  };

  // Remove Color from Full Product Form
  const handleRemoveColor = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors?.filter((_, idx) => idx !== indexToRemove) || []
    }));
  };

  // Remove gallery image
  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalImages: prev.additionalImages?.filter((_, idx) => idx !== indexToRemove) || []
    }));
  };

  // Save product to Firestore and local state
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr?.trim()) {
      setFeedbackMsg({ type: 'error', text: 'يرجى إدخال اسم أو عنوان المنتج.' });
      return;
    }
    if (!formData.priceDZD || formData.priceDZD <= 0) {
      setFeedbackMsg({ type: 'error', text: 'يرجى إدخال سعر صحيح للمنتج.' });
      return;
    }

    setIsSaving(true);
    setFeedbackMsg(null);

    const stockNum = Number(formData.stockCount ?? 25);
    const productToSave: Product = {
      id: formData.id || editingProduct?.id || `prod-${Date.now()}`,
      name: formData.name || formData.nameAr,
      nameAr: formData.nameAr.trim(),
      categoryId: (formData.categoryId as Product['categoryId']) || 'men_thobes',
      priceDZD: Number(formData.priceDZD),
      descriptionAr: formData.descriptionAr || '',
      image: formData.image || '/src/assets/images/hero_luxury_islamic_clothing_1793266734202.jpg',
      additionalImages: formData.additionalImages || [],
      sizes: formData.sizes && formData.sizes.length > 0 ? formData.sizes : ['52', '54', '56'],
      colors: formData.colors && formData.colors.length > 0 ? formData.colors : [{ name: 'أبيض', hex: '#FFFFFF' }],
      inStock: stockNum > 0 && (formData.inStock ?? true),
      stockCount: stockNum,
      fabricAr: formData.fabricAr || '',
      featured: formData.featured ?? true,
      ...(formData.badge && formData.badge.trim() ? { badge: formData.badge.trim() } : {}),
      ...(formData.originalPriceDZD && Number(formData.originalPriceDZD) > 0 ? { originalPriceDZD: Number(formData.originalPriceDZD) } : {})
    };

    try {
      await saveSingleProduct(productToSave);
      setFeedbackMsg({
        type: 'success',
        text: 'تم حفظ المنتج وتخزينه في قاعدة بيانات Firestore بنجاح!'
      });
      if (onProductsChange) onProductsChange();
      setTimeout(() => {
        setMode('list');
        setFeedbackMsg(null);
      }, 1000);
    } catch (err) {
      console.error(err);
      setFeedbackMsg({
        type: 'error',
        text: 'حدث خطأ أثناء حفظ المنتج في قاعدة البيانات. تحقق من الاتصال بالإنترنت.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete product permanently
  const handleDeleteProduct = async (productId: string) => {
    setIsSaving(true);
    try {
      await deleteProduct(productId);
      setDeleteConfirmId(null);
      if (onProductsChange) onProductsChange();
      setFeedbackMsg({
        type: 'success',
        text: 'تم حذف المنتج نهائياً من قاعدة البيانات.'
      });
    } catch (err) {
      console.error(err);
      setFeedbackMsg({
        type: 'error',
        text: 'فشل حذف المنتج من قاعدة البيانات.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete all products permanently
  const handleDeleteAll = async () => {
    setIsSaving(true);
    try {
      await deleteAllProducts();
      setConfirmDeleteAll(false);
      if (onProductsChange) onProductsChange();
      setFeedbackMsg({
        type: 'success',
        text: 'تم حذف جميع المنتجات نهائياً من قاعدة البيانات (لن تعود مجدداً).'
      });
    } catch (err) {
      console.error(err);
      setFeedbackMsg({
        type: 'error',
        text: 'حدث خطأ أثناء محاولة حذف جميع المنتجات.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ----------------- QUICK SETTINGS: NAME, COLOR, STOCK -----------------
  const handleQuickAddColor = () => {
    if (!quickNewColorName.trim()) return;
    setQuickColors([...quickColors, { name: quickNewColorName.trim(), hex: quickNewColorHex }]);
    setQuickNewColorName('');
  };

  const handleQuickRemoveColor = (idx: number) => {
    setQuickColors(quickColors.filter((_, i) => i !== idx));
  };

  const handleSaveQuickSettings = async () => {
    const current = products.find((p) => p.id === selectedProductId);
    if (!current) return;

    if (!quickNameAr.trim()) {
      setFeedbackMsg({ type: 'error', text: 'يرجى إدخال اسم المنتج.' });
      return;
    }

    setIsSaving(true);
    const updatedProduct: Product = {
      ...current,
      nameAr: quickNameAr.trim(),
      name: quickNameAr.trim(),
      colors: quickColors.length > 0 ? quickColors : current.colors,
      stockCount: Math.max(0, quickStockCount),
      inStock: quickStockCount > 0 && quickInStock
    };

    try {
      await saveSingleProduct(updatedProduct);
      if (onProductsChange) onProductsChange();
      setFeedbackMsg({
        type: 'success',
        text: `تم تحديث اسم المنتج "${updatedProduct.nameAr}"، الألوان، والكمية في المخزن (${updatedProduct.stockCount} قطعة) بنجاح!`
      });
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ type: 'error', text: 'فشل تحديث إعدادات المنتج.' });
    } finally {
      setIsSaving(false);
    }
  };

  // ----------------- PARTNER COMPANIES HANDLERS -----------------
  const handleSavePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerFormData.name?.trim()) {
      setFeedbackMsg({ type: 'error', text: 'يرجى إدخال اسم الشركة.' });
      return;
    }
    if (!partnerFormData.phone?.trim()) {
      setFeedbackMsg({ type: 'error', text: 'يرجى إدخال رقم هاتف الشركة.' });
      return;
    }

    const newPartner: PartnerCompany = {
      id: partnerFormData.id || `partner-${Date.now()}`,
      name: partnerFormData.name.trim(),
      type: partnerFormData.type || 'delivery',
      phone: partnerFormData.phone.trim(),
      coverageWilayas: partnerFormData.coverageWilayas || 'كافة 58 ولاية',
      address: partnerFormData.address || '',
      notes: partnerFormData.notes || '',
      active: partnerFormData.active ?? true,
      createdAt: new Date().toISOString()
    };

    setIsSaving(true);
    try {
      await savePartner(newPartner);
      setPartners(getStoredPartners());
      setIsAddingPartner(false);
      setPartnerFormData({
        name: '',
        type: 'delivery',
        phone: '',
        coverageWilayas: 'كافة 58 ولاية',
        address: '',
        notes: '',
        active: true
      });
      setFeedbackMsg({
        type: 'success',
        text: `تم حفظ شركة "${newPartner.name}" بنجاح في قاعدة البيانات!`
      });
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ type: 'error', text: 'حدث خطأ أثناء حفظ بيانات الشركة.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePartner = async (partnerId: string) => {
    try {
      await deletePartner(partnerId);
      setPartners(getStoredPartners());
      setFeedbackMsg({ type: 'success', text: 'تم حذف الشركة بنجاح.' });
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ type: 'error', text: 'فشل حذف الشركة.' });
    }
  };

  // ----------------- CONFIRMATION STAFF HANDLERS -----------------
  const handleSaveStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffFormData.name?.trim()) {
      setFeedbackMsg({ type: 'error', text: 'يرجى إدخال اسم الموظف.' });
      return;
    }
    if (!staffFormData.phone?.trim()) {
      setFeedbackMsg({ type: 'error', text: 'يرجى إدخال رقم هاتف الموظف.' });
      return;
    }

    const newStaff: ConfirmationStaff = {
      id: staffFormData.id || `staff-${Date.now()}`,
      name: staffFormData.name.trim(),
      phone: staffFormData.phone.trim(),
      role: staffFormData.role || 'مسؤول تأكيد الطلبيات',
      active: staffFormData.active ?? true,
      ordersConfirmedCount: staffFormData.ordersConfirmedCount || 0,
      notes: staffFormData.notes || '',
      createdAt: new Date().toISOString()
    };

    setIsSaving(true);
    try {
      await saveStaffMember(newStaff);
      setStaffList(getStoredStaff());
      setIsAddingStaff(false);
      setStaffFormData({
        name: '',
        phone: '',
        role: 'مسؤول تأكيد الطلبيات',
        active: true,
        notes: ''
      });
      setFeedbackMsg({
        type: 'success',
        text: `تمت إضافة الموظف "${newStaff.name}" لفريق تأكيد الطلبيات بنجاح!`
      });
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ type: 'error', text: 'حدث خطأ أثناء حفظ بيانات الموظف.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    try {
      await deleteStaffMember(staffId);
      setStaffList(getStoredStaff());
      setFeedbackMsg({ type: 'success', text: 'تم حذف الموظف من القائمة.' });
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ type: 'error', text: 'فشل حذف الموظف.' });
    }
  };

  // ----------------- ORDER CONFIRMATION / REJECTION HANDLERS -----------------
  const handleUpdateOrderStatus = async (
    orderId: string,
    status: CodOrder['status'],
    rejectionReason?: string,
    assignedStaffName?: string
  ) => {
    setIsSaving(true);
    try {
      const updates: Partial<CodOrder> = {
        status,
        ...(rejectionReason ? { rejectionReason } : {}),
        ...(assignedStaffName ? { confirmedByStaffName: assignedStaffName } : {})
      };
      await updateCodOrderFull(orderId, updates);
      setOrders(getStoredOrders());
      setRejectionModalOrderId(null);
      setRejectionReasonInput('');
      const statusLabel =
        status === 'confirmed'
          ? 'طلبية مؤكدة بنجاح ✅'
          : status === 'rejected'
          ? 'طلبية مرفوضة ❌'
          : status === 'delivered'
          ? 'تم التوصيل بنجاح 🚚'
          : 'قيد الانتظار ⏳';
      setFeedbackMsg({
        type: 'success',
        text: `تم تحديث حالة الطلبية إلى: ${statusLabel}`
      });
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ type: 'error', text: 'حدث خطأ أثناء تحديث حالة الطلبية.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteCodOrder(orderId);
      setOrders(getStoredOrders());
      setFeedbackMsg({ type: 'success', text: 'تم حذف الطلبية بنجاح.' });
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ type: 'error', text: 'فشل حذف الطلبية.' });
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
    if (!orderSearch.trim()) return true;
    const term = orderSearch.toLowerCase();
    return (
      o.customerName.toLowerCase().includes(term) ||
      (o.customerLastName && o.customerLastName.toLowerCase().includes(term)) ||
      o.phone.includes(term) ||
      o.wilaya.toLowerCase().includes(term) ||
      o.orderNumber.toLowerCase().includes(term) ||
      o.product.nameAr.toLowerCase().includes(term)
    );
  });

  const filteredList = products.filter((p) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      p.nameAr.toLowerCase().includes(term) ||
      p.descriptionAr.toLowerCase().includes(term) ||
      p.categoryId.toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl max-h-[94vh] bg-[#FAF9F5] border border-[#DDD5C5] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right font-arabic-luxury"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#E0D7C6] bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              className="p-2 rounded-xl text-[#7A6F5D] hover:text-[#1A1713] hover:bg-black/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#1A1713]">
                  إدارة المتجر والمنتجات
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF5E6] text-[#8C6819] border border-[#E8DCBF]">
                  Firestore
                </span>
              </div>
              <p className="text-xs text-[#8A7C64]">
                الحساب الإداري: <span className="font-mono text-[#8C6819] font-bold">salemlardjane01@gmail.com</span>
              </p>
            </div>
          </div>

          {/* Main Top Navigation Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveMainTab('products');
                setMode('list');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeMainTab === 'products'
                  ? 'bg-[#1A1713] text-[#F3EED9] shadow-xs'
                  : 'bg-[#F0EDE4] text-[#6A5E4D] hover:bg-[#E5E0D5]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>المنتجات والمخزون</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {products.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab('settings')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeMainTab === 'settings'
                  ? 'bg-[#8C6819] text-white shadow-xs'
                  : 'bg-[#FAF5E6] text-[#8C6819] border border-[#E8DCBF] hover:bg-[#F2E8CB]'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>خانة الإعدادات والعمليات</span>
              {orders.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/30 text-white font-mono">
                  {orders.length}
                </span>
              )}
            </button>

            {activeMainTab === 'products' && mode === 'list' && (
              <button
                type="button"
                onClick={handleStartAdd}
                className="px-3 py-1.5 bg-[#8C6819] hover:bg-[#A37B24] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">إضافة منتج</span>
              </button>
            )}

            {activeMainTab === 'products' && mode !== 'list' && (
              <button
                type="button"
                onClick={() => {
                  setMode('list');
                  setFeedbackMsg(null);
                }}
                className="px-3 py-1.5 bg-[#F0EDE4] hover:bg-[#E5E0D5] text-[#1A1713] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة للقائمة</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`px-5 py-2.5 text-xs font-bold flex items-center justify-between border-b ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMsg.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="text-black/40 hover:text-black text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeMainTab === 'settings' ? (
            /* ========================================================================= */
            /* ======================== SETTINGS & OPERATIONS HUB ===================== */
            /* ========================================================================= */
            <div className="space-y-6">
              {/* Settings Sub-Navigation */}
              <div className="bg-white border border-[#E0D7C6] rounded-2xl p-2 flex flex-wrap items-center gap-2 shadow-xs">
                <button
                  type="button"
                  onClick={() => setActiveSettingsTab('quick_edit')}
                  className={`flex-1 min-w-[140px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeSettingsTab === 'quick_edit'
                      ? 'bg-[#8C6819] text-white shadow-xs'
                      : 'bg-transparent text-[#6A5E4D] hover:bg-[#FAF9F5]'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  <span>تعديل المنتج والألوان والمخزن</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSettingsTab('partners')}
                  className={`flex-1 min-w-[140px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeSettingsTab === 'partners'
                      ? 'bg-[#8C6819] text-white shadow-xs'
                      : 'bg-transparent text-[#6A5E4D] hover:bg-[#FAF9F5]'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>الشركات التي أعمل معها</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10">
                    {partners.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSettingsTab('staff')}
                  className={`flex-1 min-w-[140px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeSettingsTab === 'staff'
                      ? 'bg-[#8C6819] text-white shadow-xs'
                      : 'bg-transparent text-[#6A5E4D] hover:bg-[#FAF9F5]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>موظفو تأكيد الطلبيات</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10">
                    {staffList.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSettingsTab('orders')}
                  className={`flex-1 min-w-[140px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeSettingsTab === 'orders'
                      ? 'bg-[#1A1713] text-[#F3EED9] shadow-xs'
                      : 'bg-transparent text-[#6A5E4D] hover:bg-[#FAF9F5]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>تأكيد وإدارة الطلبيات</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-mono">
                    {orders.length}
                  </span>
                </button>
              </div>

              {/* 1. SUB-TAB: QUICK PRODUCT NAME, COLOR & WAREHOUSE STOCK */}
              {activeSettingsTab === 'quick_edit' && (
                <div className="bg-white border border-[#DDD5C5] rounded-2xl p-5 sm:p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-[#EFEBE1] pb-4">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-[#1A1713] flex items-center gap-2">
                        <Boxes className="w-5 h-5 text-[#8C6819]" />
                        <span>تعديل إسم المنتج ولونه والكمية الموجودة في المخزن</span>
                      </h3>
                      <p className="text-xs text-[#8A7C64] mt-0.5">
                        تحكم فوري وسريع في بيانات أي منتج من منتجات المتجر مع الحفظ المباشر
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveQuickSettings}
                      disabled={isSaving || products.length === 0}
                      className="px-4 py-2 bg-[#8C6819] hover:bg-[#A37B24] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>حفظ التعديلات</span>
                    </button>
                  </div>

                  {products.length === 0 ? (
                    <div className="py-12 text-center text-[#8A7C64] space-y-2">
                      <Tag className="w-8 h-8 mx-auto text-[#8C6819]" />
                      <p className="text-sm font-bold">لا يوجد منتجات في المتجر حالياً.</p>
                      <button
                        type="button"
                        onClick={handleStartAdd}
                        className="text-xs text-[#8C6819] underline font-bold"
                      >
                        إضافة أول منتج الآن
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Product Selector */}
                      <div>
                        <label className="block text-xs font-bold text-[#4A4031] mb-1.5">
                          اختر المنتج المراد تعديله:
                        </label>
                        <select
                          value={selectedProductId}
                          onChange={(e) => setSelectedProductId(e.target.value)}
                          className="w-full bg-[#FAF9F5] border border-[#DDD5C5] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1713] font-bold focus:border-[#8C6819] focus:outline-hidden"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nameAr} - ({formatPriceDZD(p.priceDZD)}) {p.stockCount !== undefined ? `[المخزون: ${p.stockCount}]` : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 1. Change Product Name */}
                      <div className="p-4 bg-[#FAF9F5] border border-[#EAE4D7] rounded-xl space-y-2">
                        <label className="block text-xs font-bold text-[#1A1713] flex items-center gap-1.5">
                          <Tag className="w-4 h-4 text-[#8C6819]" />
                          <span>تغيير إسم المنتج (العنوان المعروض للزبائن)</span>
                        </label>
                        <input
                          type="text"
                          value={quickNameAr}
                          onChange={(e) => setQuickNameAr(e.target.value)}
                          placeholder="مثال: ثوب إماراتي فاخر أصيل - قماش ياباني مطرز"
                          className="w-full bg-white border border-[#DDD5C5] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1713] focus:border-[#8C6819] focus:outline-hidden"
                        />
                      </div>

                      {/* 2. Warehouse Stock Quantity */}
                      <div className="p-4 bg-[#FAF9F5] border border-[#EAE4D7] rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-[#1A1713] flex items-center gap-1.5">
                            <Boxes className="w-4 h-4 text-[#8C6819]" />
                            <span>الكمية الموجودة في المخزن (قطع المستودع)</span>
                          </label>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              quickStockCount > 10
                                ? 'bg-emerald-100 text-emerald-800'
                                : quickStockCount > 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {quickStockCount > 0 ? `متوفر بالمخزن (${quickStockCount} قطعة)` : 'نفدت الكمية من المخزن'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2 bg-white border border-[#DDD5C5] rounded-xl p-1">
                            <button
                              type="button"
                              onClick={() => setQuickStockCount((prev) => Math.max(0, prev - 1))}
                              className="w-8 h-8 rounded-lg bg-[#F0EDE4] hover:bg-[#E5E0D5] text-[#1A1713] font-bold flex items-center justify-center cursor-pointer text-sm"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={quickStockCount}
                              onChange={(e) => setQuickStockCount(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-20 text-center font-mono font-bold text-sm text-[#1A1713] focus:outline-hidden"
                            />
                            <button
                              type="button"
                              onClick={() => setQuickStockCount((prev) => prev + 1)}
                              className="w-8 h-8 rounded-lg bg-[#8C6819] hover:bg-[#A37B24] text-white font-bold flex items-center justify-center cursor-pointer text-sm"
                            >
                              +
                            </button>
                          </div>

                          {/* Quick Increment Buttons */}
                          <div className="flex items-center gap-1.5 text-xs">
                            <button
                              type="button"
                              onClick={() => setQuickStockCount((prev) => prev + 10)}
                              className="px-2.5 py-1.5 bg-white border border-[#DDD5C5] hover:border-[#8C6819] rounded-lg text-xs font-bold text-[#1A1713] cursor-pointer"
                            >
                              +10 قطع
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuickStockCount((prev) => prev + 50)}
                              className="px-2.5 py-1.5 bg-white border border-[#DDD5C5] hover:border-[#8C6819] rounded-lg text-xs font-bold text-[#1A1713] cursor-pointer"
                            >
                              +50 قطعة
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuickStockCount(0)}
                              className="px-2.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold cursor-pointer"
                            >
                              تصفير (نفد)
                            </button>
                          </div>

                          {/* Stock Status toggle */}
                          <label className="flex items-center gap-2 cursor-pointer mr-auto text-xs font-bold text-[#1A1713]">
                            <input
                              type="checkbox"
                              checked={quickInStock}
                              onChange={(e) => setQuickInStock(e.target.checked)}
                              className="rounded-sm text-[#8C6819] focus:ring-[#8C6819] w-4 h-4 cursor-pointer"
                            />
                            <span>عرض المنتج كـ "متوفر للطلب" في المتجر</span>
                          </label>
                        </div>
                      </div>

                      {/* 3. Change Product Color */}
                      <div className="p-4 bg-[#FAF9F5] border border-[#EAE4D7] rounded-xl space-y-4">
                        <label className="block text-xs font-bold text-[#1A1713] flex items-center gap-1.5">
                          <Palette className="w-4 h-4 text-[#8C6819]" />
                          <span>تغيير ألوان المنتج وإضافة ألوان جديدة</span>
                        </label>

                        {/* Current Colors Badges */}
                        <div className="flex flex-wrap gap-2">
                          {quickColors.map((col, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#DDD5C5] rounded-xl shadow-2xs text-xs font-bold text-[#1A1713]"
                            >
                              <span
                                className="w-4 h-4 rounded-full border border-black/20"
                                style={{ backgroundColor: col.hex }}
                              />
                              <span>{col.name}</span>
                              <button
                                type="button"
                                onClick={() => handleQuickRemoveColor(idx)}
                                title="حذف هذا اللون"
                                className="text-rose-600 hover:text-rose-800 cursor-pointer p-0.5"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add New Color Section */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#EAE4D7]">
                          <input
                            type="text"
                            placeholder="اسم اللون الجديد (مثال: كحلي ليلي)"
                            value={quickNewColorName}
                            onChange={(e) => setQuickNewColorName(e.target.value)}
                            className="bg-white border border-[#DDD5C5] rounded-xl px-3 py-1.5 text-xs text-[#1A1713] focus:border-[#8C6819] focus:outline-hidden"
                          />
                          <div className="flex items-center gap-1 bg-white border border-[#DDD5C5] rounded-xl px-2 py-1">
                            <input
                              type="color"
                              value={quickNewColorHex}
                              onChange={(e) => setQuickNewColorHex(e.target.value)}
                              className="w-6 h-6 border-0 bg-transparent cursor-pointer"
                            />
                            <span className="font-mono text-xs text-[#8A7C64]">{quickNewColorHex}</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleQuickAddColor}
                            className="px-3 py-1.5 bg-[#8C6819] hover:bg-[#A37B24] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>إضافة اللون</span>
                          </button>

                          {/* Color presets */}
                          <div className="flex items-center gap-1 text-[11px] text-[#8A7C64]">
                            <span>ألوان شائعة:</span>
                            <button
                              type="button"
                              onClick={() => {
                                setQuickColors([...quickColors, { name: 'أبيض ناصع', hex: '#FFFFFF' }]);
                              }}
                              className="px-2 py-0.5 bg-white border border-[#DDD5C5] rounded-md hover:bg-gray-50 cursor-pointer"
                            >
                              أبيض
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setQuickColors([...quickColors, { name: 'أسود ملكي', hex: '#111111' }]);
                              }}
                              className="px-2 py-0.5 bg-white border border-[#DDD5C5] rounded-md hover:bg-gray-50 cursor-pointer"
                            >
                              أسود
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setQuickColors([...quickColors, { name: 'كحلي داكن', hex: '#1B2A4A' }]);
                              }}
                              className="px-2 py-0.5 bg-white border border-[#DDD5C5] rounded-md hover:bg-gray-50 cursor-pointer"
                            >
                              كحلي
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setQuickColors([...quickColors, { name: 'بيج صحراوي', hex: '#D2B48C' }]);
                              }}
                              className="px-2 py-0.5 bg-white border border-[#DDD5C5] rounded-md hover:bg-gray-50 cursor-pointer"
                            >
                              بيج
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setQuickColors([...quickColors, { name: 'رمادي فضي', hex: '#808080' }]);
                              }}
                              className="px-2 py-0.5 bg-white border border-[#DDD5C5] rounded-md hover:bg-gray-50 cursor-pointer"
                            >
                              رمادي
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. SUB-TAB: PARTNER & DELIVERY COMPANIES */}
              {activeSettingsTab === 'partners' && (
                <div className="bg-white border border-[#DDD5C5] rounded-2xl p-5 sm:p-6 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFEBE1] pb-4">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-[#1A1713] flex items-center gap-2">
                        <Truck className="w-5 h-5 text-[#8C6819]" />
                        <span>خانة الشركات التي أعمل معها (شركات التوصيل وموردي الأقمشة)</span>
                      </h3>
                      <p className="text-xs text-[#8A7C64] mt-0.5">
                        إدارة شركات الشحن (مثل: ياليدين إكسبريس، زد آر إكسبريس) وموردي الأقمشة مع أرقام الاتصال والتغطية
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddingPartner(!isAddingPartner)}
                      className="px-3.5 py-2 bg-[#8C6819] hover:bg-[#A37B24] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isAddingPartner ? 'إلغاء' : 'إضافة شركة جديدة'}</span>
                    </button>
                  </div>

                  {/* Add Partner Form */}
                  {isAddingPartner && (
                    <form
                      onSubmit={handleSavePartnerSubmit}
                      className="p-5 bg-[#FAF9F5] border border-[#DDD5C5] rounded-2xl space-y-4 animate-in fade-in"
                    >
                      <h4 className="text-xs font-bold text-[#1A1713]">إضافة شركة شريكة جديدة</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-[#4A4031] mb-1">اسم الشركة *</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: ياليدين إكسبريس (Yalidine)"
                            value={partnerFormData.name || ''}
                            onChange={(e) => setPartnerFormData({ ...partnerFormData, name: e.target.value })}
                            className="w-full bg-white border border-[#DDD5C5] rounded-xl px-3 py-2 text-[#1A1713] focus:border-[#8C6819] focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-[#4A4031] mb-1">نوع الشراكة *</label>
                          <select
                            value={partnerFormData.type || 'delivery'}
                            onChange={(e) =>
                              setPartnerFormData({
                                ...partnerFormData,
                                type: e.target.value as PartnerCompany['type']
                              })
                            }
                            className="w-full bg-white border border-[#DDD5C5] rounded-xl px-3 py-2 text-[#1A1713] focus:border-[#8C6819] focus:outline-hidden"
                          >
                            <option value="delivery">شركة توصيل وشحن (Delivery)</option>
                            <option value="supplier">مورد أقمشة وملابس (Supplier)</option>
                            <option value="logistics">خدمات لوجستية وتغليف (Logistics)</option>
                            <option value="other">شريك تجاري آخر (Other)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-[#4A4031] mb-1">رقم هاتف الاتصال *</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: 0982404040 أو 0671234567"
                            value={partnerFormData.phone || ''}
                            onChange={(e) => setPartnerFormData({ ...partnerFormData, phone: e.target.value })}
                            className="w-full bg-white border border-[#DDD5C5] rounded-xl px-3 py-2 text-[#1A1713] focus:border-[#8C6819] focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-[#4A4031] mb-1">تغطية الولايات / المقر</label>
                          <input
                            type="text"
                            placeholder="مثال: كافة 58 ولاية، أو وكالة تاوقريت / الشلف"
                            value={partnerFormData.coverageWilayas || ''}
                            onChange={(e) =>
                              setPartnerFormData({ ...partnerFormData, coverageWilayas: e.target.value })
                            }
                            className="w-full bg-white border border-[#DDD5C5] rounded-xl px-3 py-2 text-[#1A1713] focus:border-[#8C6819] focus:outline-hidden"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-bold text-[#4A4031] mb-1">ملاحظات وشروط التعامل</label>
                          <input
                            type="text"
                            placeholder="مثال: تسليم مبالغ COD أسبوعياً، شحن مجاني للطلبات فوق 10,000 دج"
                            value={partnerFormData.notes || ''}
                            onChange={(e) => setPartnerFormData({ ...partnerFormData, notes: e.target.value })}
                            className="w-full bg-white border border-[#DDD5C5] rounded-xl px-3 py-2 text-[#1A1713] focus:border-[#8C6819] focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingPartner(false)}
                          className="px-3 py-1.5 bg-white border border-[#DDD5C5] rounded-xl text-xs font-bold cursor-pointer"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-4 py-1.5 bg-[#8C6819] hover:bg-[#A37B24] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          <span>حفظ الشركة</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Partners List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {partners.map((partner) => (
                      <div
                        key={partner.id}
                        className="bg-[#FAF9F5] border border-[#DDD5C5] hover:border-[#8C6819] rounded-2xl p-4 space-y-3 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-white border border-[#DDD5C5] flex items-center justify-center text-[#8C6819]">
                              {partner.type === 'delivery' ? (
                                <Truck className="w-5 h-5" />
                              ) : (
                                <Building2 className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-[#1A1713]">{partner.name}</h4>
                              <span className="text-[11px] text-[#8A7C64] block">
                                {partner.type === 'delivery'
                                  ? 'شركة توصيل وشحن'
                                  : partner.type === 'supplier'
                                  ? 'مورد أقمشة ومواد أولية'
                                  : 'شريك تجاري'}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeletePartner(partner.id)}
                            className="p-1.5 text-[#8A7C64] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="حذف الشركة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-xs space-y-1 text-[#4A4031]">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-[#8C6819]" />
                            <span className="font-mono font-bold" dir="ltr">
                              {partner.phone}
                            </span>
                          </div>
                          {partner.coverageWilayas && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-[#8C6819]" />
                              <span>{partner.coverageWilayas}</span>
                            </div>
                          )}
                          {partner.notes && (
                            <p className="text-[11px] text-[#7A6F5D] bg-white p-2 rounded-xl border border-[#EAE4D7] mt-2">
                              {partner.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-[#EAE4D7]">
                          <a
                            href={`tel:${partner.phone}`}
                            className="flex-1 py-1.5 bg-white border border-[#DDD5C5] hover:border-[#8C6819] rounded-xl text-center text-xs font-bold text-[#1A1713] flex items-center justify-center gap-1.5"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                            <span>اتصال مباشر</span>
                          </a>
                          <a
                            href={buildWhatsAppLink(partner.phone, `السلام عليكم شركة ${partner.name}، بخصوص متجر الطاهرون للثوب الإسلامي.`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>واتساب</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. SUB-TAB: CONFIRMATION STAFF */}
              {activeSettingsTab === 'staff' && (
                <div className="bg-white border border-[#DDD5C5] rounded-2xl p-5 sm:p-6 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFEBE1] pb-4">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-[#1A1713] flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#8C6819]" />
                        <span>موظفو تأكيد الطلبيات (فريق الاتصال بالزبائن وتأكيد المقاسات)</span>
                      </h3>
                      <p className="text-xs text-[#8A7C64] mt-0.5">
                        إدارة الموظفين المكلفين بالاتصال هاتفياً بالزبائن لتأكيد الطلبيات وإرسالها للتوصيل
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddingStaff(!isAddingStaff)}
                      className="px-3.5 py-2 bg-[#8C6819] hover:bg-[#A37B24] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isAddingStaff ? 'إلغاء' : 'إضافة موظف جديد'}</span>
                    </button>
                  </div>

                  {/* Add Staff Form */}
                  {isAddingStaff && (
                    <form
                      onSubmit={handleSaveStaffSubmit}
                      className="p-5 bg-[#FAF9F5] border border-[#DDD5C5] rounded-2xl space-y-4 animate-in fade-in"
                    >
                      <h4 className="text-xs font-bold text-[#1A1713]">إضافة موظف تأكيد طلبيات جديد</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-[#4A4031] mb-1">اسم الموظف الكامل *</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: أحمد الطاهر"
                            value={staffFormData.name || ''}
                            onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                            className="w-full bg-white border border-[#DDD5C5] rounded-xl px-3 py-2 text-[#1A1713] focus:border-[#8C6819] focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-[#4A4031] mb-1">رقم الهاتف *</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: 0671889900"
                            value={staffFormData.phone || ''}
                            onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                            className="w-full bg-white border border-[#DDD5C5] rounded-xl px-3 py-2 text-[#1A1713] focus:border-[#8C6819] focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-[#4A4031] mb-1">الدور الوظيفي</label>
                          <input
                            type="text"
                            placeholder="مثال: مسؤول تأكيد الطلبيات والمقاسات"
                            value={staffFormData.role || ''}
                            onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value })}
                            className="w-full bg-white border border-[#DDD5C5] rounded-xl px-3 py-2 text-[#1A1713] focus:border-[#8C6819] focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-[#4A4031] mb-1">حالة العمل</label>
                          <select
                            value={staffFormData.active ? 'active' : 'inactive'}
                            onChange={(e) =>
                              setStaffFormData({ ...staffFormData, active: e.target.value === 'active' })
                            }
                            className="w-full bg-white border border-[#DDD5C5] rounded-xl px-3 py-2 text-[#1A1713] focus:border-[#8C6819] focus:outline-hidden"
                          >
                            <option value="active">نشط (يعمل على تأكيد الطلبيات)</option>
                            <option value="inactive">غير نشط / في عطلة</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingStaff(false)}
                          className="px-3 py-1.5 bg-white border border-[#DDD5C5] rounded-xl text-xs font-bold cursor-pointer"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-4 py-1.5 bg-[#8C6819] hover:bg-[#A37B24] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          <span>حفظ الموظف</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Staff List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {staffList.map((staff) => (
                      <div
                        key={staff.id}
                        className="bg-[#FAF9F5] border border-[#DDD5C5] hover:border-[#8C6819] rounded-2xl p-4 space-y-3 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-full bg-white border border-[#DDD5C5] flex items-center justify-center text-[#8C6819] font-bold">
                              {staff.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-[#1A1713]">{staff.name}</h4>
                                <span
                                  className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                                    staff.active
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-gray-200 text-gray-700'
                                  }`}
                                >
                                  {staff.active ? 'نشط' : 'غير نشط'}
                                </span>
                              </div>
                              <span className="text-[11px] text-[#8A7C64]">{staff.role}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteStaff(staff.id)}
                            className="p-1.5 text-[#8A7C64] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="حذف الموظف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-xs space-y-1 text-[#4A4031]">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-[#8C6819]" />
                            <span className="font-mono font-bold" dir="ltr">
                              {staff.phone}
                            </span>
                          </div>
                          {staff.ordersConfirmedCount !== undefined && (
                            <div className="text-[11px] text-[#8A7C64]">
                              إجمالي الطلبيات المؤكدة بواسطة الموظف:{' '}
                              <span className="font-bold text-[#8C6819] font-mono">
                                {staff.ordersConfirmedCount} طلبية
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-[#EAE4D7]">
                          <a
                            href={`tel:${staff.phone}`}
                            className="flex-1 py-1.5 bg-white border border-[#DDD5C5] hover:border-[#8C6819] rounded-xl text-center text-xs font-bold text-[#1A1713] flex items-center justify-center gap-1.5"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                            <span>اتصال بالموظف</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. SUB-TAB: CUSTOMER ORDERS & CONFIRMATION / REJECTION */}
              {activeSettingsTab === 'orders' && (
                <div className="bg-white border border-[#DDD5C5] rounded-2xl p-5 sm:p-6 space-y-6">
                  {/* Top Bar with Filter & Stats */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFEBE1] pb-4">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-[#1A1713] flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>تأكيد طلبيات الزبائن وتفاصيل التوصيل (مؤكدة / مرفوضة)</span>
                      </h3>
                      <p className="text-xs text-[#8A7C64] mt-0.5">
                        عرض أرقام هواتف الزبائن، الاسم واللقب، الولاية ومكان التوصيل مع إمكانية تأكيد أو رفض الطلبية
                      </p>
                    </div>

                    {/* Stats pills */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold">
                        مؤكدة: {orders.filter((o) => o.status === 'confirmed').length}
                      </span>
                      <span className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl font-bold">
                        مرفوضة: {orders.filter((o) => o.status === 'rejected').length}
                      </span>
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl font-bold">
                        جديدة: {orders.filter((o) => o.status === 'new').length}
                      </span>
                    </div>
                  </div>

                  {/* Filter and Search Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-[#8A7C64] absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="ابحث برقم الهاتف، الاسم، اللقب، أو الولاية..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full bg-[#FAF9F5] border border-[#DDD5C5] rounded-xl pr-9 pl-4 py-2 text-xs sm:text-sm text-[#1A1713] focus:border-[#8C6819] focus:outline-hidden"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setOrderStatusFilter('all')}
                        className={`px-3 py-1.5 rounded-xl cursor-pointer ${
                          orderStatusFilter === 'all'
                            ? 'bg-[#1A1713] text-white'
                            : 'bg-[#F0EDE4] text-[#6A5E4D] hover:bg-[#E5E0D5]'
                        }`}
                      >
                        الكل ({orders.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderStatusFilter('confirmed')}
                        className={`px-3 py-1.5 rounded-xl cursor-pointer ${
                          orderStatusFilter === 'confirmed'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        طلبيات مؤكدة
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderStatusFilter('rejected')}
                        className={`px-3 py-1.5 rounded-xl cursor-pointer ${
                          orderStatusFilter === 'rejected'
                            ? 'bg-rose-600 text-white'
                            : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                        }`}
                      >
                        طلبيات مرفوضة
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderStatusFilter('new')}
                        className={`px-3 py-1.5 rounded-xl cursor-pointer ${
                          orderStatusFilter === 'new'
                            ? 'bg-amber-600 text-white'
                            : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                        }`}
                      >
                        قيد الانتظار
                      </button>
                    </div>
                  </div>

                  {/* Orders List / Cards */}
                  {filteredOrders.length === 0 ? (
                    <div className="py-12 text-center text-[#8A7C64] bg-[#FAF9F5] rounded-2xl border border-[#DDD5C5] space-y-2 p-6">
                      <Clock className="w-8 h-8 mx-auto text-[#8C6819]" />
                      <h4 className="font-bold text-sm text-[#1A1713]">لا توجد طلبيات تطابق البحث حالياً</h4>
                      <p className="text-xs text-[#8A7C64]">
                        عندما يقوم أي زبون بطلب ثوب أو قميص عبر صفحة الهبوط، ستظهر الطلبية وتفاصيل التوصيل هنا فوراً.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredOrders.map((order) => {
                        const isConfirmed = order.status === 'confirmed';
                        const isRejected = order.status === 'rejected';

                        return (
                          <div
                            key={order.id}
                            className={`border rounded-2xl p-4 sm:p-5 transition-all space-y-4 ${
                              isConfirmed
                                ? 'bg-emerald-50/40 border-emerald-300'
                                : isRejected
                                ? 'bg-rose-50/40 border-rose-300'
                                : 'bg-white border-[#DDD5C5]'
                            }`}
                          >
                            {/* Card Header: Order #, Date, Status */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE4D7] pb-3">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs bg-[#FAF5E6] text-[#8C6819] px-2.5 py-1 rounded-lg border border-[#E8DCBF]">
                                  #{order.orderNumber}
                                </span>
                                <span className="text-xs text-[#8A7C64]">
                                  {new Date(order.createdAt).toLocaleDateString('ar-DZ', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {isConfirmed && (
                                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-2xs">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>طلبية مؤكدة</span>
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white flex items-center gap-1 shadow-2xs">
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>طلبية مرفوضة</span>
                                  </span>
                                )}
                                {order.status === 'new' && (
                                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>قيد الانتظار (جديدة)</span>
                                  </span>
                                )}
                                {order.status === 'delivered' && (
                                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white flex items-center gap-1">
                                    <Truck className="w-3.5 h-3.5" />
                                    <span>تم التوصيل</span>
                                  </span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="text-[#8A7C64] hover:text-rose-600 p-1 cursor-pointer"
                                  title="حذف الطلبية"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Customer Information & Delivery Location Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                              {/* 1. Customer Details: First Name, Last Name & Phone */}
                              <div className="p-3 bg-[#FAF9F5] border border-[#EAE4D7] rounded-xl space-y-2">
                                <h5 className="font-bold text-[#8C6819] flex items-center gap-1.5">
                                  <Users className="w-4 h-4" />
                                  <span>بيانات الزبون ورقم الهاتف:</span>
                                </h5>

                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[#8A7C64]">الإسم واللقب:</span>
                                    <span className="font-bold text-[#1A1713] text-sm">
                                      {order.customerName} {order.customerLastName ? order.customerLastName : ''}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between pt-1 border-t border-[#EAE4D7]">
                                    <span className="text-[#8A7C64]">رقم الهاتف:</span>
                                    <a
                                      href={`tel:${order.phone}`}
                                      className="font-mono font-bold text-sm text-[#8C6819] hover:underline"
                                      dir="ltr"
                                    >
                                      {order.phone}
                                    </a>
                                  </div>
                                </div>

                                {/* Direct Call & WhatsApp buttons */}
                                <div className="flex items-center gap-2 pt-2">
                                  <a
                                    href={`tel:${order.phone}`}
                                    className="flex-1 py-1.5 bg-white border border-[#DDD5C5] hover:border-emerald-600 rounded-lg text-center text-[11px] font-bold text-[#1A1713] flex items-center justify-center gap-1"
                                  >
                                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>اتصال هاتفي</span>
                                  </a>
                                  <a
                                    href={buildWhatsAppLink(
                                      order.phone,
                                      `السلام عليكم أخ ${order.customerName}، معكم متجر الطاهرون للثوب الإسلامي بخصوص طلبيتكم رقم (${order.orderNumber}) لـ: ${order.product.nameAr}.`
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>واتساب</span>
                                  </a>
                                </div>
                              </div>

                              {/* 2. Wilaya & Delivery Location */}
                              <div className="p-3 bg-[#FAF9F5] border border-[#EAE4D7] rounded-xl space-y-2">
                                <h5 className="font-bold text-[#8C6819] flex items-center gap-1.5">
                                  <MapPin className="w-4 h-4" />
                                  <span>الولاية ومكان التوصيل:</span>
                                </h5>

                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[#8A7C64]">الولاية:</span>
                                    <span className="font-bold text-[#1A1713]">{order.wilaya}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[#8A7C64]">البلدية:</span>
                                    <span className="font-bold text-[#1A1713]">{order.baladiya}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[#8A7C64]">مكان الاستلام:</span>
                                    <span className="font-bold text-[#1A1713]">
                                      {order.deliveryType === 'المنزل' ? '🏠 إلى باب المنزل' : '🏢 مكتب شركة التوصيل'}
                                    </span>
                                  </div>
                                  {order.deliveryAddress && (
                                    <p className="text-[11px] text-[#7A6F5D] bg-white p-1.5 rounded-md border border-[#EAE4D7]">
                                      {order.deliveryAddress}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* 3. Product & Order Amount */}
                              <div className="p-3 bg-[#FAF9F5] border border-[#EAE4D7] rounded-xl space-y-2">
                                <h5 className="font-bold text-[#8C6819] flex items-center gap-1.5">
                                  <Package className="w-4 h-4" />
                                  <span>المنتج والإجمالي:</span>
                                </h5>

                                <div className="flex items-center gap-2">
                                  <img
                                    src={order.product.image}
                                    alt={order.product.nameAr}
                                    className="w-12 h-12 rounded-lg object-cover border border-[#DDD5C5]"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-[#1A1713] truncate">{order.product.nameAr}</p>
                                    <p className="text-[11px] text-[#8A7C64]">
                                      المقاس: <span className="font-bold">{order.selectedSize || 'عادي'}</span> | اللون: <span className="font-bold">{order.selectedColor || 'الأصلي'}</span>
                                    </p>
                                    <p className="text-[11px] text-[#8A7C64]">
                                      الكمية: <span className="font-bold">{order.quantity}</span> | الإجمالي:{' '}
                                      <span className="font-bold text-[#8C6819] font-mono">
                                        {formatPriceDZD(order.totalDZD)}
                                      </span>
                                    </p>
                                  </div>
                                </div>

                                {order.rejectionReason && (
                                  <div className="p-1.5 bg-rose-50 border border-rose-200 rounded-md text-[11px] text-rose-800">
                                    <span className="font-bold">سبب الرفض:</span> {order.rejectionReason}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Confirmation & Rejection Action Buttons Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EAE4D7]">
                              {/* Assigned staff dropdown */}
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-[#8A7C64] font-bold">الموظف المؤكِّد:</span>
                                <select
                                  value={order.confirmedByStaffName || ''}
                                  onChange={(e) => {
                                    handleUpdateOrderStatus(
                                      order.id,
                                      order.status,
                                      order.rejectionReason,
                                      e.target.value
                                    );
                                  }}
                                  className="bg-white border border-[#DDD5C5] rounded-lg px-2.5 py-1 text-xs text-[#1A1713] font-bold focus:border-[#8C6819] focus:outline-hidden"
                                >
                                  <option value="">-- اختر الموظف --</option>
                                  {staffList.map((s) => (
                                    <option key={s.id} value={s.name}>
                                      {s.name} ({s.role})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Action Buttons: Confirm or Reject */}
                              <div className="flex items-center gap-2 text-xs">
                                {/* Confirm Button */}
                                <button
                                  type="button"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                                  disabled={isSaving}
                                  className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    isConfirmed
                                      ? 'bg-emerald-700 text-white ring-2 ring-emerald-300'
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                  }`}
                                >
                                  <Check className="w-4 h-4" />
                                  <span>طلبية مؤكدة</span>
                                </button>

                                {/* Reject Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectionModalOrderId(order.id);
                                    setRejectionReasonInput('');
                                  }}
                                  disabled={isSaving}
                                  className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    isRejected
                                      ? 'bg-rose-700 text-white ring-2 ring-rose-300'
                                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                  }`}
                                >
                                  <X className="w-4 h-4" />
                                  <span>طلبية مرفوضة</span>
                                </button>

                                {/* Pending Reset */}
                                {order.status !== 'new' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateOrderStatus(order.id, 'new')}
                                    className="px-2.5 py-2 bg-white text-[#8A7C64] hover:text-[#1A1713] border border-[#DDD5C5] rounded-xl text-xs font-bold cursor-pointer"
                                    title="إرجاع إلى قيد الانتظار"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Rejection Modal for entering rejection reason */}
                  {rejectionModalOrderId && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
                      <div className="bg-white border border-[#DDD5C5] rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl text-right">
                        <div className="flex items-center justify-between border-b pb-2">
                          <h4 className="font-bold text-sm text-rose-700 flex items-center gap-1.5">
                            <XCircle className="w-4 h-4" />
                            <span>تحديد الطلبية كـ "مرفوضة"</span>
                          </h4>
                          <button
                            type="button"
                            onClick={() => setRejectionModalOrderId(null)}
                            className="text-[#8A7C64] hover:text-[#1A1713]"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-xs text-[#8A7C64]">
                          يرجى اختيار أو كتابة سبب رفض الطلبية لمتابعة الإحصائيات مع فريق العمل:
                        </p>
                        <div className="space-y-1.5 text-xs">
                          {['الزبون لم يرد على الهاتف بعد عدة محاولات', 'الزبون تراجع وألغى الطلب بنفسه', 'رقم الهاتف خاطئ أو مغلق', 'خارج نطاق التغطية أو العنوان غير واضح'].map(
                            (reason) => (
                              <button
                                key={reason}
                                type="button"
                                onClick={() => setRejectionReasonInput(reason)}
                                className="w-full text-right p-2 rounded-lg bg-[#FAF9F5] hover:bg-[#F0EDE4] border border-[#EAE4D7] text-[#1A1713] font-bold cursor-pointer block"
                              >
                                {reason}
                              </button>
                            )
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="أو اكتب سبباً آخر هنا..."
                          value={rejectionReasonInput}
                          onChange={(e) => setRejectionReasonInput(e.target.value)}
                          className="w-full bg-white border border-[#DDD5C5] rounded-xl p-2.5 text-xs text-[#1A1713] focus:border-rose-600 focus:outline-hidden"
                        />
                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setRejectionModalOrderId(null)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            إلغاء
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateOrderStatus(
                                rejectionModalOrderId,
                                'rejected',
                                rejectionReasonInput || 'الزبون لم يؤكد الطلبية'
                              )
                            }
                            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            تأكيد الرفض
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : mode === 'list' ? (
            /* ========================================================================= */
            /* ======================== PRODUCTS LIST VIEW ============================= */
            /* ========================================================================= */
            <div className="space-y-4">
              {/* Filter bar and Bulk Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="ابحث عن منتج بالاسم أو القسم..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="flex-1 bg-white border border-[#DDD5C5] rounded-xl px-4 py-2 text-xs sm:text-sm text-[#1A1713] placeholder-[#8A7C64] focus:outline-hidden focus:border-[#8C6819]"
                />

                <div className="flex items-center gap-2 justify-between sm:justify-end">
                  <span className="text-xs text-[#8A7C64] font-bold px-1 whitespace-nowrap">
                    الإجمالي: {products.length} منتج
                  </span>

                  {products.length > 0 &&
                    (confirmDeleteAll ? (
                      <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={handleDeleteAll}
                          disabled={isSaving}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                        >
                          تأكيد حذف الكل
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteAll(false)}
                          className="px-2 py-1 bg-white text-[#1A1713] border border-[#DDD5C5] rounded-lg text-[11px] font-bold cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteAll(true)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        title="حذف جميع المنتجات نهائياً من قاعدة البيانات"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف جميع المنتجات</span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Products Table/Grid or Permanent Empty State */}
              {products.length === 0 ? (
                <div className="py-16 text-center text-[#8A7C64] bg-white rounded-2xl border border-[#DDD5C5] space-y-3 p-6">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF5E6] flex items-center justify-center text-[#8C6819]">
                    <Tag className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-[#1A1713]">
                    المتجر فارغ حالياً (تم حذف جميع المنتجات نهائياً)
                  </h4>
                  <p className="text-xs text-[#8A7C64] max-w-sm mx-auto leading-relaxed">
                    تم حذف المنتجات نهائياً ولن تعود مجدداً بشكل تلقائي. يمكنك إضافة منتجاتك وصورك الجديدة متى شئت.
                  </p>
                  <button
                    type="button"
                    onClick={handleStartAdd}
                    className="px-4 py-2 bg-[#8C6819] hover:bg-[#A37B24] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة أول منتج للمتجر</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredList.map((product) => {
                    const isDeleting = deleteConfirmId === product.id;
                    const stock = product.stockCount !== undefined ? product.stockCount : (product.inStock ? 25 : 0);

                    return (
                      <div
                        key={product.id}
                        className="bg-white border border-[#DDD5C5] hover:border-[#8C6819] rounded-2xl p-4 flex flex-col justify-between transition-all group"
                      >
                        <div className="space-y-3">
                          <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-[#F0EDE4] border border-[#DDD5C5]">
                            <img
                              src={product.image}
                              alt={product.nameAr}
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  stock > 0
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-rose-600 text-white'
                                }`}
                              >
                                {stock > 0 ? `المخزن: ${stock} قطعة` : 'نفد من المخزن'}
                              </span>
                              {product.badge && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8C6819] text-white">
                                  {product.badge}
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-sm text-[#1A1713] line-clamp-1">
                              {product.nameAr}
                            </h3>
                            <p className="text-xs text-[#8A7C64] line-clamp-2 mt-1 leading-relaxed">
                              {product.descriptionAr}
                            </p>
                          </div>

                          {/* Sizes & Colors preview */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {product.colors?.map((col, idx) => (
                              <span
                                key={idx}
                                className="w-3.5 h-3.5 rounded-full border border-black/20"
                                style={{ backgroundColor: col.hex }}
                                title={col.name}
                              />
                            ))}
                            <span className="text-[10px] text-[#8A7C64] mr-2">
                              المقاسات: {product.sizes?.join(', ')}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-[#F0EDE4]">
                            <div>
                              <span className="text-xs font-bold text-[#8C6819] font-mono">
                                {formatPriceDZD(product.priceDZD)}
                              </span>
                              {product.originalPriceDZD && (
                                <span className="text-[10px] text-[#8A7C64] line-through mr-1 font-mono">
                                  {formatPriceDZD(product.originalPriceDZD)}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#8A7C64]">
                              {INITIAL_CATEGORIES.find((c) => c.id === product.categoryId)?.nameAr || 'منتج إسلامي'}
                            </span>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="mt-4 pt-3 border-t border-[#F0EDE4] flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(product)}
                            className="flex-1 py-1.5 px-3 bg-[#FAF5E6] hover:bg-[#F2E8CB] text-[#8C6819] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>تعديل كامل</span>
                          </button>

                          {isDeleting ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(product.id)}
                                disabled={isSaving}
                                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                              >
                                تأكيد
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1.5 bg-white border border-[#DDD5C5] text-[#1A1713] rounded-xl text-xs font-bold cursor-pointer"
                              >
                                إلغاء
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(product.id)}
                              className="p-1.5 text-[#8A7C64] hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                              title="حذف المنتج نهائياً من قاعدة البيانات"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ========================================================================= */
            /* ======================== ADD / FULL EDIT PRODUCT FORM =================== */
            /* ========================================================================= */
            <form onSubmit={handleSaveProduct} className="space-y-6">
              <div className="bg-white border border-[#DDD5C5] rounded-2xl p-5 sm:p-6 space-y-5">
                <h3 className="text-sm sm:text-base font-bold text-[#1A1713] border-b border-[#F0EDE4] pb-3">
                  {mode === 'add' ? 'إضافة منتج جديد وتخزينه في Firestore' : `تعديل المنتج: ${editingProduct?.nameAr}`}
                </h3>

                {/* Primary Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4A4031] mb-1.5">
                      عنوان أو اسم المنتج (بالعربية) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: قميص إماراتي ملكي أبيض فاخر"
                      value={formData.nameAr || ''}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                      className="w-full bg-[#FAF9F5] border border-[#DDD5C5] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1713] focus:border-[#8C6819] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A4031] mb-1.5">
                      القسم والتصنيف *
                    </label>
                    <select
                      value={formData.categoryId || 'men_thobes'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          categoryId: e.target.value as Product['categoryId']
                        })
                      }
                      className="w-full bg-[#FAF9F5] border border-[#DDD5C5] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1713] focus:border-[#8C6819] focus:outline-hidden"
                    >
                      {INITIAL_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nameAr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A4031] mb-1.5">
                      سعر البيع (دينار جزائري DZD) *
                    </label>
                    <input
                      type="number"
                      required
                      min="100"
                      step="50"
                      placeholder="4500"
                      value={formData.priceDZD || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, priceDZD: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-[#FAF9F5] border border-[#DDD5C5] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1713] font-mono focus:border-[#8C6819] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A4031] mb-1.5">
                      الكمية في المخزن (Warehouse Inventory)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="30"
                      value={formData.stockCount ?? 30}
                      onChange={(e) =>
                        setFormData({ ...formData, stockCount: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-[#FAF9F5] border border-[#DDD5C5] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1713] font-mono focus:border-[#8C6819] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A4031] mb-1.5">
                      السعر السابق قبل التخفيض (اختياري)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      placeholder="5500"
                      value={formData.originalPriceDZD || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          originalPriceDZD: parseFloat(e.target.value) || undefined
                        })
                      }
                      className="w-full bg-[#FAF9F5] border border-[#DDD5C5] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1713] font-mono focus:border-[#8C6819] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A4031] mb-1.5">
                      شارة مميزة (Badge مثل: الأكثر طلباً، حصري)
                    </label>
                    <input
                      type="text"
                      placeholder="الأكثر مبيعاً"
                      value={formData.badge || ''}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      className="w-full bg-[#FAF9F5] border border-[#DDD5C5] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1713] focus:border-[#8C6819] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-[#4A4031] mb-1.5">
                    وصف المنتج ومميزات القماش والخياطة
                  </label>
                  <textarea
                    rows={3}
                    placeholder="ثوب صيفي فاخر منسوج من أجود خيوط القطن الكوري المعالج، يتميز بياقة كلاسيكية وتطريز يدوي متقن عند الأكمام والصدر..."
                    value={formData.descriptionAr || ''}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#DDD5C5] rounded-xl p-3 text-xs sm:text-sm text-[#1A1713] focus:border-[#8C6819] focus:outline-hidden"
                  />
                </div>

                {/* Primary Image Upload with instant WebP compression */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#4A4031]">
                    الصورة الرئيسية للمنتج (تضغط وتحفظ بصيغة WebP فائقة السرعة)
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    {formData.image ? (
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#DDD5C5] bg-[#F0EDE4] shrink-0">
                        <img
                          src={formData.image}
                          alt="Primary preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black text-white rounded-full text-xs"
                          title="حذف الصورة"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-xl border-2 border-dashed border-[#DDD5C5] flex flex-col items-center justify-center text-[#8A7C64] shrink-0">
                        <Upload className="w-5 h-5 mb-1" />
                        <span className="text-[10px]">لا توجد صورة</span>
                      </div>
                    )}

                    <div className="flex-1 space-y-1">
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#DDD5C5] hover:border-[#8C6819] rounded-xl text-xs font-bold text-[#1A1713] cursor-pointer transition-all">
                        {isCompressingImage ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#8C6819]" />
                        ) : (
                          <Upload className="w-4 h-4 text-[#8C6819]" />
                        )}
                        <span>اختر صورة رئيسية من جهازك</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, true)}
                          className="hidden"
                          disabled={isCompressingImage}
                        />
                      </label>
                      <p className="text-[11px] text-[#8A7C64]">
                        يتم ضغط الصورة تلقائياً لتقليل حجمها وسرعة تحميلها في قاعدة البيانات.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Gallery Images */}
                <div className="space-y-2 pt-2 border-t border-[#F0EDE4]">
                  <label className="block text-xs font-bold text-[#4A4031]">
                    صور إضافية لمعرض المنتج (اختياري - WebP)
                  </label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {formData.additionalImages?.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#DDD5C5] bg-[#F0EDE4]"
                      >
                        <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="absolute top-1 right-1 p-0.5 bg-black/70 hover:bg-black text-white rounded-full text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <label className="w-16 h-16 rounded-xl border-2 border-dashed border-[#DDD5C5] hover:border-[#8C6819] flex flex-col items-center justify-center text-[#8A7C64] cursor-pointer transition-all">
                      <Plus className="w-4 h-4" />
                      <span className="text-[9px]">إضافة</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(e, false)}
                        className="hidden"
                        disabled={isCompressingImage}
                      />
                    </label>
                  </div>
                </div>

                {/* Sizes */}
                <div className="space-y-2 pt-2 border-t border-[#F0EDE4]">
                  <label className="block text-xs font-bold text-[#4A4031]">
                    المقاسات المتوفرة
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {formData.sizes?.map((size) => (
                      <span
                        key={size}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF5E6] border border-[#E8DCBF] rounded-xl text-xs font-bold text-[#8C6819]"
                      >
                        <span>{size}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(size)}
                          className="hover:text-rose-600 text-[10px] cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="مقاس جديد (مثال: 58)"
                        value={newSizeInput}
                        onChange={(e) => setNewSizeInput(e.target.value)}
                        className="w-32 bg-[#FAF9F5] border border-[#DDD5C5] rounded-xl px-3 py-1 text-xs text-[#1A1713]"
                      />
                      <button
                        type="button"
                        onClick={handleAddSize}
                        className="px-2.5 py-1 bg-[#8C6819] text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        إضافة
                      </button>
                    </div>
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-2 pt-2 border-t border-[#F0EDE4]">
                  <label className="block text-xs font-bold text-[#4A4031]">
                    الألوان المتوفرة
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {formData.colors?.map((col, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#DDD5C5] rounded-xl text-xs font-bold text-[#1A1713]"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span>{col.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(idx)}
                          className="hover:text-rose-600 text-[10px] cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}

                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="اسم اللون"
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                        className="w-24 bg-[#FAF9F5] border border-[#DDD5C5] rounded-xl px-2.5 py-1 text-xs text-[#1A1713]"
                      />
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-7 h-7 border-0 bg-transparent cursor-pointer rounded-md"
                      />
                      <button
                        type="button"
                        onClick={handleAddColor}
                        className="px-2.5 py-1 bg-[#8C6819] text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        إضافة
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('list');
                    setFeedbackMsg(null);
                  }}
                  className="px-4 py-2.5 bg-white border border-[#DDD5C5] hover:bg-[#F0EDE4] text-[#1A1713] rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-all"
                >
                  إلغاء والعودة
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#8C6819] hover:bg-[#A37B24] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{mode === 'add' ? 'حفظ وتثبيت المنتج في Firestore' : 'تحديث المنتج'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
