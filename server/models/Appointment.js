export default class Appointment {
  constructor(connection) {
    this.connection = connection;
  }

  async findAll() {
    const [rows] = await this.connection.query('SELECT * FROM appointments');
    return rows;
  }

  async findById(id) {
    const [rows] = await this.connection.query(
      'SELECT * FROM appointments WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  async create(appointmentData) {
    const { title, start, end, description, user_id } = appointmentData;
    const [result] = await this.connection.query(
      'INSERT INTO appointments (title, start, end, description, user_id) VALUES (?, ?, ?, ?, ?)',
      [title, start, end, description, user_id]
    );
    return { id: result.insertId, ...appointmentData };
  }
}