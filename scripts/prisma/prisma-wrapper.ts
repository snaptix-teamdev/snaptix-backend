import { config } from 'dotenv';
import { execSync } from 'child_process';
import * as process from 'node:process';
import { envFilePath } from '../../libs/common/src/index';

const pathToEnvFile = process.argv[2];
const prismaCommand = process.argv[3];
config({
  path: envFilePath(pathToEnvFile),
});
console.log(`
###################################
# Env path: ${pathToEnvFile}
# Start prisma command: ${prismaCommand}
###################################
`);

execSync(prismaCommand, { stdio: 'inherit' });
