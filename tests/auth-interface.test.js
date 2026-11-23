import assert from 'node:assert/strict';
import { LocalAuth } from '../src/backend/auth/local/local-auth.js';
import { AuthInterface } from '../src/backend/auth/auth-interface.js';

console.log('Testing Authentication Interface & Role Checks (Phase 7 & 14)...');

const ownerEmail = 'deepak.owner@example.com';
const auth = new LocalAuth(ownerEmail);
assert.ok(auth instanceof AuthInterface);

// 1. Initial anonymous visitor state
assert.equal(auth.isAuthenticated(), false);
assert.equal(auth.isOwner(), false);
assert.equal(auth.getCurrentUser(), null);

// 2. Listener triggers on state changes
let listenerCalled = false;
let lastState = null;
const unsubscribe = auth.onAuthStateChange(state => {
  listenerCalled = true;
  lastState = state;
});
assert.equal(listenerCalled, true);
assert.equal(lastState.isAuthenticated, false);

// 3. Different authenticated user (not owner) fails authentication
await assert.rejects(async () => {
  await auth.signIn('stranger@example.com', 'password');
}, /Invalid email or password/);

// 4. Owner sign-in succeeds
listenerCalled = false;
const session = await auth.signIn(ownerEmail, 'correct-password');
assert.equal(session.user.email, ownerEmail);
assert.equal(auth.isAuthenticated(), true);
assert.equal(auth.isOwner(), true);
assert.equal(listenerCalled, true);
assert.equal(lastState.isOwner, true);

// 5. Owner sign-out clears permissions
listenerCalled = false;
await auth.signOut();
assert.equal(auth.isAuthenticated(), false);
assert.equal(auth.isOwner(), false);
assert.equal(auth.getCurrentUser(), null);
assert.equal(listenerCalled, true);
assert.equal(lastState.isOwner, false);

unsubscribe();

console.log('✓ Authentication & Role Check tests passed.');
