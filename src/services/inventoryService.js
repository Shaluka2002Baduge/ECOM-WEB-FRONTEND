/**
 * Raalahami Restaurant - Inventory Service
 * Direct backend integration for raw materials, threshold alerts, and restocking.
 */
import apiClient from '../api/apiClient';

export const FALLBACK_INVENTORY_ITEMS = [
  { id: 1, name: 'Fragrant Samba Heritage Rice', category: 'Grains & Rice', stock: 120, unit: 'kg', threshold: 40, supplier: 'Polonnaruwa Organic Mills' },
  { id: 2, name: 'Fresh Blue Swimmer Lagoon Mud Crab', category: 'Seafood', stock: 18, unit: 'kg', threshold: 25, supplier: 'Negombo Coastal Co-op' },
  { id: 3, name: 'Pasture-Raised Black Pork Belly', category: 'Meat & Poultry', stock: 45, unit: 'kg', threshold: 20, supplier: 'Central Highlands Farm' },
  { id: 4, name: 'Fresh King Coconuts', category: 'Coconuts & Produce', stock: 60, unit: 'units', threshold: 15, supplier: 'Gampaha Organic Groves' },
  { id: 5, name: 'Natural Spring Water Bottles (750ml)', category: 'Beverages & Water Bottles', stock: 150, unit: 'bottles', threshold: 30, supplier: 'Knuckles Mountain Springs' },
  { id: 6, name: 'Charred Banana Leaves Packaging', category: 'Packaging & Containers', stock: 350, unit: 'leaves', threshold: 100, supplier: 'Gampaha Eco Crafters' },
  { id: 7, name: 'Artisan Craft Ginger Beer (330ml)', category: 'Beverages & Water Bottles', stock: 85, unit: 'bottles', threshold: 20, supplier: 'Ceylon Craft Brews' },
  { id: 8, name: 'Pure Kitul Treacle & Jaggery', category: 'Sweeteners & Treacle', stock: 28, unit: 'bottles', threshold: 10, supplier: 'Sinharaja Rainforest Guild' },
  { id: 9, name: 'Fresh Cold-Pressed Coconut Milk', category: 'Coconuts & Produce', stock: 65, unit: 'liters', threshold: 30, supplier: 'Kurunegala Coconut Triangle' },
  { id: 10, name: 'Traditional Roasted Jaffna Curry Blend', category: 'Spices & Seasoning', stock: 8, unit: 'kg', threshold: 10, supplier: 'Jaffna Heritage Spices' }
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
        return rawData.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category || 'General',
          supplier: item.supplier || 'Local Supplier',
          unit: item.unit || 'kg',
          stock: Number(item.stock ?? item.current_stock ?? item.currentStock) || 0,
          threshold: Number(item.threshold ?? item.minimum_threshold ?? item.minimumThreshold) || 0
        }));
      }
      return FALLBACK_INVENTORY_ITEMS;
    } catch (err) {
      console.warn('[InventoryService]: Backend unreachable or error, using local fallback:', err.message);
      return FALLBACK_INVENTORY_ITEMS;
    }
  },

  /**
   * Add a new raw material / stock item
   */
  async addInventoryItem(itemData) {
    const payload = {
      name: itemData.name,
      category: itemData.category || 'General',
      supplier: itemData.supplier || 'Local Supplier',
      unit: itemData.unit || 'kg',
      currentStock: Number(itemData.stock ?? itemData.currentStock ?? 0),
      minimumThreshold: Number(itemData.threshold ?? itemData.minimumThreshold ?? 0)
    };

    const response = await apiClient.post('/inventory', payload);
    const item = unwrap(response);
    
    return {
      id: item?.id || 'inv-' + Date.now(),
      name: item?.name || payload.name,
      category: item?.category || payload.category,
      supplier: item?.supplier || payload.supplier,
      unit: item?.unit || payload.unit,
      stock: Number(item?.stock ?? item?.current_stock ?? payload.currentStock),
      threshold: Number(item?.threshold ?? item?.minimum_threshold ?? payload.minimumThreshold)
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
   * Update full inventory item record (name, supplier, threshold, etc.)
   */
  async updateInventoryItem(id, itemData) {
    const payload = {
      name: itemData.name,
      category: itemData.category,
      supplier: itemData.supplier,
      unit: itemData.unit,
      stock: itemData.stock !== undefined ? Number(itemData.stock) : undefined,
      threshold: itemData.threshold !== undefined ? Number(itemData.threshold) : undefined
    };

    const response = await apiClient.put(`/inventory/${id}`, payload);
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
