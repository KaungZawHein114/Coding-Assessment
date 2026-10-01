# Requirements and setup

Node.js 20 LTS or newer.

```
npm install
npm run seed     # optional
npm start        # http://localhost:3000
```

To start over with fresh data, stop the server, delete `data/app.db`, then run `npm run seed` again.

# Demo credentials

Admin: `admin@example.com` / `Admin@12345`

The seed adds 25 customers and 40 orders across all statuses; 7 customers have no orders so the delete rule can be shown both ways. It is idempotent. If no admin exists on start, one is created from config defaults and a console message says so.
