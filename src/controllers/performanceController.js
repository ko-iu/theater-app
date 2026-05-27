import { query } from '../config/database.js';

export const getAllPerformances = async (req, res) => {
  try {
    const { type, featured, search } = req.query;
    let sql = `
      SELECT p.*, 
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pc.id,
              'role', pc.role_name,
              'artist', jsonb_build_object(
                'id', a.id,
                'name', CONCAT(a.first_name, ' ', a.last_name),
                'role', a.role,
                'imageUrl', a.image_url
              )
            )
          ) FILTER (WHERE pc.id IS NOT NULL), '[]'
        ) as cast
      FROM performances p
      LEFT JOIN performance_cast pc ON p.id = pc.performance_id
      LEFT JOIN artists a ON pc.artist_id = a.id
    `;
    
    const conditions = [];
    const params = [];
    
    if (type && type !== 'Все') {
      conditions.push(`p.type = $${params.length + 1}`);
      params.push(type);
    }
    
    if (featured === 'true') {
      conditions.push(`p.is_featured = true`);
    }
    
    if (search) {
      conditions.push(`p.title ILIKE $${params.length + 1}`);
      params.push(`%${search}%`);
    }
    
    if (conditions.length) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' GROUP BY p.id ORDER BY p.date DESC';
    
    const result = await query(sql, params);
    
    // Transform to match frontend format
    const performances = result.rows.map(perf => ({
      id: perf.id,
      title: perf.title,
      type: perf.type,
      date: perf.date,
      time: perf.time.slice(0, 5),
      imageUrl: perf.image_url,
      description: perf.description,
      shortDescription: perf.short_description,
      history: perf.history,
      duration: perf.duration,
      ticketUrl: perf.ticket_url,
      isFeatured: perf.is_featured,
      cast: perf.cast.map(c => ({
        role: c.role,
        artist: c.artist.name,
        artistId: c.artist.id,
      })),
    }));
    
    res.json(performances);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPerformanceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `
      SELECT p.*, 
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pc.id,
              'role', pc.role_name,
              'artist', jsonb_build_object(
                'id', a.id,
                'name', CONCAT(a.first_name, ' ', a.last_name),
                'role', a.role,
                'imageUrl', a.image_url
              )
            )
          ) FILTER (WHERE pc.id IS NOT NULL), '[]'
        ) as cast
      FROM performances p
      LEFT JOIN performance_cast pc ON p.id = pc.performance_id
      LEFT JOIN artists a ON pc.artist_id = a.id
      WHERE p.id = $1
      GROUP BY p.id
      `,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Performance not found' });
    }
    
    const perf = result.rows[0];
    const performance = {
      id: perf.id,
      title: perf.title,
      type: perf.type,
      date: perf.date,
      time: perf.time.slice(0, 5),
      imageUrl: perf.image_url,
      description: perf.description,
      shortDescription: perf.short_description,
      history: perf.history,
      duration: perf.duration,
      ticketUrl: perf.ticket_url,
      isFeatured: perf.is_featured,
      cast: perf.cast.map(c => ({
        role: c.role,
        artist: c.artist.name,
        artistId: c.artist.id,
      })),
    };
    
    res.json(performance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};