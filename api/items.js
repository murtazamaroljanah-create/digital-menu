// api/items.js — CRUD for menu items
const { connectToDatabase } = require('./db');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { db } = await connectToDatabase();
    const col = db.collection('items');

    // GET — fetch all items (or filter by ?category=Sweets)
    if (req.method === 'GET') {
      const filter = {};
      if (req.query.category) filter.category = req.query.category;
      const items = await col.find(filter).sort({ createdAt: 1 }).toArray();
      return res.status(200).json(items);
    }

    // POST — create new item
    if (req.method === 'POST') {
      const { id, name, category, price, unit, desc, image, available } = req.body;
      if (!name || !price) return res.status(400).json({ error: 'name and price are required' });

      const item = {
        id: id || `item-${Date.now()}`,
        name,
        category: category || 'Others',
        price: Number(price),
        unit: unit || 'piece',
        desc: desc || '',
        image: image || '',
        available: available !== undefined ? available : true,
        createdAt: new Date()
      };
      await col.insertOne(item);
      return res.status(201).json(item);
    }

    // PUT — update existing item by id
    if (req.method === 'PUT') {
      const { id, name, category, price, unit, desc, image, available } = req.body;
      if (!id) return res.status(400).json({ error: 'id is required' });

      const update = {};
      if (name !== undefined) update.name = name;
      if (category !== undefined) update.category = category;
      if (price !== undefined) update.price = Number(price);
      if (unit !== undefined) update.unit = unit;
      if (desc !== undefined) update.desc = desc;
      if (image !== undefined) update.image = image;
      if (available !== undefined) update.available = available;

      await col.updateOne({ id }, { $set: update });
      return res.status(200).json({ id, ...update });
    }

    // DELETE — delete item by id (pass ?id=xxx)
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id query param is required' });

      await col.deleteOne({ id });
      return res.status(200).json({ deleted: id });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('[items API error]', err.message);
    return res.status(500).json({ error: 'Database error', details: err.message });
  }
};
