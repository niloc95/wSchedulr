export default class UserController {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async getUsers() {
    return await this.userModel.findAll();
  }

  async getUser(id) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async createUser(userData) {
    return await this.userModel.create(userData);
  }
}