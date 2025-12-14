import { useState, useEffect } from 'react';
import type { ProfileSummary, RecentPattern } from '../types/api';
import { User, BookOpen, Code, Calculator, TrendingUp, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';
import ReactMarkdown from 'react-markdown';

interface ProfileInsightsProps {
  summaries: ProfileSummary;
}

const modeIcons = {
  writing: BookOpen,
  coding: Code,
  math: Calculator,
};

const modeLabels = {
  writing: 'Writing',
  coding: 'Coding',
  math: 'Math',
};

export function ProfileInsights({ summaries }: ProfileInsightsProps) {
  console.log('🎯 PROFILE COMPONENT: ProfileInsights rendered!');

  const [insights, setInsights] = useState<ProfileSummary & { recentPatterns?: RecentPattern[] }>(summaries);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getProfileInsights();
      setInsights(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insights');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 KESTRA: ProfileInsights component mounted, fetching insights...');

    const initialize = async () => {
      await fetchInsights();
    };

    initialize();

    // Refresh insights every 30 seconds to show any newly processed results
    console.log('⏰ KESTRA: Setting up refresh interval (30 seconds)...');
    const interval = setInterval(() => {
      console.log('🔄 KESTRA: Refreshing insights...');
      fetchInsights();
    }, 30000);

    return () => {
      console.log('🛑 KESTRA: Clearing refresh interval');
      clearInterval(interval);
    };
  }, []);



  const { overallSummary, perMode, recentPatterns } = insights;

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Learning Insights
          </h1>
          <p className="text-gray-600">
            Track your progress and discover patterns in your learning journey
          </p>
        </div>

        {/* Overall Summary */}
        <section className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Overall Summary
            </h2>
            {isLoading && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing summaries...</span>
              </div>
            )}
          </div>
          {overallSummary ? (
            <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
              <ReactMarkdown>{overallSummary}</ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {isLoading ? 'Generating your learning insights...' : 'No learning summary available yet. Complete more sessions to generate insights!'}
              </p>
            </div>
          )}
        </section>

        {/* Mode-wise Summaries */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Mode-wise Summaries
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(modeLabels) as Array<keyof typeof modeLabels>).map((mode) => {
              const Icon = modeIcons[mode];
              const summary = perMode[mode];

              return (
                <div key={mode} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {modeLabels[mode]} Summary
                    </h3>
                  </div>
                  {summary ? (
                    <div className="text-gray-700 text-sm leading-relaxed prose prose-xs max-w-none">
                      <ReactMarkdown>{summary}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      No summary available for {modeLabels[mode].toLowerCase()} yet.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Patterns */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
              Recent Patterns
            </h2>
            <button
              onClick={async () => {
                await fetchInsights();
              }}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {recentPatterns && recentPatterns.length > 0 ? (
                <div className="space-y-4">
                  {recentPatterns.map((pattern, index) => (
                    <div key={`${pattern.sessionId}-${index}`} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="text-gray-700 text-sm leading-relaxed prose prose-xs max-w-none">
                          <ReactMarkdown>{pattern.pattern}</ReactMarkdown>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {modeLabels[pattern.mode]} • {new Date(pattern.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No patterns available yet. Complete more sessions to see learning insights!
                  </p>
                </div>
              )}
            </div>

            {recentPatterns && recentPatterns.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-4">
                <p className="text-xs text-gray-500 italic">
                  Patterns are analyzed from your recent learning sessions and will be updated as you progress.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
