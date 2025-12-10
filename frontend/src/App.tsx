import { useState, useCallback, useEffect } from 'react';
import { Play, Square, BarChart3 } from 'lucide-react';
import { useSSE } from './hooks/useSSE';
import { useStreamStats } from './hooks/useStreamStats';
import { StatusIndicator } from './components/StatusIndicator';
import { TweetStream } from './components/TweetStream';
import { MetricsPanel } from './components/MetricsPanel';
import { BuzzerAlertsContainer } from './components/BuzzerAlert';
import { TrendingTopics } from './components/TrendingTopics';
import { API_ENDPOINTS, startStream, stopStream } from './services/api';
import type { StreamEvent, Tweet, BuzzerDetection, TrendingTopic } from './types';

interface TweetWithDetection extends Tweet {
  detection?: BuzzerDetection;
}

function App() {
  const [tweets, setTweets] = useState<TweetWithDetection[]>([]);
  const [buzzerAlerts, setBuzzerAlerts] = useState<BuzzerDetection[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { stats, onTweet, onBuzzerAlert, onMetrics, reset } = useStreamStats();

  const handleStreamEvent = useCallback((event: StreamEvent) => {
    switch (event.type) {
      case 'tweet':
        const tweet = event.data as Tweet;
        setTweets((prev) => [...prev, tweet]);
        onTweet(tweet);
        break;

      case 'buzzer_alert':
        const detection = event.data as BuzzerDetection;
        
        // Add detection to corresponding tweet
        setTweets((prev) =>
          prev.map((t) =>
            t.id === detection.tweet_id ? { ...t, detection } : t
          )
        );

        // Add to alerts
        setBuzzerAlerts((prev) => [detection, ...prev].slice(0, 5));
        onBuzzerAlert(detection);
        break;

      case 'trending':
        const topic = event.data as TrendingTopic;
        setTrendingTopics((prev) => {
          const exists = prev.find((t) => t.topic === topic.topic);
          if (exists) {
            return prev.map((t) => (t.topic === topic.topic ? topic : t));
          }
          return [...prev, topic];
        });
        break;

      case 'metrics':
        onMetrics(event.data);
        break;
    }
  }, [onTweet, onBuzzerAlert, onMetrics]);

  const { status } = useSSE({
    url: API_ENDPOINTS.STREAM,
    onEvent: handleStreamEvent,
    autoReconnect: true,
  });

  const handleStartStream = async () => {
    setIsLoading(true);
    try {
      await startStream();
      setIsStreamActive(true);
      console.log('✅ Stream started');
    } catch (error) {
      console.error('❌ Failed to start stream:', error);
      alert('Failed to start stream. Check if backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopStream = async () => {
    setIsLoading(true);
    try {
      await stopStream();
      setIsStreamActive(false);
      console.log('🛑 Stream stopped');
    } catch (error) {
      console.error('❌ Failed to stop stream:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTweets([]);
    setBuzzerAlerts([]);
    setTrendingTopics([]);
    reset();
  };

  const removeAlert = useCallback((id: string) => {
    setBuzzerAlerts((prev) => prev.filter((a) => a.tweet_id !== id));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">BuzzSpy</h1>
                <p className="text-sm text-gray-400">Twitter/X Buzzer Detection</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <StatusIndicator status={status} />

              {!isStreamActive ? (
                <button
                  onClick={handleStartStream}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Start Stream
                </button>
              ) : (
                <button
                  onClick={handleStopStream}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                >
                  <Square className="w-4 h-4" />
                  Stop Stream
                </button>
              )}

              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Buzzer Alerts */}
      <BuzzerAlertsContainer alerts={buzzerAlerts} onRemove={removeAlert} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Metrics */}
        <MetricsPanel
          metrics={stats.latestMetrics}
          totalTweets={stats.totalTweets}
          totalBuzzers={stats.totalBuzzers}
          buzzerRate={stats.buzzerRate}
        />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tweet Stream (2 columns) */}
          <div className="lg:col-span-2 h-[600px]">
            <TweetStream tweets={tweets} maxDisplay={50} />
          </div>

          {/* Trending Topics (1 column) */}
          <div className="h-[600px] overflow-y-auto">
            <TrendingTopics topics={trendingTopics} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>BuzzSpy v1.0 - Portfolio Project</p>
        <p className="mt-1">Real-time Twitter/X Buzzer Detection System</p>
      </footer>
    </div>
  );
}

export default App;