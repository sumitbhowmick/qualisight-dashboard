import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';
import { TrendChart } from '@/components/TrendChart';
import { MaturityRadar } from '@/components/MaturityRadar';
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { travelComponents, categories } from '@/lib/mockData';
import { Progress } from '@/components/ui/progress';

const ComponentDetail = () => {
  const { componentId } = useParams();
  const navigate = useNavigate();

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

  // Simulate category-level breakdown for this component
  const componentCategories = categories.map(cat => {
    const variance = (Math.random() - 0.5) * 20;
    const score = Math.min(100, Math.max(30, Math.round(component.qualityScore + variance)));
    return {
      ...cat,
      score,
    };
  });

  const groupComponents = travelComponents
    .filter(c => c.group === component.group && c.id !== component.id)
    .sort((a, b) => b.qualityScore - a.qualityScore);

  const rank = [...travelComponents].sort((a, b) => b.qualityScore - a.qualityScore).findIndex(c => c.id === component.id) + 1;

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'up') return <TrendingUp className="w-5 h-5 text-success" />;
    if (trend === 'down') return <TrendingDown className="w-5 h-5 text-danger" />;
    return <Minus className="w-5 h-5 text-muted-foreground" />;
  };

  const trendLabel = component.trend === 'up' ? 'Improving' : component.trend === 'down' ? 'Declining' : 'Stable';
  const trendColor = component.trend === 'up' ? 'text-success' : component.trend === 'down' ? 'text-danger' : 'text-muted-foreground';

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-3 sm:mb-4" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">{component.name}</h1>
              <p className="text-sm text-muted-foreground">{component.group}</p>
            </div>
            <div className={`text-4xl font-bold ${getScoreColor(component.qualityScore)}`}>
              {component.qualityScore}%
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
          <Card className="p-4 sm:p-6">
            <div className="text-sm text-muted-foreground mb-2">Quality Score</div>
            <div className={`text-4xl font-bold ${getScoreColor(component.qualityScore)}`}>
              {component.qualityScore}%
            </div>
            <Progress value={component.qualityScore} className="mt-3 h-2" />
          </Card>
          <Card className="p-4 sm:p-6">
            <div className="text-sm text-muted-foreground mb-2">Overall Rank</div>
            <div className="text-4xl font-bold">#{rank}</div>
            <div className="text-sm text-muted-foreground mt-1">of {travelComponents.length} components</div>
          </Card>
          <Card className="p-4 sm:p-6">
            <div className="text-sm text-muted-foreground mb-2">Trend</div>
            <div className="flex items-center gap-2">
              <TrendIcon trend={component.trend} />
              <span className={`text-2xl font-bold ${trendColor}`}>{trendLabel}</span>
            </div>
          </Card>
          <Card className="p-4 sm:p-6">
            <div className="text-sm text-muted-foreground mb-2">Group</div>
            <div className="text-lg font-semibold">{component.group}</div>
            <div className="text-sm text-muted-foreground mt-1">{groupComponents.length + 1} components</div>
          </Card>
        </div>

        {/* Trend + Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold mb-4">12-Month Quality Trend</h3>
            <div className="h-64">
              <TrendChart data={component.history} />
            </div>
          </Card>
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold mb-4">Category Breakdown</h3>
            <div className="h-64">
              <MaturityRadar categories={componentCategories} />
            </div>
          </Card>
        </div>

        {/* Category Scores */}
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="font-semibold mb-4">Quality by Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {componentCategories.map(cat => (
              <div key={cat.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className={`text-xl font-bold w-14 text-right ${getScoreColor(cat.score)}`}>
                  {cat.score}%
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{cat.name}</div>
                  <Progress value={cat.score} className="h-1.5 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Peer Comparison */}
        {groupComponents.length > 0 && (
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold mb-4">Peer Comparison — {component.group}</h3>
            <div className="space-y-3">
              {[component, ...groupComponents].sort((a, b) => b.qualityScore - a.qualityScore).map((peer, idx) => (
                <div
                  key={peer.id}
                  onClick={() => peer.id !== component.id && navigate(`/component/${peer.id}`)}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    peer.id === component.id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-muted/50 hover:bg-muted cursor-pointer'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 text-sm font-medium">
                    {peer.name}
                    {peer.id === component.id && <span className="text-xs text-primary ml-2">(Current)</span>}
                  </div>
                  <div className={`text-lg font-bold ${getScoreColor(peer.qualityScore)}`}>
                    {peer.qualityScore}%
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ComponentDetail;
