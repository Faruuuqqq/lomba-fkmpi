import { SetMetadata } from '@nestjs/common';

export const RECAPTCHA_KEY = 'requireRecaptcha';

/**
 * Decorator to mark endpoints that require reCAPTCHA verification
 * 
 * @param options Configuration options for reCAPTCHA
 * 
 * Usage:
 * ```typescript
 * @Post('login')
 * @RequireRecaptcha()
 * @HttpCode(HttpStatus.OK)
 * async login(@Body() dto: LoginDto) {
 *   return this.authService.login(dto);
 * }
 * ```
 * 
 * With custom action:
 * ```typescript
 * @Post('reset-password')
 * @RequireRecaptcha()
 * async resetPassword(@Body() dto: ResetPasswordDto) {
 *   return this.authService.resetPassword(dto);
 * }
 * ```
 */
export const RequireRecaptcha = (options?: { 
  action?: string; 
  score?: number;
  threshold?: number;
}) => SetMetadata(RECAPTCHA_KEY, true);