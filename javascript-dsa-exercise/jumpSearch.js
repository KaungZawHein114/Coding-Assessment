// Jump Search: finds a value in a SORTED array (smallest to largest).
//
// Idea: instead of checking every item one by one, jump forward in big steps, then walk back a little to find the exact spot.
//
// Example: find 55 in [0, 1, 3, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610]
//   There are 13 items, so the jump size is about the square root of 13, which is 3.
//   1. Look at the LAST item of each block of 3:  3 -> 21 -> 89.
//      3 is smaller than 55, 21 is smaller than 55, 89 is NOT smaller than 55.
//      So 55 must be inside the block just before 89.
//   2. Check that block one item at a time (34, 55) and we find 55 at index 7.
//
// Returns the index of the value, or -1 if it is not in the array.

function jumpSearch(arr, target) {
  const n = arr.length;

  // An empty array cannot contain anything.
  if (n === 0) {
    return -1;
  }

  // How far to jump each time (the square root of n, rounded down, at least 1).
  const jumpSize = Math.floor(Math.sqrt(n));

  // "start" is the beginning of the block we are looking at.
  // "end" is the position just after the end of that block.
  let start = 0;
  let end = jumpSize;

  // Step 1: keep jumping while the LAST item of the current block is still smaller than the target.
  while (end < n && arr[end - 1] < target) {
    start = end;
    end = end + jumpSize;
  }

  // The last block may stick out past the end of the array, so cut it off.
  if (end > n) {
    end = n;
  }

  // Step 2: check the block one item at a time.
  for (let i = start; i < end; i++) {
    if (arr[i] === target) {
      return i; // found it
    }
    if (arr[i] > target) {
      return -1; // we went past where it should be, so it is not here
    }
  }

  return -1; // not found
}

module.exports = jumpSearch;

// ---- Demo: run this file with "node jumpSearch.js" ----
if (require.main === module) {
  const numbers = [0, 1, 3, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610];

  console.log("Index of 55:", jumpSearch(numbers, 55)); // 7
  console.log("Index of 0 (first item):", jumpSearch(numbers, 0)); // 0
  console.log("Index of 610 (last item):", jumpSearch(numbers, 610)); // 12
  console.log("Index of 4 (not in the array):", jumpSearch(numbers, 4)); // -1
  console.log("Index of 1000 (too big):", jumpSearch(numbers, 1000)); // -1
  console.log("Search in an empty array:", jumpSearch([], 5)); // -1
}
