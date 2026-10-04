/*
 * Catalogue model families supplied in the UBEPARI PC redesign brief.
 * No UBEPARI stock, prices, configurations, or model-specific images were supplied.
 * Populate the nullable fields only after the corresponding details are verified.
 */
const laptopFamilies = {
  Apple: ['MacBook Air M1', 'MacBook Air M2', 'MacBook Air M3', 'MacBook Air M4', 'MacBook Pro 14-inch', 'MacBook Pro 16-inch'],
  Dell: ['Dell Latitude 5420', 'Dell Latitude 5430', 'Dell Latitude 5440', 'Dell Latitude 5520', 'Dell Latitude 5540', 'Dell Inspiron 15', 'Dell XPS 13', 'Dell XPS 15', 'Dell Precision 5560'],
  HP: ['HP EliteBook 840 G8', 'HP EliteBook 840 G9', 'HP EliteBook 840 G10', 'HP ProBook 450 G9', 'HP ProBook 450 G10', 'HP Pavilion 15', 'HP Envy 13', 'HP Envy x360', 'HP Spectre x360', 'HP Victus 15'],
  Lenovo: ['Lenovo ThinkPad T14', 'Lenovo ThinkPad T14 Gen 3', 'Lenovo ThinkPad T14 Gen 4', 'Lenovo ThinkPad E14', 'Lenovo IdeaPad 5', 'Lenovo Yoga 7', 'Lenovo Legion 5'],
  ASUS: ['ASUS VivoBook 15', 'ASUS ZenBook 14', 'ASUS TUF Gaming A15', 'ASUS ROG Strix G16'],
  Acer: ['Acer Aspire 5', 'Acer Swift 3', 'Acer Nitro 5', 'Acer Predator Helios'],
};

const manufacturerSources = {
  Apple: 'https://support.apple.com/mac',
  Dell: 'https://www.dell.com/support/home/',
  HP: 'https://support.hp.com/',
  Lenovo: 'https://pcsupport.lenovo.com/',
  ASUS: 'https://www.asus.com/laptops/',
  Acer: 'https://www.acer.com/laptops',
};

const makeProductId = (brand, model) => `${brand}-${model}`
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

window.UBEPARI_PRODUCTS = Object.entries(laptopFamilies).flatMap(([brand, models]) =>
  models.map((model) => ({
    id: makeProductId(brand, model),
    brand,
    model,
    category: 'Laptop',
    image: null,
    imageAlt: '',
    description: 'Model family. Specifications vary by configuration.',
    availability: 'check',
    price: null,
    currency: 'TZS',
    specifications: {
      processor: null,
      ram: null,
      storage: null,
      display: null,
      graphics: null,
      operatingSystem: null,
      weight: null,
      battery: null,
    },
    source: manufacturerSources[brand],
  })),
);

/* Official WhatsApp number supplied in the UBEPARI contact form brief, international digits only. */
window.UBEPARI_CATALOGUE_CONFIG = {
  whatsappNumber: '255683491481',
};
