import { FILES_PATTERNS } from '@snaptix/contracts/constants/patterns/files/files.patterns';

export const FILES_MICROSERVICE_PATTERNS = {
  FILES: { ...FILES_PATTERNS },
} as const;
