import { Injectable } from '@nestjs/common';
import { Algorithm, hash, verify } from '@node-rs/argon2';

@Injectable()
export class CryptoService {
  async generateHash(password: string): Promise<string> {
    return hash(password, {
      algorithm: Algorithm.Argon2id,
      parallelism: 1,
      memoryCost: 1024 * 20, //20mb
      timeCost: 3,
    });
  }

  async compareHash(password: string, hash: string): Promise<boolean> {
    return verify(hash, password);
  }
}
