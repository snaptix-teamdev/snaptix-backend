import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CoreConfig } from '../../config/core.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { cleanupOpenApiDoc } from 'nestjs-zod';

export function swaggerSetup(
  app: NestExpressApplication,
  coreConfig: CoreConfig,
): void {
  if (!coreConfig.isSwaggerEnabled) {
    return;
  }

  const projectName = 'Snaptix-backend';
  const swaggerPath = `/api/v1/swagger`;

  const description = `
  **Environment**: ${coreConfig.env}
  `;

  const config = new DocumentBuilder()
    .setTitle(`${projectName} API`)
    .setDescription(description)
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('refreshToken')
    .addServer('')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(swaggerPath, app, cleanupOpenApiDoc(document), {
    customSiteTitle: projectName,
  });
}
