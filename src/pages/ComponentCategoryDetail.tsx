import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';
import { KPIMetricCard } from '@/components/KPIMetricCard';
import { ArrowLeft, Edit } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { travelComponents, categories } from '@/lib/mockData';

const ComponentCategoryDetail = () => {
  const { componentId, categoryId } = useParams();
  const navigate = useNavigate();

  const component = travelComponents.find(c => c.id === componentId);
  const category = categories.find(c => c.id === categoryId);

  if (!component || !category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Not Found</h1>
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const catScore = component.categoryScores.find(cs => cs.categoryId === categoryId);
  const builtInScore = catScore?.builtInScore ?? 0;
  const perceivedScore = catScore?.perceivedScore ?? 0;
  const builtInDelta = builtInScore - (catScore?.builtInPrevScore ?? builtInScore);
  const perceivedDelta = perceivedScore - (catScore?.perceivedPrevScore ?? perceivedScore);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/component/${componentId}`)}
            className="mb-3 sm:mb-4"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {component.name}
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">{category.name}</h1>
          <p className="text-sm text-muted-foreground">{component.name} — {category.description}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Dual Score Overview */}
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Built-in Quality Score</div>
              <div className="flex items-end gap-2">
                <span className={`text-4xl font-bold ${getScoreColor(builtInScore)}`}>{builtInScore}%</span>
                <span className={`text-sm font-medium mb-1 ${builtInDelta >= 0 ? 'text-success' : 'text-danger'}`}>
                  {builtInDelta >= 0 ? '▲' : '▼'} {Math.abs(builtInDelta)}%
                </span>
              </div>
              <Progress value={builtInScore} className="mt-3 h-2" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Perceived Quality Score</div>
              <div className="flex items-end gap-2">
                <span className={`text-4xl font-bold ${getScoreColor(perceivedScore)}`}>{perceivedScore}%</span>
                <span className={`text-sm font-medium mb-1 ${perceivedDelta >= 0 ? 'text-success' : 'text-danger'}`}>
                  {perceivedDelta >= 0 ? '▲' : '▼'} {Math.abs(perceivedDelta)}%
                </span>
              </div>
              <Progress value={perceivedScore} className="mt-3 h-2" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Total KPIs</div>
              <div className="text-4xl font-bold">{category.kpis.length}</div>
              <div className="flex gap-3 mt-3 text-sm">
                <span className="text-success">{category.kpis.filter(k => k.status === 'good').length} Good</span>
                <span className="text-warning">{category.kpis.filter(k => k.status === 'warning').length} Warning</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Category Weight</div>
              <div className="text-4xl font-bold">{category.weight}%</div>
              <div className="text-sm text-muted-foreground mt-2">in Quality Index</div>
            </div>
          </div>
        </Card>

        {/* KPI Metrics */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Key Performance Indicators</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {category.kpis.map((kpi) => (
              <div key={kpi.id} className="relative">
                <KPIMetricCard kpi={kpi} />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-4 right-4"
                  onClick={() => navigate(`/component/${componentId}/category/${categoryId}/kpi/${kpi.id}/data`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Manage Data
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentCategoryDetail;
