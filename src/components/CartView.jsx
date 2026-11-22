import { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag
} from './Icons';

export function CartView({
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onBackToShop,
  onProceedToCheckout
}) {
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // 0.1 for 10%
  const [promoMessage, setPromoMessage] = useState(null);

  // Calculations
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const discountAmount = subtotal * appliedDiscount;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  // Free shipping over $100, otherwise $15.00 flat shipping
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 15.0;
  // Estimated sales tax (8.25%)
  const tax = taxableSubtotal * 0.0825;
  const grandTotal = taxableSubtotal + shipping + tax;
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const cleanCode = promoCode.trim().toUpperCase();
    if (!cleanCode) return;

    if (cleanCode === 'SAVE10' || cleanCode === 'DISCOUNT10') {
      setAppliedDiscount(0.1);
      setPromoMessage({ type: 'success', text: '10% discount applied successfully!' });
    } else if (cleanCode === 'TECH20') {
      setAppliedDiscount(0.2);
      setPromoMessage({ type: 'success', text: 'Special 20% discount applied!' });
    } else {
      setPromoMessage({ type: 'error', text: 'Invalid promo code. Try SAVE10 or TECH20' });
    }
  };

  const handleRemovePromo = () => {
    setAppliedDiscount(0);
    setPromoCode('');
    setPromoMessage(null);
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-container">
        <div className="empty-cart-card">
          <div className="empty-cart-icon-wrapper">
            <ShoppingBag size={52} />
          </div>
          <h2>Your Cart is Empty</h2>
          <p className="empty-cart-desc">
            Looks like you haven't added any products to your cart yet. Explore our top-tier Laptops, Mice, Keyboards, and Monitors!
          </p>
          <button className="primary-action-btn" onClick={onBackToShop}>
            <ArrowLeft size={18} />
            <span>Start Shopping Now</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      {/* Header bar */}
      <div className="cart-header-row">
        <div>
          <button className="cart-back-link" onClick={onBackToShop}>
            <ArrowLeft size={16} />
            <span>Continue Shopping</span>
          </button>
          <h1 className="cart-main-heading">
            Shopping Cart <span className="cart-heading-count">({totalItemCount} items)</span>
          </h1>
        </div>

        <button className="clear-cart-text-btn" onClick={onClearCart} title="Remove all items">
          <Trash2 size={16} />
          <span>Clear All</span>
        </button>
      </div>

      <div className="cart-layout-grid">
        {/* Left Column: Cart Item Table / List */}
        <div className="cart-items-section">
          <div className="cart-table-card">
            <div className="cart-table-head">
              <span className="col-product">Product</span>
              <span className="col-price">Unit Price</span>
              <span className="col-qty">Quantity</span>
              <span className="col-subtotal">Subtotal</span>
              <span className="col-action">Action</span>
            </div>

            <div className="cart-table-body">
              {cartItems.map(({ product, quantity }) => {
                const itemSubtotal = product.price * quantity;
                return (
                  <div key={product.id} className="cart-item-row">
                    {/* Product Info */}
                    <div className="item-product-cell">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="item-thumbnail"
                      />
                      <div className="item-meta">
                        <span className="item-category-tag">{product.category}</span>
                        <h4 className="item-title">{product.name}</h4>
                        <span className="item-unit-mobile">
                          ${product.price.toFixed(2)} each
                        </span>
                      </div>
                    </div>

                    {/* Unit Price (Desktop) */}
                    <div className="item-price-cell">
                      ${product.price.toFixed(2)}
                    </div>

                    {/* Quantity Controls */}
                    <div className="item-qty-cell">
                      <div className="cart-qty-counter">
                        <button
                          type="button"
                          className="qty-btn minus"
                          onClick={() => onUpdateQty(product.id, quantity - 1)}
                          aria-label="Decrease quantity"
                          title={quantity === 1 ? 'Remove from cart' : 'Decrease quantity'}
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          className="qty-input-box"
                          value={quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) {
                              onUpdateQty(product.id, Math.max(1, Math.min(val, 99)));
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="qty-btn plus"
                          onClick={() => onUpdateQty(product.id, quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="item-subtotal-cell">
                      <span className="item-total-price">
                        ${itemSubtotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Remove Action */}
                    <div className="item-action-cell">
                      <button
                        type="button"
                        className="item-remove-btn"
                        onClick={() => onRemoveItem(product.id)}
                        title="Remove product"
                        aria-label={`Remove ${product.name}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guarantees Box */}
          <div className="cart-perks-banner">
            <div className="perk-item">
              <Truck size={20} className="perk-icon" />
              <div>
                <strong>Free Express Delivery</strong>
                <p>On orders above $100.00</p>
              </div>
            </div>
            <div className="perk-item">
              <RotateCcw size={20} className="perk-icon" />
              <div>
                <strong>30-Day Money Back</strong>
                <p>Hassle-free direct returns</p>
              </div>
            </div>
            <div className="perk-item">
              <ShieldCheck size={20} className="perk-icon" />
              <div>
                <strong>2-Year Warranty</strong>
                <p>Full manufacturer protection</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout */}
        <div className="cart-summary-section">
          <div className="order-summary-card">
            <h3 className="summary-title">Order Summary</h3>

            {/* Promo Code Box */}
            <form onSubmit={handleApplyPromo} className="promo-form">
              <label htmlFor="promo" className="promo-label">
                <Tag size={15} />
                <span>Promotional Code</span>
              </label>
              <div className="promo-input-group">
                <input
                  id="promo"
                  type="text"
                  placeholder="e.g. SAVE10"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="promo-input"
                  disabled={appliedDiscount > 0}
                />
                {appliedDiscount > 0 ? (
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="promo-btn remove"
                  >
                    Remove
                  </button>
                ) : (
                  <button type="submit" className="promo-btn apply">
                    Apply
                  </button>
                )}
              </div>
              {promoMessage && (
                <p className={`promo-status ${promoMessage.type}`}>
                  {promoMessage.text}
                </p>
              )}
              <span className="promo-hint">Hint: Use code <strong>SAVE10</strong> for 10% off</span>
            </form>

            <div className="summary-divider"></div>

            {/* Calculations Breakdown */}
            <div className="summary-breakdown">
              <div className="summary-line">
                <span className="line-label">Subtotal ({totalItemCount} items)</span>
                <span className="line-value">${subtotal.toFixed(2)}</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="summary-line discount-line">
                  <span className="line-label">Promo Discount ({appliedDiscount * 100}%)</span>
                  <span className="line-value discount-value">
                    -${discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="summary-line">
                <span className="line-label">Estimated Shipping</span>
                <span className="line-value">
                  {shipping === 0 ? (
                    <span className="shipping-free">FREE</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="summary-line">
                <span className="line-label">Estimated Tax (8.25%)</span>
                <span className="line-value">${tax.toFixed(2)}</span>
              </div>

              <div className="summary-divider"></div>

              {/* Grand Total */}
              <div className="summary-line grand-total-line">
                <div>
                  <span className="grand-total-label">Grand Total</span>
                  <span className="grand-total-currency">USD</span>
                </div>
                <span className="grand-total-value">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* PROCEED TO CHECKOUT BUTTON */}
            <button
              type="button"
              className="proceed-checkout-btn"
              onClick={() => onProceedToCheckout({
                subtotal,
                discount: discountAmount,
                shipping,
                tax,
                grandTotal,
                itemCount: totalItemCount
              })}
            >
              <div className="checkout-btn-content">
                <span>Proceed to Checkout</span>
                <span className="btn-total-pill">${grandTotal.toFixed(2)}</span>
              </div>
              <ArrowRight size={20} />
            </button>

            <div className="checkout-trust-badge">
              <ShieldCheck size={16} />
              <span>Safe & Secure 256-bit SSL Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
