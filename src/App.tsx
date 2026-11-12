import { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductLandingPage } from './components/ProductLandingPage';
import { WhatsAppDirectModal } from './components/WhatsAppDirectModal';
import { SearchModal } from './components/SearchModal';
import { SideDrawerMenu } from './components/SideDrawerMenu';
import { AuthModal } from './components/AuthModal';
import { ContactModal } from './components/ContactModal';
import { AdminProductManagerModal } from './components/AdminProductManagerModal';
import { Footer } from './components/Footer';
import { Product, StoreSettings } from './types/store';
import { INITIAL_CATEGORIES } from './data/initialData';
import { testConnection } from './services/firebase';
import {
  getStoredProducts,
  getStoredSettings,
  syncSettingsFromFirestore,
  syncProductsFromFirestore
} from './services/storeStorage';

export default function App() {
  const [products, setProducts] = useState<Product[]>(getStoredProducts());
  const [settings, setSettings] = useState<StoreSettings>(getStoredSettings());

  // Test Firestore connection and sync remote data on mount
  useEffect(() => {
    testConnection().then((connected) => {
      if (connected) {
        syncSettingsFromFirestore();
        syncProductsFromFirestore();
      }
    });
  }, []);

  // Category selection state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  // Active view: Full Product Landing Page vs Home Catalog
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProductForWhatsApp, setSelectedProductForWhatsApp] = useState<Product | null>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isProductManagerOpen, setIsProductManagerOpen] = useState(false);

  // Sync state when Headless CMS updates data
  const refreshStoreData = () => {
    const updatedProducts = getStoredProducts();
    setProducts(updatedProducts);
    setSettings(getStoredSettings());

    // If currently viewing a product, update its data as well
    if (activeProduct) {
      const match = updatedProducts.find((p) => p.id === activeProduct.id);
      if (match) setActiveProduct(match);
    }
  };

  useEffect(() => {
    const handleStoreUpdated = () => {
      refreshStoreData();
    };
    window.addEventListener('attahiroun_store_updated', handleStoreUpdated);
    return () => {
      window.removeEventListener('attahiroun_store_updated', handleStoreUpdated);
    };
  }, [activeProduct]);

  // Handle URL deep linking and browser back/forward buttons
  const parseProductFromHash = useCallback(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#product-')) {
      const productId = hash.replace('#product-', '');
      const found = products.find((p) => p.id === productId);
      if (found) {
        setActiveProduct(found);
        return;
      }
    }
    setActiveProduct(null);
  }, [products]);

  useEffect(() => {
    parseProductFromHash();
    window.addEventListener('hashchange', parseProductFromHash);
    return () => {
      window.removeEventListener('hashchange', parseProductFromHash);
    };
  }, [parseProductFromHash]);

  // Filtered products by category
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      return selectedCategoryId === 'all' || prod.categoryId === selectedCategoryId;
    });
  }, [products, selectedCategoryId]);

  // View product as full landing page
  const handleViewProduct = (product: Product) => {
    setActiveProduct(product);
    window.location.hash = `product-${product.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return from full product landing page back to home catalog
  const handleBackToCatalog = () => {
    setActiveProduct(null);
    if (window.location.hash.startsWith('#product-')) {
      history.pushState(null, '', window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Direct fast WhatsApp order modal
  const handleDirectOrder = (product: Product) => {
    setSelectedProductForWhatsApp(product);
    setIsWhatsAppModalOpen(true);
  };

  const scrollToCollection = () => {
    const el = document.getElementById('collection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1A1713] flex flex-col font-arabic-luxury selection:bg-[#C8A64D]/25 selection:text-[#8C6819]">
      {/* 
        الشرط: إذا كان هناك منتج محدد، يتم عرضه كصفحة هبوط كاملة وليس كنافذة منبثقة 
      */}
      {activeProduct ? (
        <ProductLandingPage
          product={activeProduct}
          settings={settings}
          onBack={handleBackToCatalog}
        />
      ) : (
        <>
          {/* 1. الشريط العلوي الثابت والشفاف المدمج مع زر البحث وزر الإعدادات */}
          <Navbar
            settings={settings}
            categories={INITIAL_CATEGORIES}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id) => {
              setSelectedCategoryId(id);
              scrollToCollection();
            }}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenMenu={() => setIsSideMenuOpen(true)}
          />

          {/* 2. قسم الـ Hero العريض مع الحواف الدائرية الأنيقة */}
          <Hero
            settings={settings}
            onExploreClick={scrollToCollection}
          />

          {/* 3. شبكة المنتجات: منتجين في سطر واحد مباشرة فوق الخلفية */}
          <main id="collection" className="flex-1 max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3.5 sm:gap-6 lg:gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewProduct={handleViewProduct}
                    onDirectOrder={handleDirectOrder}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center p-8 bg-[#FFFFFF] border border-[#DDD5C5] rounded-2xl max-w-md mx-auto space-y-3 shadow-xs">
                <p className="text-sm font-bold text-[#1A1713]">
                  {products.length === 0
                    ? 'لا توجد منتجات معروضة في المتجر حالياً.'
                    : 'لا توجد منتجات في هذا القسم حالياً.'}
                </p>
                <p className="text-xs text-[#7A6F5D] leading-relaxed">
                  {products.length === 0
                    ? 'سيتم إضافة وتحديث التشكيلة قريباً بإذن الله.'
                    : 'يمكنك اختيار قسم آخر أو الضغط على الزر أدناه لعرض جميع المنتجات.'}
                </p>
                {selectedCategoryId !== 'all' && products.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId('all')}
                    className="px-5 py-2 text-xs font-bold bg-[#C8A64D] text-[#FFFFFF] rounded-lg hover:bg-[#B38D34] shadow-xs cursor-pointer transition-colors"
                  >
                    عرض جميع المنتجات
                  </button>
                )}
              </div>
            )}
          </main>

          {/* 4. الفوتر البسيط والأنيق مع أيقونات التواصل الاجتماعي في سطر واحد */}
          <Footer settings={settings} />
        </>
      )}

      {/* نافذة البحث المنبثقة: تدعم فتح صفحة هبوط المنتج مباشرة */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(prod) => {
          setIsSearchOpen(false);
          handleViewProduct(prod);
        }}
        onFilterByCategory={(catId) => {
          setSelectedCategoryId(catId);
          if (activeProduct) {
            handleBackToCatalog();
          }
          scrollToCollection();
        }}
      />

      {/* نافذة الطلب السريع عبر واتساب إن طلبت */}
      <WhatsAppDirectModal
        product={selectedProductForWhatsApp}
        settings={settings}
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
      />

      {/* القائمة الجانبية المنسحبة من اليسار إلى منتصف الصفحة */}
      <SideDrawerMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        settings={settings}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenAdmin={() => setIsProductManagerOpen(true)}
      />

      {/* لوحة إدارة المنتجات (تظهر فقط عند تسجيل الدخول كمسؤول) */}
      <AdminProductManagerModal
        isOpen={isProductManagerOpen}
        onClose={() => setIsProductManagerOpen(false)}
        products={products}
        onProductsChange={refreshStoreData}
      />

      {/* نافذة تسجيل الدخول */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* نافذة إتصل بنا */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        settings={settings}
      />
    </div>
  );
}
