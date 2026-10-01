// Queue: "first in, first out" (like a line of people: the first person to join is served first).
//
// Store the items in a plain object, using numbers as keys:
//
//     items = { 0: 'a', 1: 'b', 2: 'c' }      head = 0, tail = 3
//
// - head = the position of the first item (the next one to leave the queue)
// - tail = the position where the next new item will be added

class Queue {
  constructor() {
    this.items = {};
    this.head = 0;
    this.tail = 0;
  }

  // Add a value to the back of the queue.
  enqueue(value) {
    this.items[this.tail] = value;
    this.tail = this.tail + 1;
  }

  // Remove the value at the front and return it.
  // If the queue is empty there is nothing to remove, so return null.
  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    const value = this.items[this.head];
    delete this.items[this.head]; // forget the removed item
    this.head = this.head + 1;
    return value;
  }

  // Look at the value at the front WITHOUT removing it.
  front() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[this.head];
  }

  // The queue is empty when head has caught up with tail.
  isEmpty() {
    return this.head === this.tail;
  }
}

module.exports = Queue;

// ---- Demo: run this file with "node queue.js" ----
if (require.main === module) {
  const queue = new Queue();

  console.log("Is empty at the start?", queue.isEmpty()); // true

  queue.enqueue("Alice");
  queue.enqueue("Bob");
  queue.enqueue("Carol");
  console.log("Front after adding 3 people:", queue.front()); // Alice
  console.log("Is empty now?", queue.isEmpty()); // false

  console.log("Dequeue:", queue.dequeue()); // Alice
  console.log("Dequeue:", queue.dequeue()); // Bob
  console.log("Front now:", queue.front()); // Carol

  console.log("Dequeue:", queue.dequeue()); // Carol
  console.log("Is empty after removing everyone?", queue.isEmpty()); // true
  console.log("Dequeue on an empty queue:", queue.dequeue()); // null
}
