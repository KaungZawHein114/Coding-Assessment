// The one place that defines order statuses and which status can follow which.
// Single source of truth for statuses and allowed transitions.
const STATUSES = ['Pending', 'Processing', 'Completed', 'Cancelled'];

// Key = current status, value = statuses it is allowed to change to.
const TRANSITIONS = {
  Pending: ['Processing', 'Cancelled'],
  Processing: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};

const nextStatuses = (status) => TRANSITIONS[status] || [];
const canTransition = (from, to) => nextStatuses(from).includes(to);
const isFinal = (status) => nextStatuses(status).length === 0;
const isValidStatus = (s) => STATUSES.includes(s);

module.exports = { STATUSES, TRANSITIONS, nextStatuses, canTransition, isFinal, isValidStatus };
