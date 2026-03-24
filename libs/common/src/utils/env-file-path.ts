import { join } from 'path';

// При использовании process.cwd() получаем такой путь:
// D:\projects\snaptix-backend
// При использовании __dirname:
// D:\projects\snaptix-backend\dist\apps\gateway
// ConfigModule должен получать путь к .env с корня проекта, а не от скомпилированного dist приложения
// Поэтому использование process.cwd() предпочтительней для корректной работы
const ROOT_DIR = process.cwd();

export function envFilePath(pathToEnvFiles: string): string[] {
  return [
    join(ROOT_DIR, pathToEnvFiles, `.env.${process.env.NODE_ENV}.local`),
    join(ROOT_DIR, pathToEnvFiles, `.env.${process.env.NODE_ENV}`),
    join(ROOT_DIR, pathToEnvFiles, '.env.production'),
  ];
}
