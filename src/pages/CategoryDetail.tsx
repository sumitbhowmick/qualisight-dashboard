import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KPIMetricCard } from '@/components/KPIMetricCard';
import { Navigation } from '@/components/Navigation';
import { ArrowLeft, TrendingUp, Edit } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useConfig } from '@/contexts/ConfigContext';

const CategoryDetail = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { getCalculatedCategories } = useConfig();
  const categories = getCalculatedCategories();
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
      <Navigation />
      
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-3 sm:mb-4"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{category.name}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{category.description}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Category Overview */}
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Key Performance Indicators</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {category.kpis.map((kpi) => (
              <div key={kpi.id} className="relative">
                <KPIMetricCard kpi={kpi} />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-4 right-4"
                  onClick={() => navigate(`/category/${categoryId}/kpi/${kpi.id}/data`)}
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

export default CategoryDetail;
