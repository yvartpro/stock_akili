import bcrypt from 'bcryptjs';

const DEMO_USERS = [
  {
    name: 'Christian Kabamba',
    email: 'admin@aps.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    name: 'Grace Tshilombo',
    email: 'gestionnaire@aps.com',
    password: 'gestionnaire123',
    role: 'gestionnaire',
  },
];

class SeedAdminUser {
  async up(queryInterface) {
    const { sequelize } = queryInterface;
    const now = new Date();

    for (const user of DEMO_USERS) {
      const [existing] = await sequelize.query(
        'SELECT id FROM users WHERE email = :email LIMIT 1',
        { replacements: { email: user.email } }
      );

      if (existing.length > 0) {
        continue;
      }

      const passwordHash = await bcrypt.hash(user.password, 10);

      await queryInterface.bulkInsert('users', [
        {
          name: user.name,
          email: user.email,
          password: passwordHash,
          role: user.role,
          active: true,
          last_login: null,
          created_at: now,
          updated_at: now,
          deleted_at: null,
        },
      ]);
    }
  }

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      email: DEMO_USERS.map((user) => user.email),
    });
  }
}

const seedAdminUser = new SeedAdminUser();
export default seedAdminUser;
