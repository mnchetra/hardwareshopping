import { PRODUCTS } from './data/products';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';

/**
 * Normalizes a raw product from the Laravel API or mock data
 * into the standardized format expected by HardwareShopping UI components.
 */
export function normalizeProduct(raw) {
  const priceNum = typeof raw.price === 'number' ? raw.price : parseFloat(raw.price) || 0;
  const originalPriceNum = raw.originalPrice 
    ? (typeof raw.originalPrice === 'number' ? raw.originalPrice : parseFloat(raw.originalPrice))
    : Math.round(priceNum * 1.2);

  // Derive specs if absent
  let specs = Array.isArray(raw.specs) ? raw.specs : [];
  if (specs.length === 0 && raw.description) {
    // Generate clean bullets from description if available
    specs = raw.description
      .split(/[.,•\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 5 && s.length < 50)
      .slice(0, 4);
  }

  // Derive tagline if absent
  const tagline = raw.tagline || (raw.description ? raw.description.split('.')[0].slice(0, 60) : raw.category || 'Hardware Essential');

  return {
    id: raw.id,
    name: raw.name || 'Unnamed Product',
    category: raw.category || 'Accessories',
    iconType: raw.category || 'Laptop',
    tagline,
    price: priceNum,
    originalPrice: originalPriceNum > priceNum ? originalPriceNum : null,
    rating: typeof raw.rating === 'number' ? raw.rating : 4.8,
    reviewCount: typeof raw.reviewCount === 'number' ? raw.reviewCount : Math.floor(Math.random() * 80 + 20),
    badge: raw.badge || (raw.stock && raw.stock < 5 ? 'Low Stock' : null),
    image: raw.image_url || raw.image || DEFAULT_IMAGE,
    description: raw.description || `${raw.name || 'Product'} engineered for high performance and durability.`,
    specs: specs.length > 0 ? specs : ['Precision Engineering', 'Engineered for Performance', 'HardwareShopping Verified'],
    inStock: raw.is_active !== false && (raw.stock === undefined || raw.stock > 0),
    stock: raw.stock !== undefined ? raw.stock : 10,
    isApiItem: Boolean(raw.created_at || typeof raw.id === 'number')
  };
}

/**
 * Fetch products from the Laravel API with fallback to local products.
 * Supports query params: search, category, sort_by, sort_order.
 */
export async function fetchProductsApi(options = {}) {
  const { search = '', category = '', sortBy = '', sortOrder = '' } = options;

  const url = new URL(`${API_BASE_URL}/products`);
  url.searchParams.append('per_page', '100');
  if (search) url.searchParams.append('search', search);
  if (category && category !== 'All') url.searchParams.append('category', category);
  if (sortBy) url.searchParams.append('sort_by', sortBy);
  if (sortOrder) url.searchParams.append('sort_order', sortOrder);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`API responded with HTTP status ${response.status}`);
  }

  const json = await response.json();
  const rawList = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
  
  return rawList.map(normalizeProduct);
}

/**
 * Create a new product in the Laravel API backend
 */
export async function createProductApi(productData) {
  const payload = {
    name: productData.name,
    category: productData.category || 'Accessories',
    price: parseFloat(productData.price),
    stock: parseInt(productData.stock, 10) || 10,
    description: productData.description || '',
    image_url: productData.image || productData.image_url || DEFAULT_IMAGE,
    is_active: true
  };

  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.message || `Failed to create product (${response.status})`;
    throw new Error(message);
  }

  const json = await response.json();
  return normalizeProduct(json.data || json);
}

/**
 * Delete a product from the Laravel API backend
 */
export async function deleteProductApi(id) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to delete product (${response.status})`);
  }

  return true;
}
