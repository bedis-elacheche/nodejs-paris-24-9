import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { Config } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<Config, true>);

  await app.listen(configService.get('PORT'));

  console.log(`Application running at ${await app.getUrl()}`);
}
bootstrap();
