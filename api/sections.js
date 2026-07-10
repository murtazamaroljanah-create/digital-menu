// api/sections.js — CRUD for menu sections
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
    const col = db.collection('sections');

    // GET — fetch all sections sorted by creation order
    if (req.method === 'GET') {
      const sections = await col.find({}).sort({ createdAt: 1 }).toArray();
      return res.status(200).json(sections);
    }

    // POST — create new section
    if (req.method === 'POST') {
      const { id, name, icon } = req.body;
      if (!name) return res.status(400).json({ error: 'name is required' });

      const section = {
        id: id || `sec-${Date.now()}`,
        name,
        icon: icon || 'cookie',
        createdAt: new Date()
      };
      await col.insertOne(section);
      return res.status(201).json(section);
    }

    // PUT — update existing section by id
    if (req.method === 'PUT') {
      const { id, name, icon } = req.body;
      if (!id) return res.status(400).json({ error: 'id is required' });

      await col.updateOne({ id }, { $set: { name, icon } });
      return res.status(200).json({ id, name, icon });
    }

    // DELETE — delete section by id (pass ?id=xxx)
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id query param is required' });

      await col.deleteOne({ id });
      return res.status(200).json({ deleted: id });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('[sections API error]', err.message);
    return res.status(500).json({ error: 'Database error', details: err.message });
  }
};
