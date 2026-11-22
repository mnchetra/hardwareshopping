import { useState, useEffect } from 'react';
import { PRODUCTS } from './data/products';
import { normalizeProduct, fetchProductsApi, createProductApi, deleteProductApi } from './api';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { AddProductModal } from './components/AddProductModal';
import { CartView } from './components/CartView';
import { CheckoutModal } from './components/CheckoutModal';
import { Toast } from './components/Toast';
import {
  Laptop,
  Mouse,
  Keyboard,
  Monitor,
  Headphones,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  ArrowRight,
  ShoppingBag,
  Plus
} from './components/Icons';
import './App.css';

const currentYear = new Date().getFullYear();

export default function App() {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('techpulse_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState('shop'); // 'shop' or 'cart'
  const [products, setProducts] = useState(() => PRODUCTS.map(normalizeProduct));
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [notification, setNotification] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutSummary, setCheckoutSummary] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Load products from Laravel API
  const loadProducts = async (showFeedback = false) => {
    setIsLoadingProducts(true);
    try {
      const apiData = await fetchProductsApi();
      if (apiData && apiData.length > 0) {
        setProducts(apiData);
      } else {
        // If API returned empty array, keep API status connected
        setProducts(apiData);
      }
      setIsApiConnected(true);
      if (showFeedback) {
        showNotification('Connected to API', 'Live product catalog synchronized from Laravel.', 'success');
      }
    } catch {
      setIsApiConnected(false);
      // Fallback to local products
      setProducts(PRODUCTS.map(normalizeProduct));
      if (showFeedback) {
        showNotification(
          'API Offline',
          'Using demo catalog. Run "php artisan serve" in your Laravel terminal to connect.',
          'info'
        );
      }
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts(false);
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('techpulse_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Toast notification helper
  const showNotification = (title, message = '', type = 'info') => {
    setNotification({ title, message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.title === title ? null : curr));
    }, 3200);
  };

  // Add to cart
  const handleAddToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      } else {
        return [...prevCart, { product, quantity }];
      }
    });

    showNotification(
      'Added to Bag',
      `${quantity}x ${product.name}`,
      'success'
    );
  };

  // Update quantity
  const handleUpdateQty = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  // Remove item
  const handleRemoveItem = (productId) => {
    const itemToRemove = cart.find((item) => item.product.id === productId);
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
    if (itemToRemove) {
      showNotification('Removed', `${itemToRemove.product.name} removed from bag.`, 'info');
    }
  };

  // Clear cart
  const handleClearCart = () => {
    if (window.confirm('Remove all items from your bag?')) {
      setCart([]);
      showNotification('Bag Cleared', 'All items removed.', 'info');
    }
  };

  // Proceed to Checkout
  const handleProceedToCheckout = (summary) => {
    setCheckoutSummary(summary);
    setIsCheckoutOpen(true);
  };

  // Complete Order
  const handleCompleteOrder = (orderId) => {
    setCart([]);
    showNotification('Order Confirmed!', `Order #${orderId} was placed.`, 'success');
  };

  // Handle Add Product (Laravel API with local catalog fallback)
  const handleCreateProduct = async (newProductData) => {
    if (isApiConnected) {
      const created = await createProductApi(newProductData);
      setProducts((prev) => [created, ...prev]);
      showNotification('Product Created', `${created.name} saved to Laravel database!`, 'success');
    } else {
      const fallbackItem = normalizeProduct({
        ...newProductData,
        id: `local-${Date.now()}`
      });
      setProducts((prev) => [fallbackItem, ...prev]);
      showNotification('Product Added', `${newProductData.name} added to catalog.`, 'success');
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (productId) => {
    try {
      if (isApiConnected && (typeof productId === 'number' || !String(productId).startsWith('prod-'))) {
        await deleteProductApi(productId);
      }
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      showNotification('Product Removed', 'The item was deleted.', 'info');
    } catch (err) {
      showNotification('Delete Failed', err.message || 'Could not delete product.', 'error');
    }
  };

  // Filter & Sort Categories
  const categories = [
    { label: 'All Essentials', value: 'All' },
    { label: 'Laptops', value: 'Laptop', icon: Laptop },
    { label: 'Mice', value: 'Mouse', icon: Mouse },
    { label: 'Keyboards', value: 'Keyboard', icon: Keyboard },
    { label: 'Displays', value: 'Monitor', icon: Monitor },
    { label: 'Audio', value: 'Audio', icon: Headphones },
    { label: 'Accessories', value: 'Accessories' }
  ];

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // featured default
  });

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-container">
      {/* Toast Notification */}
      <Toast notification={notification} onClose={() => setNotification(null)} />

      {/* Top Navbar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setActiveTab('cart')}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (activeTab !== 'shop') setActiveTab('shop');
        }}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'shop' ? (
          <div className="storefront-wrapper">
            {/* Minimalist Hero Section */}
            <section className="store-hero">
              <div className="hero-content">

                <h1 className="hero-title">
                  Tools designed for focus.<br />
                  <span className="hero-subheading">Engineered for pure flow.</span>
                </h1>
                <p className="hero-subtitle">
                  A minimal collection of aerospace-grade laptops, ergonomic input tools, acoustic mechanical keyboards, and calibrated 4K displays.
                </p>
                <div className="hero-cta-group">
                  <a href="#product-grid" className="hero-primary-btn">
                    <span>Explore Collection</span>
                    <ArrowRight size={16} />
                  </a>
                  {cart.length > 0 && (
                    <button
                      className="hero-secondary-btn"
                      onClick={() => setActiveTab('cart')}
                    >
                      <ShoppingBag size={16} />
                      <span>View Bag ({totalCartCount})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Minimal perks banner */}
              <div className="hero-perks-row">
                <div className="hero-perk">
                  <Truck size={16} />
                  <span>Complimentary Express Delivery</span>
                </div>
                <div className="hero-perk">
                  <ShieldCheck size={16} />
                  <span>2-Year Comprehensive Warranty</span>
                </div>
                <div className="hero-perk">
                  <RotateCcw size={16} />
                  <span>30-Day In-Home Trial</span>
                </div>
              </div>
            </section>

            {/* Filter & Sorting Controls */}
            <section id="product-grid" className="products-section">
              <div className="section-toolbar">
                {/* Category Pills */}
                <div className="category-tabs-group">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      className={`category-tab-btn ${selectedCategory === cat.value ? 'active' : ''
                        }`}
                      onClick={() => setSelectedCategory(cat.value)}
                    >
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Right toolbar controls: API Status, Add Product, Count & Sort */}
                <div className="toolbar-right-group">
                  <div
                    className={`api-status-pill ${isApiConnected ? 'online' : 'offline'}`}
                    title={
                      isApiConnected
                        ? 'Connected to Laravel Backend API (http://127.0.0.1:8000/api)'
                        : 'API offline: Run "php artisan serve" or click refresh to retry'
                    }
                  >
                    <span className="api-dot" />
                    <span className="api-label">{isApiConnected ? 'Laravel API Live' : 'Demo Mode'}</span>
                    <button
                      type="button"
                      className={`api-refresh-icon-btn ${isLoadingProducts ? 'spinning' : ''}`}
                      onClick={() => loadProducts(true)}
                      disabled={isLoadingProducts}
                      aria-label="Refresh from Laravel API"
                      title="Sync with Laravel API"
                    >
                      ↻
                    </button>
                  </div>

                  <button
                    type="button"
                    className="add-product-trigger-btn"
                    onClick={() => setIsAddProductOpen(true)}
                  >
                    <Plus size={15} />
                    <span>Add Product</span>
                  </button>

                  <span className="products-count-badge">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                  </span>

                  <div className="sorting-selector-wrapper">
                    <select
                      id="sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="sort-select"
                      aria-label="Sort products"
                    >
                      <option value="featured">Featured Picks</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Clean Product Grid (No Cluttered Text) */}
              {filteredProducts.length > 0 ? (
                <div className="products-grid">
                  {filteredProducts.map((product) => {
                    const cartItem = cart.find((item) => item.product.id === product.id);
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onQuickView={(p) => setQuickViewProduct(p)}
                        inCartQty={cartItem ? cartItem.quantity : 0}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="no-products-state">
                  <p>No products found matching "{searchQuery}".</p>
                  <button
                    className="clear-search-btn"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </section>
          </div>
        ) : (
          /* Bag / Cart View */
          <CartView
            cartItems={cart}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onBackToShop={() => setActiveTab('shop')}
            onProceedToCheckout={handleProceedToCheckout}
          />
        )}
      </main>

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onDeleteProduct={handleDeleteProduct}
        inCartQty={
          quickViewProduct
            ? cart.find((i) => i.product.id === quickViewProduct.id)?.quantity || 0
            : 0
        }
      />

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={handleCreateProduct}
        isApiConnected={isApiConnected}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        orderSummary={checkoutSummary || { subtotal: 0, discount: 0, shipping: 0, tax: 0, grandTotal: 0, itemCount: 0 }}
        cartItems={cart}
        onCompleteOrder={handleCompleteOrder}
      />

      {/* Minimal Footer */}
      <footer className="footer-container">
        <div className="footer-inner">
          <div className="footer-brand-side">
            <div className="footer-logo">
              <Sparkles size={18} />
              <span>HardwareShopping</span>
            </div>
            <p className="footer-text">
              Precision desktop hardware and tactile input tools for creative professionals, developers, and thoughtful spaces.
            </p>
          </div>
          <div className="footer-links-grid">
            <div className="footer-col">
              <h5>Hardware</h5>
              <span>Laptops</span>
              <span>Wireless Mice</span>
              <span>Mechanical Keyboards</span>
              <span>4K Displays</span>
              <span>Studio Audio</span>
            </div>
            <div className="footer-col">
              <h5>Service</h5>
              <span>Track Shipping</span>
              <span>Warranty & Care</span>
              <span>Returns & Trial</span>
              <span>Support Desk</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {currentYear} HardwareShopping. Crafted with precision.</p>
        </div>
      </footer>
    </div>
  );
}
