# 📊 BuzzSpy Frontend - React Dashboard

Real-time dashboard for Twitter/X buzzer detection with live streaming visualization.

## 🚀 Deployment on Vercel

### Quick Deploy

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial frontend commit"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to https://vercel.com
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel auto-detects Vite framework
   - Add environment variable:
     ```
     VITE_API_URL=https://buzzspy-backend.yourname.repl.co
     ```
   - Click "Deploy"

3. **Done!** Your app will be live at:
   ```
   https://your-project.vercel.app
   ```

### Environment Variables

Create `.env.local` for local development:

```bash
VITE_API_URL=https://buzzspy-backend.yourname.repl.co
```

Or for local testing:
```bash
VITE_API_URL=http://localhost:3000
```

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Open browser
# http://localhost:5173
```

## 🎯 Features

### 1. **Live Tweet Stream**
- Real-time SSE connection
- Auto-scroll to latest tweets
- Visual buzzer indicators
- Engagement metrics display

### 2. **Buzzer Detection**
- Real-time alerts (top-right corner)
- Confidence scores with progress bars
- Detection reasons breakdown
- Auto-dismiss after 10 seconds

### 3. **Metrics Dashboard**
- Tweets per second
- Total buzzers detected
- Active clients count
- Average latency monitoring

### 4. **Trending Topics**
- Top 10 trending hashtags
- Buzzer activity percentage
- Sentiment analysis (positive/negative/neutral)
- Related hashtags display

### 5. **Connection Management**
- Auto-reconnect on disconnect
- Connection status indicator
- Retry counter display
- Manual start/stop controls

## 📊 UI Components

### TweetStream
- Displays last 50 tweets
- Color-coded buzzer warnings
- Hashtag pills
- Engagement metrics (likes, retweets, replies)

### BuzzerAlert
- Floating notification system
- Stack up to 5 alerts
- Click to dismiss
- Auto-fade animation

### MetricsPanel
- 4-grid metric cards
- Color-coded by importance
- Real-time updates
- Gradient backgrounds

### TrendingTopics
- Ranked list (1-10)
- Buzzer severity indicators:
  - 🟢 Green: <20% buzzers
  - 🟡 Yellow: 20-40% buzzers
  - 🔴 Red: >40% buzzers

## 🎨 Design System

### Colors
- **Background**: Gray-900 → Gray-800 gradient
- **Cards**: Gray-900 with Gray-700 borders
- **Buzzer Low**: Green-500
- **Buzzer Medium**: Yellow-500
- **Buzzer High**: Red-500
- **Accents**: Blue-500, Purple-500

### Typography
- **Font**: Inter (fallback: system fonts)
- **Headers**: Bold, White
- **Body**: Regular, Gray-200
- **Muted**: Gray-400

## 🔌 API Integration

### SSE Connection
```typescript
const eventSource = new EventSource(
  'https://buzzspy-backend.yourname.repl.co/api/stream'
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle: tweet, buzzer_alert, metrics, trending
};
```

### Stream Control
```typescript
// Start streaming
POST https://backend/api/stream/start

// Stop streaming
POST https://backend/api/stream/stop

// Get status
GET https://backend/api/stream/status
```

## 📱 Responsive Design

- **Mobile**: Single column layout
- **Tablet**: 2-column grid
- **Desktop**: 3-column grid
- **4K**: Centered max-width container

## ⚡ Performance

- **Bundle Size**: ~150KB gzipped
- **First Paint**: <2 seconds
- **SSE Reconnect**: <3 seconds
- **Memory Usage**: <100MB

## 🧪 Testing

### Manual Testing Checklist

- [ ] Start stream button works
- [ ] SSE connection established
- [ ] Tweets appear in real-time
- [ ] Buzzer alerts show up
- [ ] Metrics update every 5 seconds
- [ ] Trending topics populate
- [ ] Stop stream works
- [ ] Reset clears all data
- [ ] Auto-reconnect on disconnect

### Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🐛 Troubleshooting

### "Failed to start stream"
**Solution**: Backend might be sleeping (Replit free tier)
- Wait 5-10 seconds
- Click "Start Stream" again
- Check backend URL in console

### "Connection keeps dropping"
**Solution**: Network or backend issue
- Check internet connection
- Verify backend is running
- Look at reconnect counter (should auto-reconnect)

### "No tweets showing"
**Solution**: Stream not started
- Click "Start Stream" button
- Wait 2-3 seconds for first tweets
- Check browser console for errors

### "Vercel deployment failed"
**Solution**: 
- Ensure `VITE_API_URL` is set in Vercel dashboard
- Check build logs for specific errors
- Verify `package.json` scripts are correct

## 🔗 Integration URLs

Update these in your code:

**Backend (Replit)**:
```
https://buzzspy-backend.yourname.repl.co
```

**AI Service (Replit)**:
```
https://buzzspy-ai.yourname.repl.co
```

**Frontend (Vercel)**:
```
https://your-project.vercel.app
```

## 📦 Production Optimizations

1. **Code Splitting**: Automatic with Vite
2. **Tree Shaking**: Removes unused code
3. **Minification**: JS/CSS compressed
4. **Lazy Loading**: Components load on demand
5. **CDN**: Vercel Edge Network globally

## 🎁 Bonus Features

### Dark Mode
Already dark! 🌙

### Keep-Alive
Frontend pings backend `/health` every 4 minutes to prevent Replit sleep.

### Error Boundaries
Graceful error handling with fallback UI.

## 📚 Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool (fast HMR) |
| **TailwindCSS** | Utility-first styling |
| **Recharts** | Charts (future feature) |
| **Lucide React** | Icon library |
| **Server-Sent Events** | Real-time streaming |

## 🚀 Deployment Checklist

- [x] Set VITE_API_URL environment variable
- [x] Update vercel.json with backend URL
- [x] Test SSE connection
- [x] Verify mobile responsiveness
- [x] Check cross-browser compatibility
- [x] Enable Vercel Analytics (optional)

---

**Made with ❤️