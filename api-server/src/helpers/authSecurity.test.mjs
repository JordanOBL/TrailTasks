import assert from 'node:assert/strict';
import test from 'node:test';

import {
  hashPassword,
  isHashedPassword,
  prepareUserRowsForStorage,
  redactUserForClient,
  verifyPassword,
} from './authSecurity.mjs';

test('hashPassword stores a non-plaintext verifiable password hash', () => {
  const hash = hashPassword('correct horse battery staple');

  assert.notEqual(hash, 'correct horse battery staple');
  assert.equal(isHashedPassword(hash), true);
  assert.equal(verifyPassword('correct horse battery staple', hash), true);
  assert.equal(verifyPassword('wrong password', hash), false);
});

test('verifyPassword supports legacy plaintext rows during the dev migration window', () => {
  assert.equal(verifyPassword('dev-password', 'dev-password'), true);
  assert.equal(verifyPassword('wrong', 'dev-password'), false);
});

test('prepareUserRowsForStorage hashes plaintext user passwords without rehashing existing hashes', () => {
  const alreadyHashed = hashPassword('already-secret');
  const [newUser, existingUser] = prepareUserRowsForStorage([
    { id: 'new-user', password: 'new-secret', email: 'new@example.com' },
    { id: 'existing-user', password: alreadyHashed, email: 'existing@example.com' },
  ]);

  assert.equal(verifyPassword('new-secret', newUser.password), true);
  assert.notEqual(newUser.password, 'new-secret');
  assert.equal(existingUser.password, alreadyHashed);
});

test('prepareUserRowsForStorage omits redacted blank passwords so sync cannot clear stored hashes', () => {
  const [existingUserUpdate] = prepareUserRowsForStorage([
    {
      id: 'existing-user',
      email: 'existing@example.com',
      username: 'existing',
      password: '',
    },
  ]);

  assert.deepEqual(existingUserUpdate, {
    id: 'existing-user',
    email: 'existing@example.com',
    username: 'existing',
  });
});

test('prepareUserRowsForStorage omits stale account summary fields from account writes', () => {
  const [existingUserUpdate] = prepareUserRowsForStorage([
    {
      id: 'existing-user',
      email: 'existing@example.com',
      username: 'existing',
      total_miles: '999.00',
      trail_tokens: 12,
    },
  ]);

  assert.deepEqual(existingUserUpdate, {
    id: 'existing-user',
    email: 'existing@example.com',
    username: 'existing',
  });
});

test('redactUserForClient removes password fields from Sequelize-like user payloads', () => {
  const safeUser = redactUserForClient({
    toJSON: () => ({
      id: 'user-1',
      email: 'user@example.com',
      password: hashPassword('secret'),
      username: 'user',
    }),
  });

  assert.deepEqual(safeUser, {
    id: 'user-1',
    email: 'user@example.com',
    username: 'user',
  });
});
