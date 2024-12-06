import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const result = {
      type: 'postgres',
      host: this.configService.get<string>('POSTGRES_HOST'),
      port: +this.configService.get<number>('POSTGRES_PORT'),
      username: this.configService.get<string>('POSTGRES_USERNAME'),
      password: this.configService.get<string>('POSTGRES_PASSWORD'),
      database: this.configService.get<string>('POSTGRES_DATABASE'),
      entities:
        this.configService.get('NODE_ENV') === 'test'
          ? ['src/**/**/*.entity.ts']
          : ['dist/**/**/*.entity.{ts,js}'],
      schema: this.configService.get<string>('POSTGRES_SCHEMA') ?? null,
      synchronize: true,
      timezone: '+09:00',
    } as const;

    return result;
  }
}
