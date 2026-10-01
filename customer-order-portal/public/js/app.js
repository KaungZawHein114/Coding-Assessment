// Tiny script: asks "Are you sure?" before forms that have data-confirm, and lets you close messages.
document.addEventListener('submit', function (e) {
  var msg = e.target.getAttribute && e.target.getAttribute('data-confirm');
  if (msg && !window.confirm(msg)) e.preventDefault();
});

document.addEventListener('click', function (e) {
  var btn = e.target.closest && e.target.closest('[data-dismiss]');
  if (btn && btn.parentElement) btn.parentElement.remove();
});
