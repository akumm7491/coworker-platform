import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { UserService } from '../../application/services/UserService';
import { AuthService } from '../../auth/AuthService';
import { AuthGuard } from '@nestjs/passport';
import { Result } from '@coworker/shared-kernel';
import { IAuthToken } from '@coworker/shared-kernel';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}

  @Post('register')
  async register(
    @Body() dto: { email: string; password: string; firstName: string; lastName: string }
  ): Promise<Result<IAuthToken>> {
    return this.userService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: { email: string; password: string }): Promise<Result<IAuthToken>> {
    return this.authService.login(dto.email, dto.password);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This route will redirect to Google OAuth
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any): Promise<Result<IAuthToken>> {
    const { profile } = req.user;
    const user = await this.userService.findOrCreateSocialUser(profile);
    return this.authService.generateUserToken(user);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {
    // This route will redirect to Facebook OAuth
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthCallback(@Req() req: any): Promise<Result<IAuthToken>> {
    const { profile } = req.user;
    const user = await this.userService.findOrCreateSocialUser(profile);
    return this.authService.generateUserToken(user);
  }

  @Post('reset-password')
  async resetPassword(@Body('email') email: string): Promise<Result<void>> {
    return this.userService.resetPassword(email);
  }
}
