import {
  ArgumentsHost,
  Body,
  Controller,
  Get,
  INestApplication,
  Logger,
  Post,
} from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  MessagePattern,
  MicroserviceOptions,
  Transport,
} from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import axios from 'axios';
import { Server } from 'node:http';
import { AddressInfo, createServer } from 'node:net';
import { firstValueFrom } from 'rxjs';
import { createZodDto, ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';
import {
  BulkDomainException,
  DomainException,
  HttpStatus,
  IDomainError,
} from '@snaptix/common';
import { COMMON_ERRORS } from '@snaptix/contracts';
import { MicroserviceExceptionFilter } from './microservice.exception-filter';

const SUBSCRIPTION_NOT_FOUND: IDomainError = {
  code: 'SUBSCRIPTION_NOT_FOUND',
  message: 'Subscription not found',
  httpCode: HttpStatus.NOT_FOUND,
  field: null,
};

class AmountDto extends createZodDto(z.object({ amount: z.number() })) {}

@Controller('test')
class TestController {
  @Get('domain')
  domain() {
    throw new DomainException(SUBSCRIPTION_NOT_FOUND);
  }

  @Get('bulk')
  bulk() {
    throw new BulkDomainException([
      { itemId: 'subscription-1', error: SUBSCRIPTION_NOT_FOUND },
    ]);
  }

  @Get('upstream-rejection')
  rethrowUpstreamRejection() {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- ClientProxy rejects with a plain object
    throw SUBSCRIPTION_NOT_FOUND;
  }

  @Get('unknown-error')
  unknownError() {
    throw new Error('Connection terminated unexpectedly');
  }

  @Post('validation')
  validation(@Body() body: AmountDto) {
    return body;
  }

  @MessagePattern('test.domain')
  rpcDomain() {
    throw new DomainException(SUBSCRIPTION_NOT_FOUND);
  }

  @MessagePattern('test.upstream-rejection')
  rpcRethrowUpstreamRejection() {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- ClientProxy rejects with a plain object
    throw SUBSCRIPTION_NOT_FOUND;
  }

  @MessagePattern('test.unknown-error')
  rpcUnknownError() {
    throw new Error('Connection terminated unexpectedly');
  }
}

function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

describe('MicroserviceExceptionFilter', () => {
  let app: INestApplication;
  let client: ClientProxy;
  let baseUrl: string;

  beforeAll(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    const moduleRef = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();

    app = moduleRef.createNestApplication({ logger: false });
    app.useGlobalFilters(new MicroserviceExceptionFilter());
    app.useGlobalPipes(new ZodValidationPipe());

    const tcpPort = await getFreePort();
    app.connectMicroservice<MicroserviceOptions>(
      {
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: tcpPort },
      },
      { inheritAppConfig: true },
    );
    await app.startAllMicroservices();
    await app.listen(0, '127.0.0.1');

    const { port } = (app.getHttpServer() as Server).address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}/test`;
    client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: { host: '127.0.0.1', port: tcpPort },
    });
  });

  afterAll(async () => {
    await client.close();
    await app.close();
    jest.restoreAllMocks();
  });

  const get = (path: string) =>
    axios.get(`${baseUrl}/${path}`, { validateStatus: () => true });

  describe('HTTP', () => {
    it('should respond to DomainException with httpCode status and payload body', async () => {
      const response = await get('domain');

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.data).toEqual(SUBSCRIPTION_NOT_FOUND);
    });

    it('should respond to BulkDomainException with 409 status', async () => {
      const response = await get('bulk');

      expect(response.status).toBe(HttpStatus.CONFLICT);
      expect(response.data).toEqual({
        isBulk: true,
        errors: [{ itemId: 'subscription-1', error: SUBSCRIPTION_NOT_FOUND }],
      });
    });

    it('should pass through domain error received from another service', async () => {
      const response = await get('upstream-rejection');

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.data).toEqual(SUBSCRIPTION_NOT_FOUND);
    });

    it('should convert unknown error to INTERNAL_ERROR', async () => {
      const response = await get('unknown-error');

      expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(response.data).toEqual(COMMON_ERRORS.INTERNAL_ERROR);
    });

    it('should convert validation error to VALIDATION_ERROR', async () => {
      const response = await axios.post(
        `${baseUrl}/validation`,
        { amount: 'one hundred' },
        { validateStatus: () => true },
      );

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.data).toEqual(COMMON_ERRORS.VALIDATION_ERROR);
    });

    it('should keep HttpException status for unknown route', async () => {
      const response = await get('unknown-route');

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.data).toEqual({
        code: 'NOT_FOUND',
        message: 'Cannot GET /test/unknown-route',
        httpCode: HttpStatus.NOT_FOUND,
        field: null,
      });
    });
  });

  describe('TCP', () => {
    it('should reject ClientProxy call with DomainException payload', async () => {
      await expect(
        firstValueFrom(client.send('test.domain', {})),
      ).rejects.toEqual(SUBSCRIPTION_NOT_FOUND);
    });

    it('should pass through domain error received from another service', async () => {
      await expect(
        firstValueFrom(client.send('test.upstream-rejection', {})),
      ).rejects.toEqual(SUBSCRIPTION_NOT_FOUND);
    });

    it('should convert unknown error to INTERNAL_ERROR', async () => {
      await expect(
        firstValueFrom(client.send('test.unknown-error', {})),
      ).rejects.toEqual(COMMON_ERRORS.INTERNAL_ERROR);
    });
  });

  describe('RabbitMQ', () => {
    it('should rethrow original exception so golevelup nacks the message', () => {
      const exception = new DomainException(SUBSCRIPTION_NOT_FOUND);
      const host = { getType: () => 'rmq' } as unknown as ArgumentsHost;

      let thrown: unknown;
      try {
        new MicroserviceExceptionFilter().catch(exception, host);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBe(exception);
    });
  });
});
