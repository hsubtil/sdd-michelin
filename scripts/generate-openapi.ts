import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as yaml from 'js-yaml';
import * as fs from 'node:fs';

import { AppModule } from '../src/app.module';

async function generate(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Prompt Versioning API')
    .setDescription('REST API for managing and versioning prompt templates')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync('openapi.yaml', yaml.dump(document, { lineWidth: 120 }), 'utf8');

  await app.close();
}

void generate();
