import { useState } from 'react';
import { X, Sparkles, Laptop, Mouse, Keyboard, Monitor, Headphones } from './Icons';

const PRESET_IMAGES = [
  { label: 'Laptop', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80' },
  { label: 'Mouse', url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80' },
  { label: 'Keyboard', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80' },
  { label: 'Display', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80' },
  { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' }
];

export function AddProductModal({ isOpen, onClose, onAddProduct, isApiConnected }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Laptop');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('15');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Please enter a product name.');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      setFormError('Please enter a valid price greater than $0.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddProduct({
        name: name.trim(),
        category,
        price: parseFloat(price),
        stock: parseInt(stock, 10) || 10,
        image: imageUrl.trim() || PRESET_IMAGES[0].url,
        description: description.trim() || `${name.trim()} - crafted with precision hardware engineering.`
      });

      // Reset & close
      setName('');
      setPrice('');
      setDescription('');
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="add-product-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="add-modal-header">
          <div className="add-modal-title-stack">
            <div className="add-badge">
              <Sparkles size={13} />
              <span>{isApiConnected ? 'Laravel Live Database' : 'Local Store'}</span>
            </div>
            <h2>Add New Hardware Product</h2>
            <p className="add-modal-desc">
              {isApiConnected
                ? 'Product will be saved via POST /api/products into your MySQL / SQLite database.'
                : 'API is currently offline. Item will be added to your current session catalog.'}
            </p>
          </div>
          <button className="add-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Error alert */}
        {formError && (
          <div className="add-error-box">
            <span>{formError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="add-form-grid">
            <div className="add-form-field full-width">
              <label htmlFor="product-name">Product Name *</label>
              <input
                id="product-name"
                type="text"
                placeholder="e.g. UltraFit Wireless Mechanical Keypad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="add-form-field">
              <label htmlFor="product-category">Category *</label>
              <select
                id="product-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Laptop">Laptop</option>
                <option value="Mouse">Mouse</option>
                <option value="Keyboard">Keyboard</option>
                <option value="Monitor">Monitor</option>
                <option value="Audio">Audio</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div className="add-form-field">
              <label htmlFor="product-price">Price ($ USD) *</label>
              <input
                id="product-price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="99.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="add-form-field">
              <label htmlFor="product-stock">Stock Units</label>
              <input
                id="product-stock"
                type="number"
                min="0"
                placeholder="15"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>

            <div className="add-form-field">
              <label htmlFor="product-image">Image URL</label>
              <input
                id="product-image"
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            {/* Quick image presets */}
            <div className="add-form-field full-width">
              <span className="preset-label">Quick Preset Images:</span>
              <div className="preset-buttons-row">
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    className={`preset-btn ${imageUrl === preset.url ? 'active' : ''}`}
                    onClick={() => {
                      setImageUrl(preset.url);
                      if (['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Audio'].includes(preset.label)) {
                        setCategory(preset.label);
                      }
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="add-form-field full-width">
              <label htmlFor="product-desc">Description / Specs</label>
              <textarea
                id="product-desc"
                rows="3"
                placeholder="Detailed specifications, aerospace aluminum chassis, battery runtime..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="add-modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-save-product" disabled={isSubmitting}>
              {isSubmitting ? (
                <span>Saving to Database...</span>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>{isApiConnected ? 'Save to Laravel API' : 'Add to Catalog'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
