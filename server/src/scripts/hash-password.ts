import { AppDataSource } from '../config/database.js';
import { User } from '../models/User.js';
import * as bcrypt from 'bcrypt';

async function hashPassword() {
  try {
    await AppDataSource.initialize();
    const userRepository = AppDataSource.getRepository(User);
    
    const email = 'akumm7490@gmail.com';
    const password = 'Password123!';
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Generated hash:', hashedPassword);
    
    // Update the user's password
    const result = await userRepository
      .createQueryBuilder()
      .update(User)
      .set({ password: hashedPassword })
      .where('email = :email', { email })
      .execute();
      
    console.log('Update result:', result);
    
    // Verify the update
    const user = await userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password']
    });
    
    if (user) {
      console.log('Updated user password hash:', user.password);
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password verification:', isMatch);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

hashPassword();
