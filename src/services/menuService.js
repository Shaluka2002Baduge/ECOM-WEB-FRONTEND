/**
 * Raalahami Restaurant - Menu Service
 * Communicates with backend /api/menu and /api/menu-items endpoints with high-fidelity fallback data
 */
import apiClient from '../api/apiClient';

// Authentic Sri Lankan Fine Dining Menu Baseline
export const FALLBACK_MENU_ITEMS = [
  {
    id: 'raalahami-001',
    name: 'Royal Dutch Burgher Lamprais',
    category: 'Mains',
    description: 'Fragrant samba rice boiled in rich meat stock, slow-cooked mixed meat curry (beef, mutton, chicken), frikkadels (Dutch meatballs), blachan, ash plantain, and brinjal moju, all wrapped in a charred banana leaf and baked to aromatic perfection.',
    price: 1850,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    spiceLevel: 3,
    dietary: ['Halal', 'Chef Special'],
    calories: 820,
    preparationTime: '25-30 mins',
    available: true
  },
  {
    id: 'raalahami-002',
    name: 'Jaffna Spiced Mud Crab Curry',
    category: 'Seafood',
    description: 'Fresh blue swimmer lagoon crab simmered in a robust roasted Jaffna curry powder, tempered with moringa leaves, fenugreek, coconut milk, and crushed tamarind. Served with warm roast paan.',
    price: 3800,
    imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
    spiceLevel: 4,
    dietary: ['Gluten-Free', 'Chef Special'],
    calories: 640,
    preparationTime: '30-35 mins',
    available: true
  },
  {
    id: 'raalahami-003',
    name: 'Slow-Cooked Black Pork Curry',
    category: 'Mains',
    description: 'Tender pork belly cubes stewed in dark roasted Sri Lankan spices, goraka (gamboge), lemongrass, and crushed black pepper until meltingly tender with deep smoky flavors.',
    price: 2200,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    spiceLevel: 4,
    dietary: ['Gluten-Free'],
    calories: 720,
    preparationTime: '20-25 mins',
    available: true
  },
  {
    id: 'raalahami-004',
    name: 'Crispy Organic Egg Hopper Feast',
    category: 'Starters',
    description: 'Trio of bowl-shaped crispy fermented rice batter hoppers with soft steamy centers, organic pasture-raised egg, accompanied by seeni sambol (caramelized onion relish) and fiery lunu miris.',
    price: 950,
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    spiceLevel: 2,
    dietary: ['Vegetarian', 'Gluten-Free'],
    calories: 410,
    preparationTime: '15-20 mins',
    available: true
  },
  {
    id: 'raalahami-005',
    name: 'Cashew Nut & Green Pea Baduma',
    category: 'Vegetarian',
    description: 'Whole plump Sri Lankan raw cashews braised in velvety coconut cream, green garden peas, tempered with turmeric, curry leaves, and green chillies.',
    price: 1650,
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    spiceLevel: 1,
    dietary: ['Vegetarian', 'Vegan', 'Gluten-Free'],
    calories: 490,
    preparationTime: '15 mins',
    available: true
  },
  {
    id: 'raalahami-006',
    name: 'Royal Heritage Watalappan',
    category: 'Desserts',
    description: 'Traditional steamed coconut custard infused with pure Kitul jaggery, fresh nutmeg, cardamom, and toasted cashew nuts. A celebratory festive delicacy.',
    price: 850,
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
    spiceLevel: 0,
    dietary: ['Vegetarian', 'Gluten-Free', 'Chef Special'],
    calories: 360,
    preparationTime: '10 mins',
    available: true
  }
];

/**
 * Normalizes backend dish payload into standard frontend format
 */
function normalizeMenuItem(item) {
  const dietaryList = Array.isArray(item.dietary) ? [...item.dietary] : [];
  if (item.is_vegan && !dietaryList.includes('Vegan')) dietaryList.push('Vegan');
  if (item.is_halal && !dietaryList.includes('Halal')) dietaryList.push('Halal');
  if (item.is_gluten_free && !dietaryList.includes('Gluten-Free')) dietaryList.push('Gluten-Free');

  // Normalize category name
  const rawCat = item.category || item.category_name || 'Mains';
  let cleanCategory = rawCat;
  if (rawCat.toLowerCase().includes('starter')) cleanCategory = 'Starters';
  else if (rawCat.toLowerCase().includes('seafood') || rawCat.toLowerCase().includes('crab') || rawCat.toLowerCase().includes('fish')) cleanCategory = 'Seafood';
  else if (rawCat.toLowerCase().includes('dessert') || rawCat.toLowerCase().includes('sweet')) cleanCategory = 'Desserts';
  else if (rawCat.toLowerCase().includes('veg')) cleanCategory = 'Vegetarian';
  else if (rawCat.toLowerCase().includes('main') || rawCat.toLowerCase().includes('curry') || rawCat.toLowerCase().includes('rice')) cleanCategory = 'Mains';

  return {
    id: item.id,
    name: item.name,
    category: cleanCategory,
    originalCategory: rawCat,
    description: item.description || '',
    price: typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price || 0),
    imageUrl:
      item.imageUrl ||
      item.image_url ||
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    spiceLevel: item.spiceLevel ?? item.spice_level ?? 2,
    dietary: dietaryList.length > 0 ? dietaryList : ['Chef Special'],
    calories: item.calories || 550,
    preparationTime: item.preparationTime || item.preparation_time || '20-25 mins',
    available: item.available ?? item.is_available ?? true
  };
}

export const menuService = {
  /**
   * Fetch menu items with optional category and search filters.
   * Gracefully matches backend route: attempts /menu first, falling back to /menu-items.
   */
  async getMenuItems(category = 'All', search = '') {
    const queryParams = new URLSearchParams();
    if (category && category !== 'All') queryParams.append('category', category);
    if (search) queryParams.append('search', search);
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    let rawData = null;

    // 1. Try primary endpoint: GET /api/menu
    try {
      const response = await apiClient.get(`/menu${queryString}`);
      rawData = response?.data;
    } catch (err) {
      // 2. Gracefully fallback to alternative route: GET /api/menu-items
      try {
        const altResponse = await apiClient.get(`/menu-items${queryString}`);
        rawData = altResponse?.data;
      } catch (altErr) {
        console.warn('Backend menu route not responding, using presentation fallback:', altErr.message);
      }
    }

    // 3. Extract items list handling { success: true, data: [...] } and direct array
    const items = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.data)
      ? rawData.data
      : Array.isArray(rawData?.items)
      ? rawData.items
      : null;

    if (items && items.length > 0) {
      let mapped = items.map(normalizeMenuItem);

      if (category && category !== 'All') {
        mapped = mapped.filter(
          (i) =>
            i.category.toLowerCase() === category.toLowerCase() ||
            (i.originalCategory && i.originalCategory.toLowerCase().includes(category.toLowerCase()))
        );
      }

      if (search) {
        const q = search.toLowerCase();
        mapped = mapped.filter(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            i.description.toLowerCase().includes(q)
        );
      }

      return mapped;
    }

    // 4. Graceful presentation fallback
    let fallback = [...FALLBACK_MENU_ITEMS];
    if (category && category !== 'All') {
      fallback = fallback.filter((i) => i.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      fallback = fallback.filter(
        (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }
    return fallback;
  },

  /**
   * Get single item by ID with graceful /menu and /menu-items matching
   */
  async getMenuItemById(id) {
    let rawItem = null;

    try {
      const response = await apiClient.get(`/menu/${id}`);
      rawItem = response?.data?.data || response?.data;
    } catch (e) {
      try {
        const altResponse = await apiClient.get(`/menu-items/${id}`);
        rawItem = altResponse?.data?.data || altResponse?.data;
      } catch {
        // Fallback below
      }
    }

    if (rawItem && typeof rawItem === 'object') {
      return normalizeMenuItem(rawItem);
    }

    return FALLBACK_MENU_ITEMS.find((i) => String(i.id) === String(id)) || null;
  },

  /**
   * Get categories list with backend route fallback
   */
  async getCategories() {
    try {
      const response = await apiClient.get('/menu/categories');
      const cats = response?.data?.data || response?.data;
      if (Array.isArray(cats) && cats.length > 0) {
        const names = cats.map((c) => (typeof c === 'string' ? c : c.name || c.category_name));
        return ['All', ...new Set(names.filter(Boolean))];
      }
    } catch {
      try {
        const altResponse = await apiClient.get('/menu-items/categories');
        const cats = altResponse?.data?.data || altResponse?.data;
        if (Array.isArray(cats) && cats.length > 0) {
          const names = cats.map((c) => (typeof c === 'string' ? c : c.name || c.category_name));
          return ['All', ...new Set(names.filter(Boolean))];
        }
      } catch {
        // Fallback
      }
    }
    return ['All', 'Mains', 'Seafood', 'Starters', 'Vegetarian', 'Desserts'];
  }
};

export default menuService;
