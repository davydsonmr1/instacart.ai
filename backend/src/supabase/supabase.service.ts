import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);

  private _admin!: SupabaseClient;
  private _anon!: SupabaseClient;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const url = this.config.getOrThrow<string>('SUPABASE_URL');
    const serviceKey = this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = this.config.getOrThrow<string>('SUPABASE_ANON_KEY');

    this._admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    this._anon = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    this.logger.log('Supabase clients initialized');
  }

  get admin(): SupabaseClient {
    return this._admin;
  }

  get anon(): SupabaseClient {
    return this._anon;
  }
}
