import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

export interface Profile {
  id: string;
  slug: string;
  store_name: string;
  whatsapp: string | null;
  bio: string | null;
  plan: 'free' | 'premium';
  created_at: string;
  updated_at: string;
}

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async findByUserId(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase.admin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      this.logger.error(`findByUserId error: ${error.message}`);
      throw new BadRequestException(error.message);
    }
    return data as Profile | null;
  }

  async findBySlug(slug: string): Promise<Profile | null> {
    const { data, error } = await this.supabase.admin
      .from('profiles')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      this.logger.error(`findBySlug error: ${error.message}`);
      throw new BadRequestException(error.message);
    }
    return data as Profile | null;
  }

  async upsert(
    userId: string,
    userEmail: string | undefined,
    dto: UpdateProfileDto,
  ): Promise<Profile> {
    if (dto.slug) {
      const existing = await this.findBySlug(dto.slug);
      if (existing && existing.id !== userId) {
        throw new ConflictException('slug já está em uso');
      }
    }

    const existing = await this.findByUserId(userId);

    // SANITIZAÇÃO DO WHATSAPP — Defesa em profundidade
    // O DTO já sanitiza inputs novos, mas dados legados no DB podem ter formatação.
    let safeWhatsapp = dto.whatsapp ?? existing?.whatsapp ?? null;
    if (safeWhatsapp) {
      safeWhatsapp = safeWhatsapp.replace(/\D/g, '');
      // Se o lojista esqueceu o DDI do Brasil (55), prefixamos automaticamente
      if (safeWhatsapp.length === 10 || safeWhatsapp.length === 11) {
        safeWhatsapp = `55${safeWhatsapp}`;
      }
    }

    const payload = {
      id: userId,
      slug: dto.slug ?? existing?.slug ?? this.fallbackSlug(userId, userEmail),
      store_name: dto.store_name ?? existing?.store_name ?? 'Minha Loja',
      whatsapp: safeWhatsapp,
      bio: dto.bio ?? existing?.bio ?? null,
    };

    const { data, error } = await this.supabase.admin
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) {
      this.logger.error(`upsert error: ${error.message}`);
      if (error.code === '23505') {
        throw new ConflictException('slug já está em uso');
      }
      throw new BadRequestException(error.message);
    }
    return data as Profile;
  }

  async requireByUserId(userId: string): Promise<Profile> {
    const profile = await this.findByUserId(userId);
    if (!profile) throw new NotFoundException('Perfil não encontrado');
    return profile;
  }

  private fallbackSlug(userId: string, email?: string): string {
    const base = email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9-]/g, '-') ?? 'loja';
    return `${base}-${userId.slice(0, 6)}`;
  }
}
