const db = require('../config/db');

class Profile {
  static async findByUserId(userId) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM profile WHERE user_id = ?',
        [userId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(profileData) {
    try {
      const { user_id, first_name, last_name, phone, address, image_path } = profileData;
      const [result] = await db.query(
        'INSERT INTO profile (user_id, first_name, last_name, phone, address, image_path) VALUES (?, ?, ?, ?, ?, ?)',
        [user_id, first_name || '', last_name || '', phone || '', address || '', image_path || '']
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(userId, profileData) {
    try {
      // Extract fields from profileData
      const fields = [];
      const values = [];
      
      // Process each field in profileData
      Object.entries(profileData).forEach(([key, value]) => {
        // Skip undefined values and user_id (cannot be updated)
        if (value !== undefined && key !== 'user_id') {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      });
      
      // Add userId to values array
      values.push(userId);
      
      // Build SQL query
      const sql = `UPDATE profile SET ${fields.join(', ')} WHERE user_id = ?`;
      
      console.log('Executing SQL:', sql);
      console.log('With params:', values);
      
      const [result] = await db.query(sql, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Profile.update:', error);
      throw error;
    }
  }

  static async updateImage(userId, imagePath) {
    try {
      // Check if profile exists
      const profile = await this.findByUserId(userId);
      
      if (profile) {
        // Update existing profile
        const [result] = await db.query(
          'UPDATE profile SET image_path = ? WHERE user_id = ?',
          [imagePath, userId]
        );
        return result.affectedRows > 0;
      } else {
        // Create new profile with image
        await this.create({
          user_id: userId,
          image_path: imagePath
        });
        return true;
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      throw error;
    }
  }

  static async delete(userId) {
    try {
      const [result] = await db.query('DELETE FROM profile WHERE user_id = ?', [userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Profile;
