export const grassLengthItems = [
  {
    GrassLengthId: 1,
    GrassLengthDesc: "Ankle \nHeight",
    GrassLengthUnit: "0-50mm",
  },
  {
    GrassLengthId: 2,
    GrassLengthDesc: "Mid-Calf \nHeight",
    GrassLengthUnit: "51-150mm",
  },
  {
    GrassLengthId: 3,
    GrassLengthDesc: "Above-Calf \nHeight",
    GrassLengthUnit: "151-250mm",
  },
  {
    GrassLengthId: 4,
    GrassLengthDesc: "Calf \nHeight",
    GrassLengthUnit: "251-350mm",
  },
  {
    GrassLengthId: 5,
    GrassLengthDesc: "Knee \nHeight",
    GrassLengthUnit: "351-500mm",
  },
];

// High-level service categories shown on the home booking screen.
// `includesMowing` gates the grass-length / clippings / lawn-image steps.
// `includesGarden` gates the (not-yet-built) other services section.
export const SERVICE_CATEGORY = {
  MOWING: 1,
  MOWING_AND_GARDEN: 2,
  GARDEN_ONLY: 3,
} as const;

export const serviceCategoryItems = [
  {
    id: SERVICE_CATEGORY.MOWING,
    title: 'Lawn Mowing',
    description: 'Professional lawn mowing to keep your yard neat and healthy.',
    icon: 'grass', // MaterialCommunityIcons
    includesMowing: true,
    includesGarden: false,
  },
  {
    id: SERVICE_CATEGORY.MOWING_AND_GARDEN,
    title: 'Lawn Mowing + Other Services',
    description: 'Get your lawn mowed and add other services in one booking.',
    icon: 'leaf', // MaterialCommunityIcons
    includesMowing: true,
    includesGarden: true,
  },
  {
    id: SERVICE_CATEGORY.GARDEN_ONLY,
    title: 'Other Services Only',
    description: 'Maintenance, clean-ups, hedge trimming and more.',
    icon: 'shovel', // MaterialCommunityIcons
    includesMowing: false,
    includesGarden: true,
  },
];

// --- Extra / garden services ---------------------------------------------
// A service the customer attaches to a garden-inclusive booking. Custom items
// are typed by the user; catalog items are picked from `extraServiceCatalog`.
// Pricing is always provider-confirmed for now, hence the single status.
export interface ExtraService {
  id: string;
  name: string;
  description: string;
  isCustom: boolean;
  catalogId?: number;
  status: 'to_be_quoted';
}

export interface ExtraServiceCatalogItem {
  catalogId: number;
  name: string;
  description: string;
}

// Placeholder catalog until the backend exposes a real endpoint.
export const extraServiceCatalog: ExtraServiceCatalogItem[] = [
  {
    catalogId: 1,
    name: 'Hedge trimming',
    description: 'Trim hedges and shrubs',
  },
  {
    catalogId: 2,
    name: 'Green waste removal',
    description: 'Remove and dispose of all green waste',
  },
  {catalogId: 3, name: 'Weeding', description: 'Remove weeds from garden beds'},
  {
    catalogId: 4,
    name: 'Garden clean-up',
    description: 'General tidy-up of garden areas',
  },
  {
    catalogId: 5,
    name: 'Mulching',
    description: 'Spread mulch across garden beds',
  },
  {
    catalogId: 6,
    name: 'Pruning',
    description: 'Prune trees and plants',
  },
  {
    catalogId: 7,
    name: 'Leaf blowing',
    description: 'Clear leaves from paths and lawn',
  },
];

// Dependency-free unique id for locally-created extra services.
export const makeExtraServiceId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const mowHeightItems = [
  {
    MowLengthId: 1,
    MowLengthDesc: "Low",
  },
  {
    MowLengthId: 2,
    MowLengthDesc: "Medium",
  },
  {
    MowLengthId: 3,
    MowLengthDesc: "High",
  },
];
