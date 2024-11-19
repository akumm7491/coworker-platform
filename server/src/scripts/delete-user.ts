import { AppDataSource } from '../config/database.js';
import { User } from '../models/User.js';

async function deleteUser() {
  try {
    await AppDataSource.initialize();
    const userRepository = AppDataSource.getRepository(User);
    
    const email = 'akumm7490@gmail.com';
    
    const result = await userRepository.delete({ email });
    console.log('Delete result:', result);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

deleteUser();
