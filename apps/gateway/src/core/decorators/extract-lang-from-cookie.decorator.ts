import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { Request } from 'express';
import { GeoLang } from '@snaptix/contracts';

const DEFAULT_LANG = GeoLang.EN;

const isLang = (value: unknown): value is GeoLang =>
  typeof value === 'string' &&
  (Object.values(GeoLang) as string[]).includes(value);

export const ExtractLangFromCookie = createParamDecorator(
  (_data: never, ctx: ExecutionContext): GeoLang => {
    const logger = new Logger('ExtractLangFromCookie');

    const request = ctx.switchToHttp().getRequest<Request>();
    const cookies = request.cookies as Record<string, unknown>;

    const lang = cookies?.locale; // cookie - locale

    if (!isLang(lang)) {
      logger.warn(
        `locale cookie is missing or invalid (${String(lang)}), falling back to "${DEFAULT_LANG}"`,
      );

      return DEFAULT_LANG;
    }

    return lang;
  },
);
