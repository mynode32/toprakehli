import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const derive = promisify(scrypt);
export async function passwordHash(password) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 256) throw new Error('Parola 12–256 karakter olmalıdır.');
  const salt = randomBytes(16).toString('hex');
  return { salt, hash: (await derive(password, salt, 64)).toString('hex') };
}
export async function passwordMatches(password, saved) {
  if (typeof password !== 'string' || password.length > 256 || !/^[a-f0-9]{32}$/.test(saved?.salt) || !/^[a-f0-9]{128}$/.test(saved?.hash)) return false;
  return timingSafeEqual(await derive(password, saved.salt, 64), Buffer.from(saved.hash, 'hex'));
}
