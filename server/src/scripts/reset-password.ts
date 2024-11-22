import { AppDataSource } from '../config/database.js';
import { User } from '../models/User.js';
import * as bcrypt from 'bcrypt';

async function resetPassword() {
  try {
    await AppDataSource.initialize();
    const userRepository = AppDataSource.getRepository(User);

    const email = 'akumm7490@gmail.com';
    const password = 'Password123!';

    const user = await userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'name'],
    });

    if (!user) {
      console.log('User not found');
      return;
    }

    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    user.password = hashedPassword;
    await userRepository.save(user);

    console.log('Password updated successfully');

    // Verify the password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password verification:', isMatch);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

resetPassword();
