import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './AuthService';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: { email: string; password: string }) {
    try {
      const userResult = await this.authService.validateUser(loginDto.email, loginDto.password);
      if (userResult.isFail()) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return this.authService.generateUserToken(userResult.getValue());
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
