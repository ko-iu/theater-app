import { query } from '../config/database.js';

export const getAllArtists = async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = `
      SELECT 
        id,
        first_name,
        last_name,
        role,
        category,
        biography,
        image_url
      FROM artists
      WHERE 1=1
    `;
    const params = [];
    
    if (category && category !== 'all' && category !== 'Все') {
      let catParam = category;
      if (category === 'direction') catParam = 'Руководство';
      if (category === 'ballet') catParam = 'Балет';
      if (category === 'opera') catParam = 'Опера';
      if (category === 'choir') catParam = 'Хор';
      if (category === 'orchestra') catParam = 'Оркестр';
      
      sql += ` AND category = $${params.length + 1}`;
      params.push(catParam);
    }
    
    if (search) {
      sql += ` AND (first_name ILIKE $${params.length + 1} OR last_name ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }
    
    sql += ' ORDER BY last_name';
    
    const result = await query(sql, params);
    
    const artists = result.rows.map(artist => ({
      id: artist.id,
      name: `${artist.first_name} ${artist.last_name}`,
      role: artist.role,
      imageUrl: artist.image_url,
      bio: artist.biography,
      category: artist.category,
    }));
    
    res.json(artists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getArtistById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const artistResult = await query(
      `
      SELECT 
        id,
        first_name,
        last_name,
        role,
        category,
        biography,
        image_url
      FROM artists
      WHERE id = $1
      `,
      [id]
    );
    
    if (artistResult.rows.length === 0) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    
    const artist = artistResult.rows[0];
    
    // Получаем спектакли с ID и названием (для создания ссылок)
    const performancesResult = await query(
      `
      SELECT p.id, p.title
      FROM performances p
      JOIN performance_cast pc ON p.id = pc.performance_id
      WHERE pc.artist_id = $1
      ORDER BY p.date DESC
      `,
      [id]
    );
    
    const artistData = {
      id: artist.id,
      name: `${artist.first_name} ${artist.last_name}`,
      firstName: artist.first_name,
      lastName: artist.last_name,
      role: artist.role,
      imageUrl: artist.image_url,
      bio: artist.biography,
      category: artist.category,
      performances: performancesResult.rows, // Теперь массив объектов { id, title }
    };
    
    res.json(artistData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};