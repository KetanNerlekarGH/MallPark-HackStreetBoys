/**
 * Centralized Data Configuration for Malls in Pune City.
 * Contains parametric metadata, floor configurations, color themes, and sample store nodes for 3D layout rendering.
 */

export const PUNE_MALLS_DATA = [
  {
    id: "phoenix",
    name: "Phoenix Marketcity",
    location: "Viman Nagar, Pune",
    architecturalStyle: "Spacious Multi-Wing Atrium",
    description: "Pune's largest premier lifestyle destination featuring 4 expansive multi-wing levels with flagship global brands, dining, and multiplex cinema.",
    theme: {
      primary: "#d97706", // Amber / Warm Gold
      accent: "#10b981", // Emerald
      secondary: "#f59e0b",
      badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      floorColor: "#334155",
      wallColor: "#475569",
      accentMesh: "#f59e0b",
    },
    floors: [
      { id: "G", label: "Ground Floor", code: "G", elevation: 0, category: "Luxury & Fashion" },
      { id: "1", label: "1st Floor", code: "1", elevation: 3.5, category: "Apparel & Accessories" },
      { id: "2", label: "2nd Floor", code: "2", elevation: 7.0, category: "Electronics & Home" },
      { id: "3", label: "3rd Floor", code: "3", elevation: 10.5, category: "Food Court & Cinema" },
    ],
    layout: {
      type: "rectangular-multi-wing",
      width: 24,
      depth: 16,
      wingWidth: 8,
      wingDepth: 6,
      atriumRadius: 4,
      floorHeight: 3.5,
    },
    stores: [
      // Ground Floor
      { id: "p-g1", name: "Zara Flagship", category: "Fashion", floor: "G", zone: "North Wing", color: "#ec4899", position: [-7, 0.4, -4] },
      { id: "p-g2", name: "H&M Premium", category: "Apparel", floor: "G", zone: "South Wing", color: "#ef4444", position: [7, 0.4, -4] },
      { id: "p-g3", name: "Apple Premium Reseller", category: "Electronics", floor: "G", zone: "Central Atrium", color: "#64748b", position: [0, 0.4, 4] },
      { id: "p-g4", name: "Starbucks Reserve", category: "Café", floor: "G", zone: "North Wing", color: "#10b981", position: [-6, 0.4, 4] },

      // 1st Floor
      { id: "p-1f1", name: "Uniqlo", category: "Apparel", floor: "1", zone: "North Wing", color: "#ef4444", position: [-7, 3.9, -4] },
      { id: "p-1f2", name: "Sephora", category: "Beauty", floor: "1", zone: "South Wing", color: "#a855f7", position: [7, 3.9, -4] },
      { id: "p-1f3", name: "Nike Rise", category: "Sports", floor: "1", zone: "Central Atrium", color: "#f97316", position: [0, 3.9, 4] },
      { id: "p-1f4", name: "Marks & Spencer", category: "Fashion", floor: "1", zone: "South Wing", color: "#06b6d4", position: [6, 3.9, 4] },

      // 2nd Floor
      { id: "p-2f1", name: "Samsung Experience Store", category: "Electronics", floor: "2", zone: "North Wing", color: "#3b82f6", position: [-7, 7.4, -4] },
      { id: "p-2f2", name: "Crossword Bookstore", category: "Lifestyle", floor: "2", zone: "South Wing", color: "#84cc16", position: [7, 7.4, -4] },
      { id: "p-2f3", name: "Croma Digital", category: "Electronics", floor: "2", zone: "Central Atrium", color: "#14b8a6", position: [0, 7.4, 4] },

      // 3rd Floor
      { id: "p-3f1", name: "PVR ICON Cinemas (9 Screens)", category: "Entertainment", floor: "3", zone: "North Wing", color: "#eab308", position: [-7, 10.9, -3] },
      { id: "p-3f2", name: "Social Food Capital", category: "Dining", floor: "3", zone: "Central Atrium", color: "#f43f5e", position: [0, 10.9, 3] },
      { id: "p-3f3", name: "Timezone Arcade", category: "Gaming", floor: "3", zone: "South Wing", color: "#8b5cf6", position: [7, 10.9, -3] },
    ]
  },
  {
    id: "pavilion",
    name: "Pavilion Mall",
    location: "Senapati Bapat Road, Pune",
    architecturalStyle: "Circular Atrium & Skylight Dome",
    description: "A chic, upscale modern shopping center anchored around a signature 3-story circular glass atrium with floating perimeter balconies.",
    theme: {
      primary: "#8b5cf6", // Purple / Indigo
      accent: "#06b6d4", // Cyan
      secondary: "#a855f7",
      badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      floorColor: "#1e1b4b",
      wallColor: "#312e81",
      accentMesh: "#06b6d4",
    },
    floors: [
      { id: "G", label: "Ground Floor", code: "G", elevation: 0, category: "Luxury Boutiques" },
      { id: "1", label: "1st Floor", code: "1", elevation: 3.5, category: "High Street Fashion" },
      { id: "2", label: "2nd Floor", code: "2", elevation: 7.0, category: "Gourmet Dining & Arcade" },
    ],
    layout: {
      type: "circular-oval-atrium",
      radius: 9,
      atriumRadius: 4.2,
      segments: 16,
      floorHeight: 3.5,
    },
    stores: [
      // Ground Floor
      { id: "pv-g1", name: "Tommy Hilfiger", category: "Fashion", floor: "G", zone: "West Atrium Ring", color: "#3b82f6", position: [-6, 0.4, 0] },
      { id: "pv-g2", name: "Calvin Klein", category: "Apparel", floor: "G", zone: "East Atrium Ring", color: "#64748b", position: [6, 0.4, 0] },
      { id: "pv-g3", name: "MAC Cosmetics", category: "Beauty", floor: "G", zone: "North Ring", color: "#ec4899", position: [0, 0.4, -6] },
      { id: "pv-g4", name: "Blue Tokai Coffee", category: "Café", floor: "G", zone: "South Ring", color: "#d97706", position: [0, 0.4, 6] },

      // 1st Floor
      { id: "pv-1f1", name: "Superdry", category: "Fashion", floor: "1", zone: "West Atrium Ring", color: "#f97316", position: [-6, 3.9, 0] },
      { id: "pv-1f2", name: "Sun-Glass Hut", category: "Accessories", floor: "1", zone: "East Atrium Ring", color: "#eab308", position: [6, 3.9, 0] },
      { id: "pv-1f3", name: "Levis Store", category: "Apparel", floor: "1", zone: "North Ring", color: "#ef4444", position: [0, 3.9, -6] },

      // 2nd Floor
      { id: "pv-2f1", name: "Ithaka Gourmet Dining", category: "Dining", floor: "2", zone: "West Balcony", color: "#10b981", position: [-6, 7.4, 0] },
      { id: "pv-2f2", name: "PVR Cinemas Luxury Lounge", category: "Entertainment", floor: "2", zone: "North Balcony", color: "#8b5cf6", position: [0, 7.4, -6] },
      { id: "pv-2f3", name: "Chili's Grill & Bar", category: "Dining", floor: "2", zone: "East Balcony", color: "#f43f5e", position: [6, 7.4, 0] },
    ]
  },
  {
    id: "amanora",
    name: "Amanora Mall",
    location: "Hadapsar, Pune",
    architecturalStyle: "Open-Concept Twin Block Plaza",
    description: "An iconic open-concept lifestyle plaza with dual multi-block wings, central landscaped garden court, and outdoor promenade.",
    theme: {
      primary: "#f97316", // Sunset Orange
      accent: "#f43f5e", // Rose
      secondary: "#fb923c",
      badgeBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
      floorColor: "#292524",
      wallColor: "#44403c",
      accentMesh: "#f97316",
    },
    floors: [
      { id: "G", label: "Ground Plaza", code: "G", elevation: 0, category: "Plaza Retail & Cafes" },
      { id: "1", label: "1st Level Promenade", code: "1", elevation: 4.0, category: "Fashion & Entertainment" },
    ],
    layout: {
      type: "horseshoe-multi-block",
      blockWidth: 8,
      blockLength: 14,
      plazaGap: 7,
      floorHeight: 4.0,
    },
    stores: [
      // Ground Floor
      { id: "am-g1", name: "Decathlon Sports", category: "Sports Outlet", floor: "G", zone: "West Block", color: "#0284c7", position: [-7, 0.4, -2] },
      { id: "am-g2", name: "Westside Departmental Store", category: "Fashion", floor: "G", zone: "East Block", color: "#c026d3", position: [7, 0.4, -2] },
      { id: "am-g3", name: "Amphitheatre Central Fountain", category: "Plaza Feature", floor: "G", zone: "Central Courtyard", color: "#06b6d4", position: [0, 0.4, 4] },
      { id: "am-g4", name: "Third Wave Coffee", category: "Café", floor: "G", zone: "West Promenade", color: "#b45309", position: [-7, 0.4, 4] },

      // 1st Floor
      { id: "am-1f1", name: "INox Leisure Cinemas (8 Screens)", category: "Multiplex", floor: "1", zone: "East Block", color: "#eab308", position: [7, 4.4, -2] },
      { id: "am-1f2", name: "Lifestyle Store", category: "Apparel", floor: "1", zone: "West Block", color: "#ec4899", position: [-7, 4.4, -2] },
      { id: "am-1f3", name: "Skybridge Cafe & Bar", category: "Dining", floor: "1", zone: "Central Connecting Skybridge", color: "#f43f5e", position: [0, 4.4, 1] },
    ]
  }
];

export const getMallById = (id) => PUNE_MALLS_DATA.find((m) => m.id === id) || PUNE_MALLS_DATA[0];
