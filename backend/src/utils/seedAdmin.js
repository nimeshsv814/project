const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { connectDB } = require('../config/db');

async function seedAdmin() {
  await connectDB();

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@aideploy.local';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin user already exists');
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    name: 'Platform Admin',
    email,
    passwordHash,
    role: 'Admin'
  });

  console.log(`Admin seeded: ${email}`);
  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error('Failed to seed admin user', error);
  process.exit(1);
});
