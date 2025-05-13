const db = require('../config/db');

class Performance {
  // Гүйцэтгэлийн үнэлгээ үүсгэх
  static async create(performanceData) {
    try {
      const { 
        user_id, 
        reviewer_id, 
        review_period, 
        rating, 
        strengths, 
        areas_to_improve, 
        goals, 
        comments 
      } = performanceData;
      
      const [result] = await db.query(
        `INSERT INTO performance_reviews 
        (user_id, reviewer_id, review_period, rating, strengths, areas_to_improve, goals, comments, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, reviewer_id, review_period, rating, strengths, areas_to_improve, goals, comments, 'draft']
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // ID-гаар гүйцэтгэлийн үнэлгээ авах
  static async getById(id) {
    try {
      const [rows] = await db.query(
        `SELECT pr.*, 
          u.name as user_name, u.email as user_email, u.position as user_position, u.department as user_department,
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

  // Хэрэглэгчийн ID-гаар гүйцэтгэлийн үнэлгээнүүдийг авах
  static async getByUserId(userId) {
    try {
      const [rows] = await db.query(
        `SELECT pr.*, 
          r.name as reviewer_name, r.email as reviewer_email
         FROM performance_reviews pr
         JOIN users r ON pr.reviewer_id = r.id
         WHERE pr.user_id = ?
         ORDER BY pr.created_at DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Үнэлгээ өгсөн хүний ID-гаар гүйцэтгэлийн үнэлгээнүүдийг авах
  static async getByReviewerId(reviewerId) {
    try {
      const [rows] = await db.query(
        `SELECT pr.*, 
          u.name as user_name, u.email as user_email, u.position as user_position, u.department as user_department
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

  // Бүх гүйцэтгэлийн үнэлгээнүүдийг авах
  static async getAll() {
    try {
      const [rows] = await db.query(
        `SELECT pr.*, 
          u.name as user_name, u.email as user_email, u.position as user_position, u.department as user_department,
          r.name as reviewer_name, r.email as reviewer_email
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

  // Гүйцэтгэлийн үнэлгээг шинэчлэх
  static async update(id, performanceData) {
    try {
      const { 
        rating, 
        strengths, 
        areas_to_improve, 
        goals, 
        comments, 
        status 
      } = performanceData;
      
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

  // Гүйцэтгэлийн үнэлгээг хүлээн зөвшөөрөх
  static async acknowledge(id, userId) {
    try {
      const [result] = await db.query(
        `UPDATE performance_reviews 
         SET status = 'acknowledged'
         WHERE id = ? AND user_id = ?`,
        [id, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Гүйцэтгэлийн үнэлгээг устгах
  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM performance_reviews WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Хэрэглэгчийн ID ба жилээр гүйцэтгэлийн үнэлгээнүүдийг авах
  static async getByUserIdAndYear(userId, year) {
    try {
      const [rows] = await db.query(
        `SELECT pr.*, 
          r.name as reviewer_name, r.email as reviewer_email
         FROM performance_reviews pr
         JOIN users r ON pr.reviewer_id = r.id
         WHERE pr.user_id = ? AND YEAR(pr.created_at) = ?
         ORDER BY pr.created_at DESC`,
        [userId, year]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Performance;
