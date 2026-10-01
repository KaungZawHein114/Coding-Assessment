// Small helpers to check form input. Each returns { value, error }.
// Small validation helpers. Each returns { value, error? }.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const str = (v) => (typeof v === 'string' ? v.trim() : '');

function text(raw, label, { min = 0, max = 255, required = true } = {}) {
  const value = str(raw);
  if (!value && required) return { value, error: `${label} is required.` };
  if (value && value.length < min) return { value, error: `${label} must be at least ${min} characters.` };
  if (value.length > max) return { value, error: `${label} must be at most ${max} characters.` };
  return { value };
}

function email(raw) {
  const value = str(raw).toLowerCase();
  if (!value) return { value, error: 'Email is required.' };
  if (value.length > 254 || !EMAIL_RE.test(value)) return { value, error: 'Enter a valid email address.' };
  return { value };
}

function positiveInt(raw, label, { max = 100000 } = {}) {
  const s = str(raw);
  if (!/^\d+$/.test(s)) return { value: s, error: `${label} must be a whole number.` };
  const n = Number(s);
  if (n < 1) return { value: s, error: `${label} must be at least 1.` };
  if (n > max) return { value: s, error: `${label} must be at most ${max}.` };
  return { value: n };
}

// Numeric route id -> integer or null.
function id(raw) {
  return /^\d{1,12}$/.test(String(raw)) ? Number(raw) : null;
}

// Collects { field: {value, error} } into { values, errors, ok }.
function collect(fields) {
  const values = {};
  const errors = {};
  for (const [k, r] of Object.entries(fields)) {
    values[k] = r.value;
    if (r.error) errors[k] = r.error;
  }
  return { values, errors, ok: Object.keys(errors).length === 0 };
}

module.exports = { text, email, positiveInt, id, collect, str };
