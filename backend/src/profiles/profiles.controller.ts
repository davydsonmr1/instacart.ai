import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import type { AuthenticatedUser } from '../auth/supabase-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profiles: ProfilesService) {}

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  async me(@CurrentUser() user: AuthenticatedUser) {
    return (await this.profiles.findByUserId(user.id)) ?? { id: user.id, bootstrap: true };
  }

  @Patch('me')
  @HttpCode(200)
  @UseGuards(SupabaseAuthGuard)
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profiles.upsert(user.id, user.email, dto);
  }

  @Get('by-slug/:slug')
  async bySlug(@Param('slug') slug: string) {
    const profile = await this.profiles.findBySlug(slug.toLowerCase());
    if (!profile) throw new NotFoundException('Loja não encontrada');
    return profile;
  }
}
