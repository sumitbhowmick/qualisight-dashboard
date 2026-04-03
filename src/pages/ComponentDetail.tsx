import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';
import { TrendChart } from '@/components/TrendChart';
import { MaturityRadar } from '@/components/MaturityRadar';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { travelComponents, categories } from '@/lib/mockData';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ComponentDetail = () => {
  const { componentId } = useParams();
  const navigate = useNavigate();
  const [qualityMode, setQualityMode] = useState<'builtin' | 'perceived'>('builtin');

  const component = travelComponents.find(c => c.id === componentId);

  if (!component) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Component Not Found</h1>
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-danger';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-success/10 border-success/30';
    if (score >= 70) return 'bg-warning/10 border-warning/30';
    return 'bg-danger/10 border-danger/30';
  };

  const builtInScore = component.qualityScore;
  const perceivedScore = component.perceivedQualityScore;
  const activeScore = qualityMode === 'builtin' ? builtInScore : perceivedScore;
  const activeTrend = qualityMode === 'builtin' ? component.trend : component.perceivedTrend;
  const activeHistory = qualityMode === 'builtin' ? component.history : component.perceivedHistory;

  const componentCategories = component.categoryScores.map(cs => {
    const cat = categories.find(c => c.id === cs.categoryId)!;
    const score = qualityMode === 'builtin' ? cs.builtInScore : cs.perceivedScore;
    const prevScore = qualityMode === 'builtin' ? cs.builtInPrevScore : cs.perceivedPrevScore;
    return { ...cat, score, prevScore, delta: score - prevScore };
  });

  const radarCategories = componentCategories.map(c => ({ ...c }));

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'up') return <TrendingUp className="w-5 h-5 text-success" />;
    if (trend === 'down') return <TrendingDown className="w-5 h-5 text-danger" />;
    return <Minus className="w-5 h-5 text-muted-foreground" />;
  };

  const trendLabel = activeTrend === 'up' ? 'Improving' : activeTrend === 'down' ? 'Declining' : 'Stable';
  const trendColor = activeTrend === 'up' ? 'text-success' : activeTrend === 'down' ? 'text-danger' : 'text-muted-foreground';

  // Compute previous cycle scores for the two index cards
  const builtInPrev = component.history.length >= 2 ? component.history[component.history.length - 2].value : builtInScore;
  const perceivedPrev = component.perceivedHistory.length >= 2 ? component.perceivedHistory[component.perceivedHistory.length - 2].value : perceivedScore;
  const builtInDelta = Math.round((builtInScore - builtInPrev) * 10) / 10;
  const perceivedDelta = Math.round((perceivedScore - perceivedPrev) * 10) / 10;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-3 sm:mb-4" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">{component.name}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Dual Quality Index Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card
            className={`p-5 cursor-pointer transition-all border-2 ${
              qualityMode === 'builtin' ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setQualityMode('builtin')}
          >
            <div className="text-sm text-muted-foreground mb-1">Built-in Quality Index</div>
            <div className="flex items-end gap-3">
              <span className={`text-4xl font-bold ${getScoreColor(builtInScore)}`}>{builtInScore}%</span>
              <span className={`text-sm font-medium mb-1 ${builtInDelta >= 0 ? 'text-success' : 'text-danger'}`}>
                {builtInDelta >= 0 ? '▲' : '▼'} {Math.abs(builtInDelta)}%
              </span>
            </div>
            <Progress value={builtInScore} className="mt-3 h-2" />
          </Card>
          <Card
            className={`p-5 cursor-pointer transition-all border-2 ${
              qualityMode === 'perceived' ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setQualityMode('perceived')}
          >
            <div className="text-sm text-muted-foreground mb-1">Perceived Quality Index</div>
            <div className="flex items-end gap-3">
              <span className={`text-4xl font-bold ${getScoreColor(perceivedScore)}`}>{perceivedScore}%</span>
              <span className={`text-sm font-medium mb-1 ${perceivedDelta >= 0 ? 'text-success' : 'text-danger'}`}>
                {perceivedDelta >= 0 ? '▲' : '▼'} {Math.abs(perceivedDelta)}%
              </span>
            </div>
            <Progress value={perceivedScore} className="mt-3 h-2" />
          </Card>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 sm:p-5">
            <div className="text-sm text-muted-foreground mb-2">
              {qualityMode === 'builtin' ? 'Built-in' : 'Perceived'} Quality Score
            </div>
            <div className={`text-4xl font-bold ${getScoreColor(activeScore)}`}>{activeScore}%</div>
          </Card>
          <Card className="p-4 sm:p-5">
            <div className="text-sm text-muted-foreground mb-2">Trend</div>
            <div className="flex items-center gap-2">
              <TrendIcon trend={activeTrend} />
              <span className={`text-2xl font-bold ${trendColor}`}>{trendLabel}</span>
            </div>
          </Card>
          <Card className="p-4 sm:p-5">
            <div className="text-sm text-muted-foreground mb-2">Categories Tracked</div>
            <div className="text-4xl font-bold">{categories.length}</div>
          </Card>
        </div>

        {/* Trend + Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold mb-4">
              12-Month {qualityMode === 'builtin' ? 'Built-in' : 'Perceived'} Quality Trend
            </h3>
            <div className="h-64">
              <TrendChart data={activeHistory} />
            </div>
          </Card>
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold mb-4">Category Breakdown</h3>
            <div className="h-64">
              <MaturityRadar categories={radarCategories} />
            </div>
          </Card>
        </div>

        {/* Category Scores - Clickable */}
        <Card className="p-4 sm:p-6">
          <h3 className="font-semibold mb-4">
            Quality by Category — {qualityMode === 'builtin' ? 'Built-in Quality' : 'Perceived Quality'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {componentCategories.map(cat => (
              <div
                key={cat.id}
                onClick={() => navigate(`/component/${componentId}/category/${cat.id}`)}
                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${getScoreBgColor(cat.score)}`}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1">{cat.name}</div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${getScoreColor(cat.score)}`}>{cat.score}%</span>
                    <span className={`text-xs font-medium ${cat.delta >= 0 ? 'text-success' : 'text-danger'}`}>
                      {cat.delta >= 0 ? '▲' : '▼'} {Math.abs(cat.delta)}%
                    </span>
                  </div>
                  <Progress value={cat.score} className="h-1.5 mt-2" />
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ComponentDetail;
