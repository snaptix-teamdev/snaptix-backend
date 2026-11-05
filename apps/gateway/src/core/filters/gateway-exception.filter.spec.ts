import {
  Controller,
  ExceptionFilter,
  Get,
  Inject,
  INestApplication,
  Type,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import axios, { AxiosInstance } from 'axios';
import { Server } from 'node:http';
import { AddressInfo } from 'node:net';
import {
  BulkDomainException,
  DomainException,
  HttpStatus,
  IDomainError,
} from '@snaptix/common';
import { COMMON_ERRORS } from '@snaptix/contracts';
import {
  createMicroserviceHttpClient,
  MicroserviceExceptionFilter,
} from '@snaptix/core';
import { GatewayExceptionFilter } from './gateway-exception.filter';

const SUBSCRIPTION_NOT_FOUND: IDomainError = {
  code: 'SUBSCRIPTION_NOT_FOUND',
  message: 'Subscription not found',
  httpCode: HttpStatus.NOT_FOUND,
  field: null,
};

const BILLING_HTTP = Symbol('BILLING_HTTP');
const UNREACHABLE_HTTP = Symbol('UNREACHABLE_HTTP');

@Controller('billing')
class BillingHttpServiceController {
  @Get('subscription')
  getSubscription() {
    throw new DomainException(SUBSCRIPTION_NOT_FOUND);
  }

  @Get('bulk')
  bulk() {
    throw new BulkDomainException([
      { itemId: 'subscription-1', error: SUBSCRIPTION_NOT_FOUND },
    ]);
  }
}

@Controller('gateway')
class GatewayTestController {
  constructor(
    @Inject(BILLING_HTTP) private readonly billing: AxiosInstance,
    @Inject(UNREACHABLE_HTTP) private readonly unreachable: AxiosInstance,
  ) {}

  @Get('subscription')
  async getSubscription() {
    await this.billing.get('/billing/subscription');
  }

  @Get('bulk')
  async bulk() {
    await this.billing.get('/billing/bulk');
  }

  @Get('unreachable')
  async callUnreachable() {
    await this.unreachable.get('/billing/subscription');
  }

  @Get('tcp-rejection')
  rethrowTcpRejection() {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- ClientProxy rejects with a plain object
    throw SUBSCRIPTION_NOT_FOUND;
  }
}

async function startApp(
  controller: Type,
  filter?: ExceptionFilter,
  providers: { provide: symbol; useValue: unknown }[] = [],
): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    controllers: [controller],
    providers,
  }).compile();

  const app = moduleRef.createNestApplication({ logger: false });
  if (filter) {
    app.useGlobalFilters(filter);
  }
  await app.listen(0, '127.0.0.1');
  return app;
}

function urlOf(app: INestApplication): string {
  const { port } = (app.getHttpServer() as Server).address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
}

describe('GatewayExceptionFilter — domain errors from services', () => {
  let billing: INestApplication;
  let gateway: INestApplication;

  beforeAll(async () => {
    billing = await startApp(
      BillingHttpServiceController,
      new MicroserviceExceptionFilter(),
    );

    const stoppedService = await startApp(BillingHttpServiceController);
    const unreachableUrl = urlOf(stoppedService);
    await stoppedService.close();

    gateway = await startApp(
      GatewayTestController,
      new GatewayExceptionFilter(),
      [
        {
          provide: BILLING_HTTP,
          useValue: createMicroserviceHttpClient({ baseURL: urlOf(billing) }),
        },
        {
          provide: UNREACHABLE_HTTP,
          useValue: createMicroserviceHttpClient({ baseURL: unreachableUrl }),
        },
      ],
    );
  });

  afterAll(async () => {
    await gateway.close();
    await billing.close();
  });

  const get = (path: string) =>
    axios.get(`${urlOf(gateway)}/gateway/${path}`, {
      validateStatus: () => true,
    });

  const publicError = {
    status: HttpStatus.NOT_FOUND,
    code: 'SUBSCRIPTION_NOT_FOUND',
    field: null,
    message: 'Subscription not found',
  };

  it('should return service DomainException received over HTTP in public format', async () => {
    const response = await get('subscription');

    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(response.data).toEqual({ errors: [publicError] });
  });

  it('should return service BulkDomainException with 409 status', async () => {
    const response = await get('bulk');

    expect(response.status).toBe(HttpStatus.CONFLICT);
    expect(response.data).toEqual({
      errors: [{ ...publicError, meta: { itemId: 'subscription-1' } }],
    });
  });

  it('should return the same error received over TCP without the ERRORS registry', async () => {
    const response = await get('tcp-rejection');

    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(response.data).toEqual({ errors: [publicError] });
  });

  it('should return INTERNAL_ERROR when service is unreachable', async () => {
    const response = await get('unreachable');
    const { code, message, httpCode, field } = COMMON_ERRORS.INTERNAL_ERROR;

    expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(response.data).toEqual({
      errors: [{ status: httpCode, code, field, message }],
    });
  });
});
