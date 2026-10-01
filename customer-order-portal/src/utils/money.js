// Prices are stored as whole cents (e.g. $19.99 = 1999) to avoid decimal rounding bugs.
// Money is stored as integer cents everywhere; only views format it.
// "19.99" -> 1999. Returns null if the text is not a valid price.
function parsePriceToCents(input) {
  const s = String(input ?? '').trim();
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(s)) return null;
  const [whole, frac = ''] = s.split('.');
  return Number(whole) * 100 + Number(frac.padEnd(2, '0'));
}

function centsToInput(cents) {
  return (cents / 100).toFixed(2);
}

// 1999 -> "$19.99" (only used when showing prices on a page).
function formatMoney(cents) {
  return '$' + (Number(cents) / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

module.exports = { parsePriceToCents, centsToInput, formatMoney };
