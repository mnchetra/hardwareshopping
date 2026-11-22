import { useState } from 'react';
import { X, Check, ShieldCheck, ArrowRight, Truck } from './Icons';

const SHIPPING_METHODS = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    time: '3–5 business days',
    price: 0,
    badge: 'FREE'
  },
  {
    id: 'express',
    name: 'Express Courier',
    time: '1–2 business days',
    price: 15.00,
    badge: '$15.00'
  },
  {
    id: 'priority',
    name: 'Priority Overnight',
    time: 'Next business day',
    price: 28.00,
    badge: '$28.00'
  }
];

export function CheckoutModal({ orderSummary, cartItems, isOpen, onClose, onCompleteOrder }) {
  // 1-5. Customer Data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    shippingMethod: 'standard'
  });

  // 6. Validation errors state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  if (!isOpen) return null;

  // 7 & 9. Shipping Method & Grand Total Calculations
  const selectedShipping =
    SHIPPING_METHODS.find((m) => m.id === formData.shippingMethod) || SHIPPING_METHODS[0];

  const subtotal = orderSummary?.subtotal || cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const discount = orderSummary?.discount || 0;
  const taxableSubtotal = Math.max(0, subtotal - discount);
  const shippingCost = selectedShipping.price;
  const tax = taxableSubtotal * 0.0825;
  const grandTotal = taxableSubtotal + shippingCost + tax;
  const totalItemCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  // Field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  // 6. Individual field validation
  const validateField = (field, value) => {
    let error = null;
    const val = (value || '').trim();

    if (field === 'firstName' && !val) {
      error = 'First name is required';
    } else if (field === 'lastName' && !val) {
      error = 'Last name is required';
    } else if (field === 'email') {
      if (!val) {
        error = 'Email address is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        error = 'Please enter a valid email (e.g. name@example.com)';
      }
    } else if (field === 'phone') {
      const digits = val.replace(/\D/g, '');
      if (!val) {
        error = 'Phone number is required';
      } else if (digits.length < 8) {
        error = 'Please enter a valid phone number (at least 8 digits)';
      }
    } else if (field === 'address' && !val) {
      error = 'Street address is required';
    } else if (field === 'city' && !val) {
      error = 'City is required';
    } else if (field === 'state' && !val) {
      error = 'State / Province is required';
    } else if (field === 'zipCode' && !val) {
      error = 'Zip / Postal code is required';
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  // 6. Complete form validation
  const validateAll = () => {
    const fieldsToValidate = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'address',
      'city',
      'state',
      'zipCode'
    ];

    const newErrors = {};
    let isValid = true;

    fieldsToValidate.forEach((f) => {
      const val = (formData[f] || '').trim();
      if (f === 'firstName' && !val) {
        newErrors.firstName = 'First name is required';
        isValid = false;
      } else if (f === 'lastName' && !val) {
        newErrors.lastName = 'Last name is required';
        isValid = false;
      } else if (f === 'email') {
        if (!val) {
          newErrors.email = 'Email address is required';
          isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          newErrors.email = 'Please enter a valid email address';
          isValid = false;
        }
      } else if (f === 'phone') {
        const digits = val.replace(/\D/g, '');
        if (!val) {
          newErrors.phone = 'Phone number is required';
          isValid = false;
        } else if (digits.length < 8) {
          newErrors.phone = 'Please enter a valid phone number';
          isValid = false;
        }
      } else if (f === 'address' && !val) {
        newErrors.address = 'Street address is required';
        isValid = false;
      } else if (f === 'city' && !val) {
        newErrors.city = 'City is required';
        isValid = false;
      } else if (f === 'state' && !val) {
        newErrors.state = 'State / Province is required';
        isValid = false;
      } else if (f === 'zipCode' && !val) {
        newErrors.zipCode = 'Zip / Postal code is required';
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      fieldsToValidate.reduce((acc, k) => ({ ...acc, [k]: true }), {})
    );
    return isValid;
  };

  // Generate ORD-0001 sequential ID
  const getNextOrderId = () => {
    try {
      const lastCount = parseInt(localStorage.getItem('techpulse_order_counter') || '0', 10);
      const nextCount = lastCount + 1;
      localStorage.setItem('techpulse_order_counter', nextCount.toString());
      return `ORD-${String(nextCount).padStart(4, '0')}`;
    } catch {
      return 'ORD-0001';
    }
  };

  // 10. Place Order submit handler
  const handlePlaceOrder = (e) => {
    e.preventDefault();

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const orderId = getNextOrderId();
      const now = new Date();
      const orderDate = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const details = {
        message: 'Order Placed Successfully!',
        orderId: orderId,
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        orderDate: orderDate,
        orderStatus: 'Pending',
        items: [...cartItems],
        totalAmount: grandTotal,
        subtotal: subtotal,
        discount: discount,
        shippingMethod: selectedShipping,
        shippingCost: shippingCost,
        tax: tax,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
        totalItems: totalItemCount
      };

      setPlacedOrderDetails(details);
      setIsSubmitting(false);
      setOrderSuccess(true);
      onCompleteOrder(orderId);
    }, 1200);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close checkout modal">
          <X size={18} />
        </button>

        {orderSuccess && placedOrderDetails ? (
          /* =================================================================
             CONFIRM ORDER SCREEN - EXACT USER REQUIREMENTS:
             • Message: Order Placed Successfully! 
             • Order ID: ORD-0001 
             • Customer Name 
             • Order Date 
             • Ordered Products 
             • Total Amount 
             • Order Status: Pending 
             ================================================================= */
          <div className="order-success-view">
            <div className="success-icon-badge">
              <Check size={32} />
            </div>

            {/* • Message */}
            <h2 className="success-headline">{placedOrderDetails.message}</h2>
            <p className="success-subheading">
              Your order has been recorded and is currently being processed.
            </p>

            <div className="confirm-order-card">
              {/* Top Meta Grid: Order ID, Status, Date, Customer */}
              <div className="confirm-order-meta-grid">
                {/* • Order ID */}
                <div className="confirm-meta-cell">
                  <span className="confirm-label">Order ID</span>
                  <span className="confirm-value order-id-badge">{placedOrderDetails.orderId}</span>
                </div>

                {/* • Order Status: Pending */}
                <div className="confirm-meta-cell">
                  <span className="confirm-label">Order Status</span>
                  <span className="confirm-status-pill pending">
                    <span className="status-dot"></span>
                    {placedOrderDetails.orderStatus}
                  </span>
                </div>

                {/* • Order Date */}
                <div className="confirm-meta-cell">
                  <span className="confirm-label">Order Date</span>
                  <span className="confirm-value">{placedOrderDetails.orderDate}</span>
                </div>

                {/* • Customer Name */}
                <div className="confirm-meta-cell">
                  <span className="confirm-label">Customer Name</span>
                  <span className="confirm-value customer-name">{placedOrderDetails.customerName}</span>
                </div>
              </div>

              <div className="confirm-divider"></div>

              {/* • Ordered Products */}
              <div className="confirm-products-section">
                <div className="confirm-section-head">
                  <span className="confirm-label">Ordered Products ({placedOrderDetails.totalItems})</span>
                  <span className="confirm-label">Subtotal</span>
                </div>

                <div className="confirm-products-list">
                  {placedOrderDetails.items.map((item) => (
                    <div key={item.product.id} className="confirm-product-row">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="confirm-product-thumb"
                      />
                      <div className="confirm-product-info">
                        <span className="confirm-product-name">{item.product.name}</span>
                        <span className="confirm-product-qty">
                          Qty: {item.quantity} × ${item.product.price.toFixed(2)}
                        </span>
                      </div>
                      <span className="confirm-product-total">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="confirm-divider"></div>

              {/* Delivery & Customer Details */}
              <div className="confirm-shipping-info">
                <div className="confirm-info-row">
                  <span className="info-key">Email:</span>
                  <span className="info-val">{placedOrderDetails.email}</span>
                </div>
                <div className="confirm-info-row">
                  <span className="info-key">Phone:</span>
                  <span className="info-val">{placedOrderDetails.phone}</span>
                </div>
                <div className="confirm-info-row">
                  <span className="info-key">Delivery Address:</span>
                  <span className="info-val">{placedOrderDetails.address}</span>
                </div>
                <div className="confirm-info-row">
                  <span className="info-key">Shipping Method:</span>
                  <span className="info-val">
                    {placedOrderDetails.shippingMethod.name} ({placedOrderDetails.shippingMethod.time})
                  </span>
                </div>
              </div>

              <div className="confirm-divider"></div>

              {/* • Total Amount */}
              <div className="confirm-total-box">
                <div className="confirm-total-line">
                  <span className="total-title">Total Amount</span>
                  <span className="total-figure">${placedOrderDetails.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              className="primary-action-btn success-btn"
              onClick={onClose}
            >
              <span>Back to Store</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          /* Checkout Form View */
          <div className="checkout-content">
            <div className="modal-header">
              <div className="header-badge">
                <ShieldCheck size={16} />
                <span>Encrypted & Secure Checkout</span>
              </div>
              <h2>Checkout</h2>
              <p className="checkout-subtitle">
                Enter your shipping and delivery details to complete your order.
              </p>
            </div>

            <div className="checkout-split">
              {/* Left Column: Customer Form & Shipping Method */}
              <form className="checkout-form" onSubmit={handlePlaceOrder} noValidate>
                {/* 1-5. Customer Information */}
                <h4 className="form-section-title">Customer Information</h4>
                
                <div className="form-grid">
                  {/* 1. First Name */}
                  <div className={`form-group ${errors.firstName && touched.firstName ? 'has-error' : ''}`}>
                    <label htmlFor="checkout-firstName">First Name *</label>
                    <input
                      id="checkout-firstName"
                      type="text"
                      name="firstName"
                      placeholder="e.g. Sarah"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={() => handleBlur('firstName')}
                      className={errors.firstName && touched.firstName ? 'input-error' : ''}
                    />
                    {errors.firstName && touched.firstName && (
                      <span className="field-error-msg">{errors.firstName}</span>
                    )}
                  </div>

                  {/* 2. Last Name */}
                  <div className={`form-group ${errors.lastName && touched.lastName ? 'has-error' : ''}`}>
                    <label htmlFor="checkout-lastName">Last Name *</label>
                    <input
                      id="checkout-lastName"
                      type="text"
                      name="lastName"
                      placeholder="e.g. Connor"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={() => handleBlur('lastName')}
                      className={errors.lastName && touched.lastName ? 'input-error' : ''}
                    />
                    {errors.lastName && touched.lastName && (
                      <span className="field-error-msg">{errors.lastName}</span>
                    )}
                  </div>

                  {/* 3. Email */}
                  <div className={`form-group ${errors.email && touched.email ? 'has-error' : ''}`}>
                    <label htmlFor="checkout-email">Email Address *</label>
                    <input
                      id="checkout-email"
                      type="email"
                      name="email"
                      placeholder="sarah@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur('email')}
                      className={errors.email && touched.email ? 'input-error' : ''}
                    />
                    {errors.email && touched.email && (
                      <span className="field-error-msg">{errors.email}</span>
                    )}
                  </div>

                  {/* 4. Phone Number */}
                  <div className={`form-group ${errors.phone && touched.phone ? 'has-error' : ''}`}>
                    <label htmlFor="checkout-phone">Phone Number *</label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      name="phone"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={() => handleBlur('phone')}
                      className={errors.phone && touched.phone ? 'input-error' : ''}
                    />
                    {errors.phone && touched.phone && (
                      <span className="field-error-msg">{errors.phone}</span>
                    )}
                  </div>

                  {/* 5. Address */}
                  <div className={`form-group col-span-2 ${errors.address && touched.address ? 'has-error' : ''}`}>
                    <label htmlFor="checkout-address">Street Address *</label>
                    <input
                      id="checkout-address"
                      type="text"
                      name="address"
                      placeholder="123 Market Street, Apt 4B"
                      value={formData.address}
                      onChange={handleChange}
                      onBlur={() => handleBlur('address')}
                      className={errors.address && touched.address ? 'input-error' : ''}
                    />
                    {errors.address && touched.address && (
                      <span className="field-error-msg">{errors.address}</span>
                    )}
                  </div>

                  {/* City */}
                  <div className={`form-group ${errors.city && touched.city ? 'has-error' : ''}`}>
                    <label htmlFor="checkout-city">City *</label>
                    <input
                      id="checkout-city"
                      type="text"
                      name="city"
                      placeholder="San Francisco"
                      value={formData.city}
                      onChange={handleChange}
                      onBlur={() => handleBlur('city')}
                      className={errors.city && touched.city ? 'input-error' : ''}
                    />
                    {errors.city && touched.city && (
                      <span className="field-error-msg">{errors.city}</span>
                    )}
                  </div>

                  {/* State & Zip */}
                  <div className="form-row-halves">
                    <div className={`form-group ${errors.state && touched.state ? 'has-error' : ''}`}>
                      <label htmlFor="checkout-state">State / Province *</label>
                      <input
                        id="checkout-state"
                        type="text"
                        name="state"
                        placeholder="CA"
                        value={formData.state}
                        onChange={handleChange}
                        onBlur={() => handleBlur('state')}
                        className={errors.state && touched.state ? 'input-error' : ''}
                      />
                      {errors.state && touched.state && (
                        <span className="field-error-msg">{errors.state}</span>
                      )}
                    </div>

                    <div className={`form-group ${errors.zipCode && touched.zipCode ? 'has-error' : ''}`}>
                      <label htmlFor="checkout-zip">Zip / Postal Code *</label>
                      <input
                        id="checkout-zip"
                        type="text"
                        name="zipCode"
                        placeholder="94105"
                        value={formData.zipCode}
                        onChange={handleChange}
                        onBlur={() => handleBlur('zipCode')}
                        className={errors.zipCode && touched.zipCode ? 'input-error' : ''}
                      />
                      {errors.zipCode && touched.zipCode && (
                        <span className="field-error-msg">{errors.zipCode}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 7. Shopping / Shipping Method */}
                <h4 className="form-section-title" style={{ marginTop: '22px' }}>
                  Shipping Method
                </h4>

                <div className="shipping-methods-container">
                  {SHIPPING_METHODS.map((method) => {
                    const isSelected = formData.shippingMethod === method.id;
                    return (
                      <label
                        key={method.id}
                        className={`shipping-option-card ${isSelected ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={method.id}
                          checked={isSelected}
                          onChange={handleChange}
                          className="shipping-radio"
                        />
                        <div className="shipping-option-info">
                          <div className="shipping-title-row">
                            <Truck size={16} className="shipping-icon" />
                            <span className="shipping-name">{method.name}</span>
                          </div>
                          <span className="shipping-time">{method.time}</span>
                        </div>
                        <span className="shipping-price-badge">{method.badge}</span>
                      </label>
                    );
                  })}
                </div>

                {/* 10. Place Order Button */}
                <button
                  type="submit"
                  className="place-order-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="spinner-text">Placing Order...</span>
                  ) : (
                    <>
                      <span>Place Order • ${grandTotal.toFixed(2)}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* 8. Display Order Summary */}
              <div className="checkout-summary-col">
                <div className="mini-summary-box">
                  <div className="summary-title-row">
                    <h4>Order Summary</h4>
                    <span className="item-count-pill">{totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}</span>
                  </div>

                  {/* List of items */}
                  <div className="mini-items-list">
                    {cartItems.map(({ product, quantity }) => (
                      <div key={product.id} className="mini-item-row">
                        <img src={product.image} alt={product.name} />
                        <div className="mini-item-details">
                          <span className="mini-title">{product.name}</span>
                          <span className="mini-qty">Qty: {quantity} • ${product.price.toFixed(2)} each</span>
                        </div>
                        <span className="mini-price">
                          ${(product.price * quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="summary-divider"></div>

                  {/* Calculations Breakdown */}
                  <div className="mini-calc-lines">
                    <div className="mini-line">
                      <span>Items Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>

                    {discount > 0 && (
                      <div className="mini-line discount">
                        <span>Discount Applied</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="mini-line">
                      <span>Shipping ({selectedShipping.name})</span>
                      <span className={shippingCost === 0 ? 'shipping-free' : ''}>
                        {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                      </span>
                    </div>

                    <div className="mini-line">
                      <span>Estimated Sales Tax (8.25%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>

                    <div className="summary-divider" style={{ margin: '10px 0' }}></div>

                    {/* 9. Calculate Grand Total */}
                    <div className="mini-line total">
                      <div>
                        <span>Grand Total</span>
                        <span className="total-curr-tag">USD</span>
                      </div>
                      <span className="total-amount">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
