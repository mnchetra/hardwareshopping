import { ShoppingBag, Sparkles, Search } from './Icons';

export function Navbar({ cartCount, onOpenCart, activeTab, onSelectTab, searchQuery, onSearchChange }) {
  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand / Logo */}
        <div className="nav-brand" onClick={() => onSelectTab('shop')}>
          <div className="brand-logo-icon">
            <Sparkles size={18} />
          </div>
          <div className="brand-text">
            <span className="brand-name">Hardware<span className="brand-highlight">Shopping</span></span>
            <span className="brand-tagline">Curated Hardware Store</span>
          </div>
        </div>

        {/* Minimalist Search Bar */}
        <div className="nav-search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search workstation essentials..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => onSearchChange('')} aria-label="Clear search">
              ×
            </button>
          )}
        </div>

        {/* Navigation Actions */}
        <div className="nav-actions">
          <button
            className={`nav-link-btn ${activeTab === 'shop' ? 'active' : ''}`}
            onClick={() => onSelectTab('shop')}
          >
            Collection
          </button>

          <button
            className={`nav-cart-btn ${activeTab === 'cart' ? 'active' : ''}`}
            onClick={onOpenCart}
            aria-label="View shopping bag"
          >
            <ShoppingBag size={18} />
            <span className="cart-label">Bag</span>
            {cartCount > 0 && (
              <span className="cart-badge-counter">{cartCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
