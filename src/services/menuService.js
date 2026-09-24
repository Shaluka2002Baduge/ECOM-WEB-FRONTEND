/**
 * Ralahami Restaurant - Menu Service
 * Communicates with backend /menu endpoints with high-fidelity fallback data
 */
import apiClient from '../api/apiClient';

// Authentic Sri Lankan Fine Dining Menu Baseline
export const FALLBACK_MENU_ITEMS = [
  {
    id: 'ralahami-001',
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
    id: 'ralahami-002',
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
    id: 'ralahami-003',
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
    id: 'ralahami-004',
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
    id: 'ralahami-005',
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
    id: 'ralahami-006',
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

export const menuService = {
  /**
   * Fetch menu items with optional category and search filters
   */
  async getMenuItems(category = 'All', search = '') {
    try {
      const queryParams = new URLSearchParams();
      if (category && category !== 'All') queryParams.append('category', category);
      if (search) queryParams.append('search', search);

      const endpoint = `/menu?${queryParams.toString()}`;
      const response = await apiClient.get(endpoint);
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      }
      return FALLBACK_MENU_ITEMS;
    } catch (e) {
      // Graceful fallback to rich presentation menu
      let items = [...FALLBACK_MENU_ITEMS];
      if (category && category !== 'All') {
        items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
      }
      if (search) {
        const query = search.toLowerCase();
        items = items.filter(i => i.name.toLowerCase().includes(query) || i.description.toLowerCase().includes(query));
      }
      return items;
    }
  },

  /**
   * Get single item by ID
   */
  async getMenuItemById(id) {
    try {
      const response = await apiClient.get(`/menu/${id}`);
      return response.data;
    } catch (e) {
      return FALLBACK_MENU_ITEMS.find(i => String(i.id) === String(id)) || null;
    }
  },

  /**
   * Get categories list
   */
  async getCategories() {
    return ['All', 'Mains', 'Seafood', 'Starters', 'Vegetarian', 'Desserts'];
  }
};

export default menuService;
