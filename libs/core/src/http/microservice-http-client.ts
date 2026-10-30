import axios, { AxiosInstance, CreateAxiosDefaults, isAxiosError } from 'axios';
import { isDomainErrorPayload, toDomainException } from '@snaptix/common';

/**
 * axios client for service-to-service HTTP calls. Turns an error in the
 * DomainErrorPayload format back into DomainException/BulkDomainException,
 * so it reaches the exception filter the same way as one thrown locally.
 */
export function createMicroserviceHttpClient(
  config?: CreateAxiosDefaults,
): AxiosInstance {
  const client = axios.create(config);

  client.interceptors.response.use(undefined, (error: unknown) => {
    const data: unknown = isAxiosError(error)
      ? error.response?.data
      : undefined;

    if (isDomainErrorPayload(data)) {
      throw toDomainException(data);
    }

    throw error;
  });

  return client;
}
