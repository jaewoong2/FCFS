import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ServiceExceptionToHttpExceptionFilter } from './core/filters/http-exception.filter';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { Handler } from 'aws-lambda';
import { ReplaySubject, firstValueFrom } from 'rxjs';
import { bootstrapLambda } from './lambda';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const serverSubject = new ReplaySubject<Handler>();

function attachPipes(app: INestApplication) {
  app.use(cookieParser());

  // 전역 범위 필터 설정
  app.useGlobalFilters(new ServiceExceptionToHttpExceptionFilter());

  // 전역 범위 인터셉터 설정
  app.useGlobalInterceptors(new LoggingInterceptor());

  // 전역 범위 파이프 설정 (유효성 검사 파이프)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에서 정의되지 않은 속성을 제거
      forbidNonWhitelisted: true, // 정의되지 않은 속성이 포함된 경우 요청을 거부
      transform: true, // 요청에서 받은 데이터를 DTO 인스턴스로 변환
      disableErrorMessages: false, // 프로덕션 환경에서는 true로 설정하여 에러 메시지 노출 방지
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://bamtoly.com',
      'https://www.bamtoly.com',
    ],
    credentials: true,
    methods: ['*'],
    exposedHeaders: ['*'], // * 사용할 헤더 추가.
    allowedHeaders: ['*'],
  });

  const config = new DocumentBuilder()
    .setTitle('Swagger Example')
    .setDescription('Swagger study API description')
    .setVersion('1.0.0')
    .addTag('swagger')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        name: 'JWT',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Swagger UI에 대한 path를 연결함
  // .setup('swagger ui endpoint', app, swagger_document)
  SwaggerModule.setup('api/swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}

if (process.env.NODE_ENV === 'local') {
  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    attachPipes(app);
    await app.listen(3001);
  }

  bootstrap();
}

bootstrapLambda(attachPipes).then((server) => serverSubject.next(server));

const handler = async (event: any, context: any, callback: any) => {
  const server = await firstValueFrom(serverSubject);
  return server(event, context, callback);
};

module.exports.handler = handler;
