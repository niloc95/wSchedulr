export default class AppointmentController {
  constructor(appointmentModel) {
    this.appointmentModel = appointmentModel;
  }

  async getAppointments() {
    return await this.appointmentModel.findAll();
  }

  async getAppointment(id) {
    const appointment = await this.appointmentModel.findById(id);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    return appointment;
  }

  async createAppointment(appointmentData) {
    return await this.appointmentModel.create(appointmentData);
  }
}