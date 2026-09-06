import bcrypt from 'bcryptjs';

class SeedAdminUser {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash('password', 10);

    await queryInterface.bulkInsert('users', [
      {
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: passwordHash,
        role: 'admin',
        active: true,
        last_login: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      }
    ], {});
  }

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      email: 'admin@gmail.com'
    }, {});
  }
}

const seedAdminUser = new SeedAdminUser();
export default seedAdminUser;
