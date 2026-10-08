import { applyPermanentTrailAccessPolicy } from '../helpers/trailAccessPolicy.js';

try {
  const summary = await applyPermanentTrailAccessPolicy();
  console.log('Permanent trail access policy applied:', summary);
  process.exit(0);
} catch (error) {
  console.error('Failed to apply permanent trail access policy:', error);
  process.exit(1);
}
