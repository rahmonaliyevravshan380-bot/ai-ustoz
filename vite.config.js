import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Path to store user credits on the mock server
const dbPath = path.resolve(process.cwd(), 'credits_db.json');

function readCreditsDb() {
  try {
    if (fs.existsSync(dbPath)) {
      return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading credits db:', e);
  }
  return {};
}

function writeCreditsDb(db) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing credits db:', e);
  }
}

// Vite dev server middleware to serve API requests (/api/auth/register and /api/auth/login)
const mockBackendPlugin = () => ({
  name: 'mock-backend-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // ── API: Register ───────────────────────────────────────────────
      if (req.method === 'POST' && req.url === '/api/auth/register') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            const { name, firstName, lastName, email, school } = data;
            const fullName = name || `${firstName || ''} ${lastName || ''}`.trim() || 'Foydalanuvchi';
            
            const userId = `user_${Date.now()}`;
            const newUser = {
              id: userId,
              name: fullName,
              email: (email || '').trim().toLowerCase(),
              role: 'teacher',
              school: school || '',
              subjects: ['Matematika'],
              createdAt: new Date().toISOString(),
              credits: 100, // Initialize new user with 100 credits
            };

            // Persist the initialized 100 credits in database file
            const db = readCreditsDb();
            db[userId] = 100;
            writeCreditsDb(db);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, user: newUser, token: 'mock-jwt-token-xyz' }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, message: err.message }));
          }
        });
        return;
      }

      // ── API: Login ──────────────────────────────────────────────────
      if (req.method === 'POST' && req.url === '/api/auth/login') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            const { email } = data;
            
            // We simulate a userId based on email or create a new one
            // In case user logs back in, we retrieve existing credits from database
            const normalizedEmail = (email || '').trim().toLowerCase();
            const db = readCreditsDb();
            
            // Find user id by email from existing list or generate one
            let userId = Object.keys(db).find(k => k === normalizedEmail || normalizedEmail.includes(k));
            if (!userId) {
              userId = `user_${normalizedEmail.split('@')[0] || Date.now()}`;
            }

            // Ensure credits exist for this user in db
            if (db[userId] === undefined) {
              db[userId] = 100;
              writeCreditsDb(db);
            }

            const credits = db[userId];

            const user = {
              id: userId,
              name: email ? email.split('@')[0] : 'Ustoz',
              email: normalizedEmail,
              role: 'teacher',
              createdAt: new Date().toISOString(),
              credits,
            };

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, user, token: 'mock-jwt-token-xyz' }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, message: err.message }));
          }
        });
        return;
      }

      // ── API: Deduct Credits ──────────────────────────────────────────
      if (req.method === 'POST' && req.url === '/api/auth/deduct-credits') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            const { userId, amount } = data;

            if (!userId) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, message: 'userId is required' }));
              return;
            }

            const db = readCreditsDb();
            const currentCredits = db[userId] !== undefined ? db[userId] : 100;

            if (currentCredits < amount) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, message: `⚡ Kreditlaringiz tugadi. Davom etish uchun tarifni yangilang.` }));
              return;
            }

            const newCredits = currentCredits - amount;
            db[userId] = newCredits;
            writeCreditsDb(db);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, credits: newCredits }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, message: err.message }));
          }
        });
        return;
      }

      // ── API: Get Credits ─────────────────────────────────────────────
      if (req.method === 'GET' && req.url.startsWith('/api/auth/credits')) {
        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const userId = urlObj.searchParams.get('userId');

          if (!userId) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, message: 'userId is required' }));
            return;
          }

          const db = readCreditsDb();
          const credits = db[userId] !== undefined ? db[userId] : 100;

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, credits }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, message: err.message }));
        }
        return;
      }

      next();
    });
  }
});

export default defineConfig({
  plugins: [react(), mockBackendPlugin()],
})

