const { AppDataSource } = require('../config/database.js');
const { User } = require('../models/User.js');
const bcrypt = require('bcrypt');

async function checkUser() {
  try {
    await AppDataSource.initialize();
    const userRepository = AppDataSource.getRepository(User);
    
    const email = 'akumm7490@gmail.com';
    const password = 'Password123!';
    
    const user = await userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'name']
    });

    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User details:', {
        id: user.id,
        email: user.email,
        name: user.name,
        passwordHash: user.password
      });
      
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match:', isMatch);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

checkUser();
