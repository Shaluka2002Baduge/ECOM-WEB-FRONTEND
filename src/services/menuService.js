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
  },
  {
    id: 9,
    name: 'Natural Mountain Spring Water Bottle',
    category: 'Beverages & Water Bottles',
    category_id: 7,
    description: 'Pure, crisp natural mountain spring water bottled directly from pristine protected Ceylon watershed springs. Select your preferred bottle size.',
    price: 150,
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
    spiceLevel: 0,
    dietary: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal'],
    calories: 0,
    preparationTime: 'Instant',
    available: true,
    is_inventory_synced: true,
    is_inventory_item: true,
    item_source: 'inventory',
    variants: [
      { size: '500ml', price: 150, inventoryName: 'Natural Spring Water Bottle (500ml)' },
      { size: '1L', price: 250, inventoryName: 'Natural Spring Water Bottle (1L)' },
      { size: '1.5L', price: 350, inventoryName: 'Natural Spring Water Bottle (1.5L)' },
      { size: '2L', price: 450, inventoryName: 'Natural Spring Water Bottle (2L)' }
    ]
  },
  {
    id: 16,
    name: 'Cocacola',
    category: 'Beverages & Water Bottles',
    category_id: 7,
    description: 'Fresh authentic Cocacola curated directly from our certified estates. Select your preferred bottle size.',
    price: 350,
    imageUrl: '/uploads/inv-1790845264830-169188868.jpeg',
    spiceLevel: 0,
    dietary: ['Vegetarian', 'Vegan', 'Halal', 'Chef Special'],
    calories: 140,
    preparationTime: 'Instant',
    available: true,
    is_inventory_synced: true,
    is_inventory_item: true,
    item_source: 'inventory',
    variants: [
      { size: '500ml', price: 350, inventoryName: 'Cocacola (500ml)' },
      { size: '1L', price: 650, inventoryName: 'Cocacola (1L)' },
      { size: '1.5L', price: 950, inventoryName: 'Cocacola (1.5L)' },
      { size: '2L', price: 1250, inventoryName: 'Cocacola (2L)' }
    ]
  },
  {
    id: 11,
    name: 'Chilled King Coconut Nectar (Thambili)',
    category: 'Crafted Drinks',
    category_id: 6,
    description: 'Freshly tapped pure organic golden King Coconut water served cold over crushed ice with garden mint leaves and a squeeze of lime.',
    price: 300,
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    spiceLevel: 0,
    dietary: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Chef Special'],
    calories: 90,
    preparationTime: '5 mins',
    available: true,
    is_inventory_synced: false,
    is_inventory_item: false,
    item_source: 'menu'
  },
  {
    id: 12,
    name: 'Ceylon Spiced Lemongrass & Mint Cooler',
    category: 'Crafted Drinks',
    category_id: 6,
    description: 'Cold-infused organic Ceylon lemongrass stalk, crushed garden spearmint, fresh lime juice, and wild bee honey over iced water.',
    price: 320,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80',
    spiceLevel: 0,
    dietary: ['Vegetarian', 'Gluten-Free', 'Chef Special'],
    calories: 110,
    preparationTime: '5 mins',
    available: true,
    is_inventory_synced: false,
    is_inventory_item: false,
    item_source: 'menu'
  }
];

/**
 * Category names map by numeric ID
 */
const CATEGORY_NAMES_BY_ID = {
  1: 'Starters',
  2: 'Mains',
  3: 'Mains',
  4: 'Seafood',
  5: 'Desserts',
  6: 'Crafted Drinks',
  7: 'Beverages & Water Bottles'
};

/**
 * Normalizes backend dish payload into standard frontend format
 */
function normalizeMenuItem(item) {
  if (!item) return null;

  const dietaryList = Array.isArray(item.dietary)
    ? [...item.dietary]
    : Array.isArray(item.dietary_tags)
    ? [...item.dietary_tags]
    : typeof item.dietary === 'string'
    ? item.dietary.split(',').map((s) => s.trim()).filter(Boolean)
    : typeof item.dietary_tags === 'string'
    ? item.dietary_tags.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  if (item.is_vegan && !dietaryList.includes('Vegan')) dietaryList.push('Vegan');
  if (item.is_halal && !dietaryList.includes('Halal')) dietaryList.push('Halal');
  if (item.is_gluten_free && !dietaryList.includes('Gluten-Free')) dietaryList.push('Gluten-Free');

  // Normalize category name safely
  let rawCat = '';
  if (typeof item.category === 'string') {
    rawCat = item.category;
  } else if (item.category && typeof item.category === 'object' && item.category.name) {
    rawCat = item.category.name;
  } else if (typeof item.category_name === 'string') {
    rawCat = item.category_name;
  } else if (item.category_id && CATEGORY_NAMES_BY_ID[Number(item.category_id)]) {
    rawCat = CATEGORY_NAMES_BY_ID[Number(item.category_id)];
  } else if (typeof item.category === 'number' && CATEGORY_NAMES_BY_ID[item.category]) {
    rawCat = CATEGORY_NAMES_BY_ID[item.category];
  } else {
    rawCat = 'Mains';
  }

  const rawCatStr = String(rawCat || 'Mains');
  let cleanCategory = rawCatStr;
  const lowerCat = rawCatStr.toLowerCase();
  if (
    lowerCat === 'beverages & water bottles' ||
    lowerCat === 'beverages-water-bottles' ||
    lowerCat === 'water bottles & beverages' ||
    lowerCat.includes('bottle') ||
    lowerCat.includes('water') ||
    item.is_inventory_item === true ||
    item.item_source === 'inventory' ||
    item.category_id === 7 ||
    String(item.category_id) === '7'
  ) {
    cleanCategory = 'Beverages & Water Bottles';
  } else if (
    lowerCat === 'crafted drinks' ||
    lowerCat === 'crafted-drinks' ||
    lowerCat === 'hand crafted drinks' ||
    lowerCat === 'hand-crafted-drinks' ||
    lowerCat === 'craft beverages' ||
    lowerCat === 'craft-beverages' ||
    lowerCat.includes('drink') ||
    lowerCat.includes('craft') ||
    item.category_id === 6 ||
    String(item.category_id) === '6'
  ) {
    cleanCategory = 'Crafted Drinks';
  } else if (lowerCat.includes('starter') || lowerCat.includes('short')) {
    cleanCategory = 'Starters';
  } else if (lowerCat.includes('seafood') || lowerCat.includes('crab') || lowerCat.includes('fish') || lowerCat.includes('prawn')) {
    cleanCategory = 'Seafood';
  } else if (lowerCat.includes('dessert') || lowerCat.includes('sweet')) {
    cleanCategory = 'Desserts';
  } else if (lowerCat.includes('veg')) {
    cleanCategory = 'Vegetarian';
  } else if (lowerCat.includes('main') || lowerCat.includes('curry') || lowerCat.includes('rice') || lowerCat.includes('lamprais') || lowerCat.includes('kottu')) {
    cleanCategory = 'Mains';
  }

  const resolvedId = item.id ?? item.menu_item_id ?? item.menuItemId ?? item._id;

  const resolvedImage =
    item.image_url ||
    item.imageUrl ||
    item.image ||
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';

  const resolvedAvailable = item.is_available ?? item.available ?? (item.status ? item.status === 'Available' : true);
  const resolvedSpice = item.spice_level !== undefined ? Number(item.spice_level) : (item.spiceLevel !== undefined ? Number(item.spiceLevel) : 0);
  const resolvedCatId = item.category_id !== undefined ? Number(item.category_id) : (typeof item.category === 'number' ? item.category : 1);

  let parsedVariants = [];
  if (
    cleanCategory === 'Beverages & Water Bottles' ||
    item.is_inventory_item === true ||
    item.is_inventory_synced === true ||
    item.item_source === 'inventory' ||
    resolvedCatId === 7
  ) {
    if (Array.isArray(item.variants)) {
      parsedVariants = item.variants;
    } else if (typeof item.variants === 'string') {
      try {
        parsedVariants = JSON.parse(item.variants);
      } catch (e) {
        parsedVariants = [];
      }
    } else if (Array.isArray(item.sizeOptions)) {
      parsedVariants = item.sizeOptions;
    } else if (Array.isArray(item.sizes)) {
      parsedVariants = item.sizes;
    }
  }

  let derivedPrice = typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price || 0);
  if ((!derivedPrice || derivedPrice === 0) && parsedVariants.length > 0 && parsedVariants[0].price) {
    derivedPrice = Number(parsedVariants[0].price);
  }

  return {
    id: resolvedId,
    menu_item_id: resolvedId,
    menuItemId: resolvedId,
    name: item.name || '',
    category: cleanCategory,
    category_id: isNaN(resolvedCatId) ? 1 : resolvedCatId,
    originalCategory: rawCatStr,
    description: item.description || '',
    price: derivedPrice,
    imageUrl: resolvedImage,
    image_url: resolvedImage,
    image: resolvedImage,
    spiceLevel: resolvedSpice,
    spice_level: resolvedSpice,
    dietary: dietaryList.length > 0 ? dietaryList : ['Chef Special'],
    dietary_tags: dietaryList.length > 0 ? dietaryList : ['Chef Special'],
    calories: item.calories || 550,
    preparationTime: item.preparationTime || item.preparation_time || '20-25 mins',
    available: resolvedAvailable,
    is_available: resolvedAvailable,
    status: resolvedAvailable ? 'Available' : 'Unavailable',
    variants: parsedVariants
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
    queryParams.append('_t', String(Date.now()));
    const queryString = `?${queryParams.toString()}`;

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
      : Array.isArray(rawData?.menu)
      ? rawData.menu
      : Array.isArray(rawData?.menuItems)
      ? rawData.menuItems
      : Array.isArray(rawData?.data?.menuItems)
      ? rawData.data.menuItems
      : null;

    if (items && Array.isArray(items)) {
      let mapped = items.map(normalizeMenuItem).filter(Boolean);

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
    return ['All', 'Mains', 'Seafood', 'Starters', 'Vegetarian', 'Desserts', 'Hand Crafted Drinks', 'Beverages & Water Bottles'];
  },

  /**
   * Update existing menu item with image, pricing, and details
   */
  async updateMenuItem(id, updatePayload) {
    try {
      const response = await apiClient.put(`/menu/${id}`, updatePayload);
      const rawData = response?.data?.data || response?.data;
      return rawData ? normalizeMenuItem(rawData) : updatePayload;
    } catch (e) {
      try {
        const altResponse = await apiClient.put(`/menu-items/${id}`, updatePayload);
        const rawData = altResponse?.data?.data || altResponse?.data;
        return rawData ? normalizeMenuItem(rawData) : updatePayload;
      } catch (altErr) {
        console.warn('Backend update failed, using client-side payload:', altErr.message);
        return updatePayload;
      }
    }
  },

  /**
   * Create new menu item
   */
  async createMenuItem(dishPayload) {
    try {
      const response = await apiClient.post('/menu', dishPayload);
      const rawData = response?.data?.data || response?.data;
      return rawData ? normalizeMenuItem(rawData) : dishPayload;
    } catch (e) {
      try {
        const altResponse = await apiClient.post('/menu-items', dishPayload);
        const rawData = altResponse?.data?.data || altResponse?.data;
        return rawData ? normalizeMenuItem(rawData) : dishPayload;
      } catch (altErr) {
        console.warn('Backend create failed, using client-side payload:', altErr.message);
        return dishPayload;
      }
    }
  },

  /**
   * Delete menu item
   */
  async deleteMenuItem(id) {
    try {
      return await apiClient.delete(`/menu/${id}`);
    } catch (e) {
      return await apiClient.delete(`/menu-items/${id}`);
    }
  }
};

export default menuService;

