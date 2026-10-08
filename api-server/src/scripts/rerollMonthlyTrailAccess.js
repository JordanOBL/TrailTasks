import { rerollMonthlyTrailAccess } from '../helpers/trailAccessPolicy.js';

try {
  const summary = await rerollMonthlyTrailAccess();
  console.log('Monthly trail access rerolled:', summary);
  process.exit(0);
} catch (error) {
  console.error('Failed to reroll monthly trail access:', error);
  process.exit(1);
}
