import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { UserService } from '../../application/services/UserService';
import { AuthGuard } from '@nestjs/passport';
import { Result } from '@coworker/shared-kernel';
import { IAuthToken } from '@coworker/shared-kernel';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(
    @Body() dto: { email: string; password: string; firstName: string; lastName: string }
  ): Promise<Result<IAuthToken>> {
    return this.userService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: { email: string; password: string }): Promise<Result<IAuthToken>> {
    return this.userService.login(dto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This route will redirect to Google OAuth
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any): Promise<Result<IAuthToken>> {
    const { user } = req;
    return this.userService.socialLogin({
      provider: 'google',
      profileId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // This route will redirect to GitHub OAuth
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req: any): Promise<Result<IAuthToken>> {
    const { user } = req;
    return this.userService.socialLogin({
      provider: 'github',
      profileId: user.id,
      email: user.email,
      firstName: user.name?.split(' ')[0] || '',
      lastName: user.name?.split(' ')[1] || '',
    });
  }

  @Post('reset-password')
  @UseGuards(AuthGuard('jwt'))
  async resetPassword(
    @Req() req: any,
    @Body() dto: { newPassword: string }
  ): Promise<Result<void>> {
    return this.userService.resetPassword(req.user.id, dto.newPassword);
  }
}
