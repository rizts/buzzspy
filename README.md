# 🚀 BuzzSpy Backend - Replit Edition

Real-time Twitter/X buzzer detection backend built with Fastify + TypeScript.

## 🎯 Deployment on Replit

### Quick Start

1. **Fork this Repl** or create new Repl:
   - Language: Node.js
   - Template: Blank

2. **Add Secrets** (click 🔒 icon in sidebar):
   ```
   REDIS_URL=https://your-redis.upstash.io
   REDIS_TOKEN=your-token-here
   ```

3. **Get Free Upstash Redis**:
   - Visit: https://console.upstash.com/
   - Create new Redis database
   - Copy REST URL and Token
   - Paste into Replit Secrets

4. **Click "Run"** ▶️
   - Replit auto-installs dependencies
   - Server starts on port 3000
   - Public URL: `https://{your-repl}.{username}.repl.co`

### 📡 API Endpoints

Once running, access these endpoints:

- **SSE Stream**: `GET /api/stream`
- **Start Stream**: `POST /api/stream/start`
- **Stop Stream**: `POST /api/stream/stop`
- **Status**: `GET /api/stream/status`
- **Health Check**: `GET /health`

### 🧪 Testing

#### Using curl:

```bash
# Start stream
curl -X POST https://your-repl.username.repl.co/api/stream/start

# Listen to events
curl -N https://your-repl.username.repl.co/api/stream

# Check status
curl https://your-repl.username.repl.co/api/stream/status
```

#### Using Browser:

Open in new tab:
```
https://your-repl.username.repl.co/api/stream
```

You'll see real-time SSE events streaming!

### 🔄 Keep-Alive

Replit free tier sleeps after inactivity. This backend includes:

- ✅ Auto self-ping every 5 minutes
- ✅ Prevents sleep during active development
- ✅ Graceful wake-up on first request

### 📊 Features

- ✅ **SSE Streaming**: Real-time tweet feed
- ✅ **Adaptive Backpressure**: Automatic queue management
- ✅ **Mock Data Generator**: Realistic Indonesian political tweets
- ✅ **Buzzer Detection**: Pattern-based heuristics
- ✅ **Upstash Redis**: Serverless caching (10K cmds/day free)
- ✅ **Lightweight**: ~15MB total dependencies

### 🛠️ Development

```bash
# Install dependencies (auto-run by Replit)
npm install

# Run in dev mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### 📝 Environment Variables

Set via Replit Secrets (🔒 icon):

| Variable | Description | Required |
|----------|-------------|----------|
| `REDIS_URL` | Upstash Redis REST URL | ✅ Yes |
| `REDIS_TOKEN` | Upstash Redis token | ✅ Yes |
| `AI_SERVICE_URL` | Python AI service URL | Optional |
| `TWEETS_PER_SECOND` | Stream rate (default: 10) | No |
| `MAX_CLIENTS` | Max concurrent clients | No |

### 🐛 Troubleshooting

**Port already in use:**
- Replit automatically assigns port 3000
- No action needed

**Redis connection failed:**
- Check REDIS_URL and REDIS_TOKEN in Secrets
- Verify Upstash dashboard shows database as active

**Stream not working:**
- Ensure you called `POST /api/stream/start` first
- Check browser console for CORS errors

### 📦 Bundle Size

- **Development**: 85MB (includes dev dependencies)
- **Production**: 15MB (optimized)
- **Runtime Memory**: ~60MB (vs 200MB+ with traditional setup)

### 🔗 Connect with Frontend

Frontend (React) should connect to:
```typescript
const SSE_URL = 'https://your-backend.username.repl.co/api/stream';
const eventSource = new EventSource(SSE_URL);
```

### 📚 Next Steps

1. ✅ Backend running on Replit
2. 🐍 Deploy Python AI service (separate Repl)
3. ⚛️ Deploy React frontend on Vercel/Netlify
4. 🔗 Connect all services

### 🆘 Support

Check Replit logs (bottom panel) for detailed errors.

---

**Made with ❤️