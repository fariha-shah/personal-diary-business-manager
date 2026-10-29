/**
 * utils/operations.js
 * Pure calculation helpers — no React, no state. Easy to unit-test later
 * even without a test framework set up yet.
 */
export function performOperation(a, operator, b) {
  switch (operator) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      return b === 0 ? NaN : a / b;
    default:
      return b;
  }
}

/**
 * Rounds away floating-point artifacts (0.1 + 0.2 = 0.30000000000000004)
 * and returns a clean display string.
 */
export function formatNumber(num) {
  if (!isFinite(num)) return 'Error';
  const rounded = Math.round((num + Number.EPSILON) * 1e10) / 1e10;
  return rounded.toString();
}
