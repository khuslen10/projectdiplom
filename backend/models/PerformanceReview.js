const db = require('../config/db');

class PerformanceReview {
  static async create(reviewData) {
    try {
      const { user_id, reviewer_id, review_period, rating, strengths, areas_to_improve, goals, comments } = reviewData;
      const [result] = await db.query(
        `INSERT INTO performance_reviews 
         (user_id, reviewer_id, review_period, rating, strengths, areas_to_improve, goals, comments) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, reviewer_id, review_period, rating, strengths, areas_to_improve, goals, comments]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.query(
        `SELECT pr.*, 
         u.name as employee_name, u.email as employee_email, u.department as employee_department,
         r.name as reviewer_name, r.email as reviewer_email
         FROM performance_reviews pr
         JOIN users u ON pr.user_id = u.id
         JOIN users r ON pr.reviewer_id = r.id
         WHERE pr.id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getByUserId(userId) {
    try {
      const [rows] = await db.query(
        `SELECT pr.*, u.name as reviewer_name
         FROM performance_reviews pr
         JOIN users u ON pr.reviewer_id = u.id
         WHERE pr.user_id = ?
         ORDER BY pr.created_at DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getByReviewerId(reviewerId) {
    try {
      const [rows] = await db.query(
        `SELECT pr.*, u.name as employee_name, u.email as employee_email, u.department
         FROM performance_reviews pr
         JOIN users u ON pr.user_id = u.id
         WHERE pr.reviewer_id = ?
         ORDER BY pr.created_at DESC`,
        [reviewerId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getAll() {
    try {
      const [rows] = await db.query(
        `SELECT pr.*, 
         u.name as employee_name, u.email as employee_email, u.department,
         r.name as reviewer_name
         FROM performance_reviews pr
         JOIN users u ON pr.user_id = u.id
         JOIN users r ON pr.reviewer_id = r.id
         ORDER BY pr.created_at DESC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, reviewData) {
    try {
      const { rating, strengths, areas_to_improve, goals, comments, status } = reviewData;
      const [result] = await db.query(
        `UPDATE performance_reviews 
         SET rating = ?, strengths = ?, areas_to_improve = ?, goals = ?, comments = ?, status = ?
         WHERE id = ?`,
        [rating, strengths, areas_to_improve, goals, comments, status, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, status) {
    try {
      const [result] = await db.query(
        'UPDATE performance_reviews SET status = ? WHERE id = ?',
        [status, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, reviewerId) {
    try {
      const [result] = await db.query(
        'DELETE FROM performance_reviews WHERE id = ? AND reviewer_id = ? AND status = "draft"',
        [id, reviewerId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PerformanceReview;
