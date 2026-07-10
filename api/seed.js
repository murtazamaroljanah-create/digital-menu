// api/seed.js — One-time endpoint to seed the default menu data into MongoDB
// Call: POST /api/seed  (only works if the collections are empty)
const { connectToDatabase } = require('./db');

const DEFAULT_SECTIONS = [
  { id: "sec-1", name: "Sweets", icon: "cookie", createdAt: new Date() },
  { id: "sec-2", name: "Snacks", icon: "sandwich", createdAt: new Date() },
  { id: "sec-3", name: "Beverages", icon: "cup-soda", createdAt: new Date() },
  { id: "sec-4", name: "Special Packs", icon: "gift", createdAt: new Date() },
  { id: "sec-5", name: "Others", icon: "heart", createdAt: new Date() }
];

const DEFAULT_ITEMS = [
  { id: "item-1", name: "Kaju Katli", category: "Sweets", price: 720, unit: "kg", desc: "Rich and soft cashew slices made with pure ghee and decorated with premium silver leaf.", image: "assets/kaju_katli.png", available: true, createdAt: new Date() },
  { id: "item-2", name: "Motichoor Ladoo", category: "Sweets", price: 560, unit: "kg", desc: "Classic soft laddoo made from fine boondi pearls, pure ghee, and a hint of cardamom.", image: "assets/ladoo.png", available: true, createdAt: new Date() },
  { id: "item-3", name: "Mathri", category: "Snacks", price: 280, unit: "kg", desc: "Crispy and savory traditional crackers spiced with carom seeds (ajwain), perfect for tea time.", image: "assets/mathri.png", available: true, createdAt: new Date() },
  { id: "item-4", name: "Masala Khasta", category: "Snacks", price: 300, unit: "kg", desc: "Flaky crust stuffed with spicy and savory lentil mixture, fried to golden perfection.", image: "assets/mathri.png", available: true, createdAt: new Date() },
  { id: "item-5", name: "Badam Milk", category: "Beverages", price: 120, unit: "glass", desc: "Rich, chilled almond milk infused with real saffron strands and garnished with sliced almonds.", image: "assets/badam_milk.png", available: true, createdAt: new Date() },
  { id: "item-6", name: "Rasgulla", category: "Sweets", price: 440, unit: "kg", desc: "Soft and spongy traditional cottage cheese balls cooked in delicate sugar syrup.", image: "assets/rasgulla.png", available: true, createdAt: new Date() },
  { id: "item-7", name: "Gulab Jamun", category: "Sweets", price: 440, unit: "kg", desc: "Warm golden-brown fried milk solids dumplings soaked in rose-flavored cardamom syrup.", image: "assets/gulab_jamun.png", available: true, createdAt: new Date() }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — check current counts (health check)
  if (req.method === 'GET') {
    try {
      const { db } = await connectToDatabase();
      const sectionsCount = await db.collection('sections').countDocuments();
      const itemsCount = await db.collection('items').countDocuments();
      return res.status(200).json({
        status: 'ok',
        sections: sectionsCount,
        items: itemsCount,
        message: sectionsCount > 0
          ? 'Database already seeded. Use POST /api/seed?force=true to re-seed.'
          : 'Database is empty. POST /api/seed to seed default data.'
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // POST — seed default data
  if (req.method === 'POST') {
    try {
      const { db } = await connectToDatabase();
      const sCol = db.collection('sections');
      const iCol = db.collection('items');

      const force = req.query.force === 'true';
      const existingSections = await sCol.countDocuments();

      if (existingSections > 0 && !force) {
        return res.status(200).json({
          message: 'Database already has data. Use ?force=true to wipe and re-seed.',
          sections: existingSections
        });
      }

      // Wipe and re-seed
      await sCol.deleteMany({});
      await iCol.deleteMany({});
      await sCol.insertMany(DEFAULT_SECTIONS);
      await iCol.insertMany(DEFAULT_ITEMS);

      return res.status(200).json({
        message: '✅ Database seeded successfully!',
        sections: DEFAULT_SECTIONS.length,
        items: DEFAULT_ITEMS.length
      });
    } catch (err) {
      console.error('[seed error]', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
