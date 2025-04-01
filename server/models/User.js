export default class User {
  constructor(connection) {
    this.connection = connection;
  }

  async findAll() {
    const [rows] = await this.connection.query(
      'SELECT id, email, first_name, last_name, created_at FROM users'
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await this.connection.query(
      'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  async create(userData) {
    const { email, password, first_name, last_name } = userData;
    const [result] = await this.connection.query(
      'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)',
      [email, password, first_name, last_name]
    );
    return { id: result.insertId, email, first_name, last_name };
  }
}