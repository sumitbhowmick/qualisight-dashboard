import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KPIMetricCard } from '@/components/KPIMetricCard';
import { categories } from '@/lib/mockData';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const CategoryDetail = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const category = categories.find((c) => c.id === categoryId);

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  };

  const criticalKpis = category.kpis.filter((k) => k.status === 'critical').length;
  const warningKpis = category.kpis.filter((k) => k.status === 'warning').length;
  const goodKpis = category.kpis.filter((k) => k.status === 'good').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
          <p className="text-muted-foreground">{category.description}</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Category Overview */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Category Score</div>
              <div className={`text-4xl font-bold ${getScoreColor(category.score)}`}>
                {category.score}%
              </div>
              <Progress value={category.score} className="mt-3 h-2" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Weight in QMI</div>
              <div className="text-4xl font-bold">{category.weight}%</div>
              <div className="text-sm text-muted-foreground mt-2">
                Contribution: {((category.score * category.weight) / 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Total KPIs</div>
              <div className="text-4xl font-bold">{category.kpis.length}</div>
              <div className="flex gap-3 mt-3 text-sm">
                <span className="text-success">{goodKpis} Good</span>
                <span className="text-warning">{warningKpis} Warning</span>
                {criticalKpis > 0 && <span className="text-danger">{criticalKpis} Critical</span>}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Trend</div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-success" />
                <span className="text-2xl font-bold text-success">Improving</span>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Most metrics on target
              </div>
            </div>
          </div>
        </Card>

        {/* KPI Metrics */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Key Performance Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {category.kpis.map((kpi) => (
              <KPIMetricCard key={kpi.id} kpi={kpi} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetail;
