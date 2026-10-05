/**
 * Raalahami Restaurant - Inventory Service
 * Direct backend integration for raw materials, threshold alerts, restocking, and item images.
 */
import apiClient from '../api/apiClient';

export const FALLBACK_INVENTORY_ITEMS = [
  { id: 1, name: 'Fragrant Samba Heritage Rice', category: 'Grains & Rice', stock: 120, unit: 'kg', threshold: 40, supplier: 'Polonnaruwa Organic Mills', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80', variants: [] },
  { id: 2, name: 'Fresh Blue Swimmer Lagoon Mud Crab', category: 'Seafood', stock: 18, unit: 'kg', threshold: 25, supplier: 'Negombo Coastal Co-op', image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80', variants: [] },
  { id: 3, name: 'Pasture-Raised Black Pork Belly', category: 'Meat & Poultry', stock: 45, unit: 'kg', threshold: 20, supplier: 'Central Highlands Farm', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80', variants: [] },
  { id: 4, name: 'Fresh King Coconuts', category: 'Coconuts & Produce', stock: 60, unit: 'units', threshold: 15, supplier: 'Gampaha Organic Groves', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80', variants: [] },
  {
    id: 15,
    name: 'Natural Mountain Spring Water Bottle',
    category: 'Beverages & Water Bottles',
    stock: 140,
    unit: 'bottles',
    threshold: 30,
    supplier: 'Knuckles Mountain Springs',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
    variants: [
      { size: '500ml', stock: 50, price: 150 },
      { size: '1L', stock: 40, price: 250 },
      { size: '1.5L', stock: 30, price: 350 },
      { size: '2L', stock: 20, price: 450 }
    ]
  },
  {
    id: 16,
    name: 'Cocacola',
    category: 'Beverages & Water Bottles',
    stock: 105,
    unit: 'bottles',
    threshold: 20,
    supplier: 'Ceylon Craft Brews',
    image: '/uploads/inv-1790845264830-169188868.jpeg',
    variants: [
      { size: '500ml', stock: 40, price: 350 },
      { size: '1L', stock: 30, price: 650 },
      { size: '1.5L', stock: 20, price: 950 },
      { size: '2L', stock: 15, price: 1250 }
    ]
  },
  { id: 13, name: 'Charred Banana Leaves Packaging', category: 'Packaging & Containers', stock: 350, unit: 'leaves', threshold: 100, supplier: 'Gampaha Eco Crafters', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', variants: [] },
  { id: 14, name: 'Pure Kitul Treacle & Jaggery', category: 'Sweeteners & Treacle', stock: 28, unit: 'bottles', threshold: 10, supplier: 'Sinharaja Rainforest Guild', image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80', variants: [] }
];

/**
 * Normalizes backend response objects from various payload shapes
 */
function unwrap(res) {
  if (!res) return null;
  if (res.data !== undefined) {
    if (res.data.data !== undefined) return res.data.data;
    return res.data;
  }
  return res;
}

export const inventoryService = {
  /**
   * Fetch all inventory items from backend
   */
  async getInventory(lowStockOnly = false) {
    try {
      const query = lowStockOnly ? '?lowStock=true' : '';
      const response = await apiClient.get(`/inventory${query}`);
      const rawData = unwrap(response);
      
      if (Array.isArray(rawData) && rawData.length > 0) {
        return rawData.map((item) => {
          let variants = [];
          if (Array.isArray(item.variants)) {
            variants = item.variants;
          } else if (typeof item.variants === 'string') {
            try {
              variants = JSON.parse(item.variants);
            } catch (e) {
              variants = [];
            }
          }

          return {
            id: item.id,
            name: item.name,
            category: item.category || 'General',
            supplier: item.supplier || 'Local Supplier',
            unit: item.unit || 'kg',
            image: item.image || item.imageUrl || item.image_url || '',
            imageUrl: item.image || item.imageUrl || item.image_url || '',
            image_url: item.image || item.imageUrl || item.image_url || '',
            variants: Array.isArray(variants) ? variants : [],
            stock: Number(item.stock ?? item.current_stock ?? item.currentStock) || 0,
            threshold: Number(item.threshold ?? item.minimum_threshold ?? item.minimumThreshold) || 0
          };
        });
      }
      return FALLBACK_INVENTORY_ITEMS;
    } catch (err) {
      console.warn('[InventoryService]: Backend unreachable or error, using local fallback:', err.message);
      return FALLBACK_INVENTORY_ITEMS;
    }
  },

  /**
   * Upload image file directly
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post('/inventory/upload', formData);
    return unwrap(response);
  },

  /**
   * Add a new raw material / stock item
   */
  async addInventoryItem(itemData) {
    let body;
    if (typeof FormData !== 'undefined' && itemData instanceof FormData) {
      body = itemData;
    } else if (itemData && (itemData.imageFile instanceof File || itemData.image instanceof File)) {
      const fd = new FormData();
      Object.keys(itemData).forEach((key) => {
        if (key === 'imageFile') {
          if (itemData[key] instanceof File) fd.append('image', itemData[key]);
        } else if (key === 'image') {
          if (itemData[key] instanceof File) fd.append('image', itemData[key]);
          else if (itemData[key]) fd.append('image', itemData[key]);
        } else if (key === 'variants') {
          fd.append('variants', JSON.stringify(itemData.variants || []));
        } else if (itemData[key] !== undefined && itemData[key] !== null) {
          fd.append(key, itemData[key]);
        }
      });
      body = fd;
    } else {
      body = {
        name: itemData.name,
        category: itemData.category || 'General',
        supplier: itemData.supplier || 'Local Supplier',
        unit: itemData.unit || 'kg',
        image: itemData.image || itemData.imageUrl || itemData.image_url || '',
        imageUrl: itemData.image || itemData.imageUrl || itemData.image_url || '',
        image_url: itemData.image || itemData.imageUrl || itemData.image_url || '',
        variants: Array.isArray(itemData.variants) ? itemData.variants : [],
        currentStock: Number(itemData.stock ?? itemData.currentStock ?? 0),
        minimumThreshold: Number(itemData.threshold ?? itemData.minimumThreshold ?? 0)
      };
    }

    const response = await apiClient.post('/inventory', body);
    const item = unwrap(response);
    
    return {
      id: item?.id || 'inv-' + Date.now(),
      name: item?.name || (itemData instanceof FormData ? itemData.get('name') : itemData.name),
      category: item?.category || (itemData instanceof FormData ? itemData.get('category') : itemData.category),
      supplier: item?.supplier || (itemData instanceof FormData ? itemData.get('supplier') : itemData.supplier),
      unit: item?.unit || (itemData instanceof FormData ? itemData.get('unit') : itemData.unit),
      image: item?.image || item?.image_url || '',
      imageUrl: item?.image || item?.image_url || '',
      variants: Array.isArray(item?.variants) ? item.variants : [],
      stock: Number(item?.stock ?? item?.current_stock ?? 0),
      threshold: Number(item?.threshold ?? item?.minimum_threshold ?? 0)
    };
  },

  /**
   * Update stock quantity / delta replenishment
   */
  async restock(id, deltaOrStock, isAbsolute = false) {
    const payload = isAbsolute
      ? { absoluteStock: Number(deltaOrStock) }
      : { stockDelta: Number(deltaOrStock) };

    const response = await apiClient.put(`/inventory/${id}/restock`, payload);
    return unwrap(response);
  },

  /**
   * Update full inventory item record (name, supplier, threshold, image, variants, etc.)
   */
  async updateInventoryItem(id, itemData) {
    let body;
    if (typeof FormData !== 'undefined' && itemData instanceof FormData) {
      body = itemData;
    } else if (itemData && (itemData.imageFile instanceof File || itemData.image instanceof File)) {
      const fd = new FormData();
      Object.keys(itemData).forEach((key) => {
        if (key === 'imageFile') {
          if (itemData[key] instanceof File) fd.append('image', itemData[key]);
        } else if (key === 'image') {
          if (itemData[key] instanceof File) fd.append('image', itemData[key]);
          else if (itemData[key]) fd.append('image', itemData[key]);
        } else if (key === 'variants') {
          fd.append('variants', JSON.stringify(itemData.variants || []));
        } else if (itemData[key] !== undefined && itemData[key] !== null) {
          fd.append(key, itemData[key]);
        }
      });
      body = fd;
    } else {
      body = {
        name: itemData.name,
        category: itemData.category,
        supplier: itemData.supplier,
        unit: itemData.unit,
        image: itemData.image || itemData.imageUrl || itemData.image_url,
        imageUrl: itemData.image || itemData.imageUrl || itemData.image_url,
        image_url: itemData.image || itemData.imageUrl || itemData.image_url,
        variants: itemData.variants !== undefined ? itemData.variants : undefined,
        currentStock: itemData.stock !== undefined ? Number(itemData.stock) : (itemData.currentStock !== undefined ? Number(itemData.currentStock) : undefined),
        minimumThreshold: itemData.threshold !== undefined ? Number(itemData.threshold) : (itemData.minimumThreshold !== undefined ? Number(itemData.minimumThreshold) : undefined)
      };
    }

    const response = await apiClient.put(`/inventory/${id}`, body);
    return unwrap(response);
  },

  /**
   * Delete an inventory item permanently
   */
  async deleteInventoryItem(id) {
    const response = await apiClient.delete(`/inventory/${id}`);
    return unwrap(response);
  }
};

export default inventoryService;
