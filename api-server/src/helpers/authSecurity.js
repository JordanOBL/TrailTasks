import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const HASH_ALGORITHM = 'scrypt';
const HASH_KEY_LENGTH = 64;
const SALT_BYTES = 16;

export function isHashedPassword(password) {
  return typeof password === 'string' && password.startsWith(`${HASH_ALGORITHM}$`);
}

export function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password is required');
  }

  if (isHashedPassword(password)) {
    return password;
  }

  const salt = randomBytes(SALT_BYTES).toString('hex');
  const hash = scryptSync(password, salt, HASH_KEY_LENGTH).toString('hex');
  return `${HASH_ALGORITHM}$${salt}$${hash}`;
}

export function verifyPassword(candidatePassword, storedPassword) {
  if (!candidatePassword || !storedPassword) {
    return false;
  }

  if (!isHashedPassword(storedPassword)) {
    return candidatePassword === storedPassword;
  }

  const [, salt, storedHash] = storedPassword.split('$');
  if (!salt || !storedHash) {
    return false;
  }

  const candidateHash = scryptSync(candidatePassword, salt, HASH_KEY_LENGTH);
  const storedHashBuffer = Buffer.from(storedHash, 'hex');

  if (candidateHash.length !== storedHashBuffer.length) {
    return false;
  }

  return timingSafeEqual(candidateHash, storedHashBuffer);
}

export function prepareUserRowsForStorage(rows = []) {
  return rows.map(row => {
    if (!row) {
      return row;
    }

    const { total_miles, trail_tokens, ...rowWithoutStaleFields } = row;

    if (!Object.prototype.hasOwnProperty.call(rowWithoutStaleFields, 'password')) {
      return rowWithoutStaleFields;
    }

    if (!rowWithoutStaleFields.password) {
      const { password, password_hash, ...rowWithoutBlankPassword } = rowWithoutStaleFields;
      return rowWithoutBlankPassword;
    }

    return {
      ...rowWithoutStaleFields,
      password: hashPassword(rowWithoutStaleFields.password),
    };
  });
}

export function redactUserForClient(user) {
  if (!user) {
    return user;
  }

  const userData = typeof user.toJSON === 'function' ? user.toJSON() : {...user};
  delete userData.password;
  delete userData.password_hash;
  return userData;
}

export function redactUsersForClient(users = []) {
  return users.map(user => redactUserForClient(user));
}
