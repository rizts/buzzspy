import { TrendingUp, Hash } from 'lucide-react';
import type { TrendingTopic } from '../types';

interface TrendingTopicsProps {
  topics: TrendingTopic[];
}

export function TrendingTopics({ topics }: TrendingTopicsProps) {
  const sortedTopics = [...topics].sort((a, b) => b.tweet_count - a.tweet_count);
  const topTopics = sortedTopics.slice(0, 10);

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Trending Topics
        </h2>
      </div>

      <div className="p-4">
        {topTopics.length === 0 ? (
          <p className="text-center py-8 text-gray-500">
            No trending topics yet...
          </p>
        ) : (
          <div className="space-y-3">
            {topTopics.map((topic, idx) => (
              <TopicCard key={topic.topic} topic={topic} rank={idx + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TopicCard({ topic, rank }: { topic: TrendingTopic; rank: number }) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-400';
      case 'negative':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getBuzzerSeverity = (pct: number) => {
    if (pct < 20) return 'bg-green-500/20 text-green-400';
    if (pct < 40) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
  };

  return (
    <div className="p-3 rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm">
          {rank}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-white truncate">{topic.topic}</h3>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
            <span>{topic.tweet_count} tweets</span>
            <span className={getSentimentColor(topic.sentiment)}>
              {topic.sentiment}
            </span>
          </div>

          {topic.buzzer_percentage > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Buzzer Activity:</span>
              <span className={`text-xs px-2 py-1 rounded ${getBuzzerSeverity(topic.buzzer_percentage)}`}>
                {topic.buzzer_percentage.toFixed(0)}%
              </span>
            </div>
          )}

          {topic.top_hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {topic.top_hashtags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}