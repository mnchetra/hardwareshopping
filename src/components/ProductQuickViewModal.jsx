import { useState } from 'react';
import { X, Star, ShoppingCart, Check, Plus, Minus, ShieldCheck, Truck, RotateCcw } from './Icons';

export function ProductQuickViewModal({ product, isOpen, onClose, onAddToCart, inCartQty = 0 }) {
  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!isOpen || !product) return null;

  const handleAdd = () => {
    onAddToCart(product, qty);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="quickview-backdrop" onClick={onClose}>
      <div className="quickview-card" onClick={(e) => e.stopPropagation()}>
        <button className="quickview-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        <div className="quickview-grid">
          {/* Left: Product Image */}
          <div className="quickview-media">
            <img src={product.image} alt={product.name} />
            {product.badge && (
              <span className="quickview-badge">{product.badge}</span>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="quickview-details">
            <span className="quickview-category">{product.category}</span>
            <h2 className="quickview-title">{product.name}</h2>

            <div className="quickview-rating-row">
              <div className="rating-stars">
                <Star size={15} />
                <span className="rating-num">{product.rating}</span>
              </div>
              <span className="quickview-reviews">({product.reviewCount} customer reviews)</span>
              <span className="quickview-stock">• In Stock</span>
            </div>

            <div className="quickview-price-row">
              <span className="quickview-price">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="quickview-orig-price">${product.originalPrice.toFixed(2)}</span>
              )}
              {discountPercent > 0 && (
                <span className="quickview-save-pill">Save {discountPercent}%</span>
              )}
            </div>

            <p className="quickview-description">{product.description}</p>

            {/* Technical Specifications */}
            <div className="quickview-specs-section">
              <h4 className="quickview-specs-heading">Key Specifications</h4>
              <ul className="quickview-specs-list">
                {product.specs?.map((spec, i) => (
                  <li key={i}>
                    <span className="spec-bullet"></span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="quickview-actions">
              <div className="quickview-qty-stepper">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease"
                >
                  <Minus size={13} />
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  aria-label="Increase"
                >
                  <Plus size={13} />
                </button>
              </div>

              <button
                type="button"
                className={`quickview-add-btn ${isAdded ? 'added' : ''}`}
                onClick={handleAdd}
              >
                {isAdded ? (
                  <>
                    <Check size={16} />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    <span>Add to Cart • ${(product.price * qty).toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>

            {inCartQty > 0 && (
              <p className="quickview-incart-note">
                Currently <strong>{inCartQty}</strong> in your cart.
              </p>
            )}

            {/* Perks */}
            <div className="quickview-perks">
              <div className="qv-perk"><Truck size={15} /><span>Free Shipping</span></div>
              <div className="qv-perk"><ShieldCheck size={15} /><span>2-Year Warranty</span></div>
              <div className="qv-perk"><RotateCcw size={15} /><span>30-Day Return</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
