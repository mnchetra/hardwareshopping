import { useState } from 'react';
import { Star, ShoppingCart, Check, Eye, Heart } from './Icons';

export function ProductCard({ product, onAddToCart, onQuickView, inCartQty = 0 }) {
  const [isAddedRecently, setIsAddedRecently] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToCart(product, 1);
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 1400);
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card" onClick={() => { if (onQuickView) onQuickView(product); }}>
      {/* Product Image Area */}
      <div className="product-media-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />

        {/* Minimal Floating Badges */}
        <div className="product-card-top-left">
          {product.badge && (
            <span className="minimal-badge">{product.badge}</span>
          )}
          {discountPercent > 0 && (
            <span className="minimal-badge discount">-{discountPercent}%</span>
          )}
        </div>

        {/* Top-Right Quick Actions */}
        <div className="product-card-top-right">
          <button
            type="button"
            className={`card-icon-btn ${isLiked ? 'liked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            aria-label="Add to wishlist"
            title="Wishlist"
          >
            <Heart size={15} filled={isLiked} />
          </button>
          
          <button
            type="button"
            className="card-icon-btn quickview-trigger"
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickView) onQuickView(product);
            }}
            aria-label="Quick View"
            title="Quick View"
          >
            <Eye size={15} />
          </button>
        </div>
      </div>

      {/* Clean Minimal Info Body */}
      <div className="product-info-body">
        {/* Category & Rating Line */}
        <div className="product-meta-line">
          <span className="product-category-label">{product.category}</span>
          <div className="product-minimal-rating">
            <Star size={13} className="star-icon" />
            <span>{product.rating}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="product-title" title={product.name}>
          {product.name}
        </h3>

        {/* Crisp 1-line tag (NO long paragraphs, NO bullets) */}
        <p className="product-tagline">{product.tagline || product.category}</p>

        {/* Price & Action Row */}
        <div className="product-card-footer">
          <div className="price-stack">
            <span className="current-price">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="original-price">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          <button
            type="button"
            className={`card-add-btn ${isAddedRecently ? 'added' : ''}`}
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
          >
            {isAddedRecently ? (
              <>
                <Check size={14} />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart size={14} />
                <span>Add{inCartQty > 0 ? ` (${inCartQty})` : ''}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
