import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from "./pipes/validation.pipe";
import { runInCluster } from './utils/runInCluster';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
                                                    //АДРЕСА СЕРВЕРОВ ДЛЯ ПРОДА
    origin: process.env.NODE_ENV === 'production' ? ['']                          : 'http://localhost:3000',
    credentials: true
  });
  await app.listen(3000);
}
runInCluster(bootstrap);
