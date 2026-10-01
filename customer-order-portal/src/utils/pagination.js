// Works out which page of a long list to show.
// Builds pagination info; invalid/out-of-range pages are clamped.
function paginate({ page, total, pageSize }) {
  // Always at least 1 page, even when the list is empty.
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // Fix bad page numbers: "abc" or 0 becomes 1, too big becomes the last page.
  let current = parseInt(page, 10);
  if (!Number.isInteger(current) || current < 1) current = 1;
  if (current > totalPages) current = totalPages;
  return {
    page: current,
    pageSize,
    total,
    totalPages,
    offset: (current - 1) * pageSize,
    hasPrev: current > 1,
    hasNext: current < totalPages,
  };
}

module.exports = { paginate };
