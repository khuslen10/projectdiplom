const db = require('../config/db');

class Changelog {
  static async create(changelogData) {
    try {
      const { title, description, type, created_by } = changelogData;
      const [result] = await db.query(
        'INSERT INTO changelog (title, description, type, created_by) VALUES (?, ?, ?, ?)',
        [title, description, type, created_by]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.query(
        `SELECT c.*, u.name as creator_name
         FROM changelog c
         LEFT JOIN users u ON c.created_by = u.id
         WHERE c.id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getAll() {
    try {
      const [rows] = await db.query(
        `SELECT c.*, u.name as creator_name
         FROM changelog c
         LEFT JOIN users u ON c.created_by = u.id
         ORDER BY c.created_at DESC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM changelog WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Changelog;
