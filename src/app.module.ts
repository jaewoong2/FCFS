import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { awsConfig } from './core/config/aws.config';
import { authConfig } from './core/config/auth.config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ServiceExceptionToHttpExceptionFilter } from './core/filters/http-exception.filter';
import { ResponseInterceptor } from './core/interceptors/response.interceptor';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './core/config/typeorm.config';
import { EventModule } from './event/event.module';
import { GifticonRequestLogModule } from './gifticon-request-log/gifticon-request-log.module';
import { GifticonModule } from './gifticon/gifticon.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'local'
          ? '.env.local'
          : process.env.NODE_ENV === 'test'
            ? '.env.test'
            : '.env',
      load: [awsConfig, authConfig],
    }),
    AuthModule,
    UsersModule,
    GifticonModule,
    EventModule,
    GifticonRequestLogModule,
    ImagesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: ServiceExceptionToHttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
  exports: [AppModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
