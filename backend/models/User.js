const db = require('../config/db');

class User {
  static async findById(id) {
    try {
      const [rows] = await db.query(
        'SELECT id, name, email, role, position, department, phone, hire_date, profile_picture, created_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(userData) {
    try {
      const { name, email, password, role, position, department, phone, hire_date } = userData;
      const [result] = await db.query(
        'INSERT INTO users (name, email, password, role, position, department, phone, hire_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email, password, role || 'employee', position, department, phone, hire_date]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, userData) {
    try {
      // Extract fields from userData
      const fields = [];
      const values = [];
      
      // Process each field in userData
      Object.entries(userData).forEach(([key, value]) => {
        // Skip undefined values
        if (value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      });
      
      // Add id to values array
      values.push(id);
      
      // Build SQL query
      const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      
      console.log('Executing SQL:', sql);
      console.log('With params:', values);
      
      const [result] = await db.query(sql, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in User.update:', error);
      throw error;
    }
  }

  static async updatePassword(id, password) {
    try {
      const [result] = await db.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [password, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getAll() {
    try {
      const [rows] = await db.query(
        'SELECT id, name, email, role, position, department, phone, hire_date, profile_picture, created_at FROM users'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getByRole(role) {
    try {
      const [rows] = await db.query(
        'SELECT id, name, email, role, position, department, phone, hire_date, profile_picture, created_at FROM users WHERE role = ?',
        [role]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getByDepartment(department) {
    try {
      const [rows] = await db.query(
        'SELECT id, name, email, role, position, department, phone, hire_date, profile_picture, created_at FROM users WHERE department = ?',
        [department]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
  static async updateProfilePicture(id, profilePicture) {
    try {
      const [result] = await db.query(
        'UPDATE users SET profile_picture = ? WHERE id = ?',
        [profilePicture, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
