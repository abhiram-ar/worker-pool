## worker-pool
A simple worker pool implementation in Node.js

### Features

- Promise-based callback system
- Automatic worker crash recovery
- TODO: Implement exponential backoff for worker respawning (to limit how frequently crashed workers can be respawned)

> **Note:** Code must be compiled to JavaScript to run properly.
> Workers must be `.js` files, as Node.js does not natively recognize `.ts` files.
