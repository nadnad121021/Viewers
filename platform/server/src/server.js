const http = require('http');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const PORT = Number(process.env.PORT || 4010);
const HOST = process.env.HOST || 'localhost';
const SECRET = process.env.DENTAL_AUTH_SECRET || 'dental-dev-secret';
const DEFAULT_USER = process.env.DENTAL_AUTH_USER || 'dental';
const DEFAULT_PASSWORD = process.env.DENTAL_AUTH_PASSWORD || 'dental';
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'viewer-state.json');

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signToken(payload) {
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${signature}`;
}

function verifyToken(token) {
  if (!token || !token.includes('.')) {
    return null;
  }

  const [body, signature] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(body));
  if (payload.exp && Date.now() > payload.exp) {
    return null;
  }

  return payload;
}

async function readJson() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { users: {} };
  }
}

async function writeJson(state) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  });
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function authenticate(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  const payload = verifyToken(token);
  return payload ? { userId: payload.sub, token } : null;
}

async function handleLogin(req, res) {
  const { username, password } = await readBody(req);
  if (username !== DEFAULT_USER || password !== DEFAULT_PASSWORD) {
    return sendJson(res, 401, { error: 'Invalid credentials' });
  }

  const payload = {
    sub: username,
    exp: Date.now() + 1000 * 60 * 60 * 8,
  };

  return sendJson(res, 200, {
    token: signToken(payload),
    expiresAt: payload.exp,
    user: { username },
  });
}

async function handleState(req, res, user) {
  const store = await readJson();
  store.users[user.userId] ||= {};

  if (req.method === 'GET') {
    return sendJson(res, 200, store.users[user.userId].viewerState || {});
  }

  if (req.method === 'PUT') {
    const body = await readBody(req);
    store.users[user.userId].viewerState = {
      ...body,
      updatedAt: new Date().toISOString(),
    };
    await writeJson(store);
    return sendJson(res, 200, store.users[user.userId].viewerState);
  }

  return sendJson(res, 405, { error: 'Method not allowed' });
}

async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  if (req.url === '/health') {
    return sendJson(res, 200, { ok: true });
  }

  if (req.url === '/auth/login' && req.method === 'POST') {
    return handleLogin(req, res);
  }

  if (req.url === '/auth/me' && req.method === 'GET') {
    const user = authenticate(req);
    if (!user) {
      return sendJson(res, 401, { error: 'Unauthorized' });
    }
    return sendJson(res, 200, { userId: user.userId });
  }

  if (req.url === '/api/state') {
    const user = authenticate(req);
    if (!user) {
      return sendJson(res, 401, { error: 'Unauthorized' });
    }
    return handleState(req, res, user);
  }

  return sendJson(res, 404, { error: 'Not found' });
}

http.createServer(handler).listen(PORT, HOST, () => {
  console.log(`Dental backend listening on http://${HOST}:${PORT}`);
});
