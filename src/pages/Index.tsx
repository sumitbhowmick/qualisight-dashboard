import { Card } from '@/components/ui/card';
import { QMIScore } from '@/components/QMIScore';
import { CategoryCard } from '@/components/CategoryCard';
import { MaturityRadar } from '@/components/MaturityRadar';
import { TrendChart } from '@/components/TrendChart';
import { Navigation } from '@/components/Navigation';
import { ComponentQualityGrid } from '@/components/ComponentQualityGrid';
import { qmiHistory } from '@/lib/mockData';
import { useConfig } from '@/contexts/ConfigContext';

const Index = () => {
  const { getCalculatedCategories, getCalculatedQMI } = useConfig();
  const categories = getCalculatedCategories();
  const qmiScore = getCalculatedQMI();
  const qmiTrend = 5.2;

  const topImprovements = [
    { area: 'System Performance', improvement: '+8% in API response time' },
    { area: 'Security', improvement: '+7% in patch compliance' },
    { area: 'Functional Stability', improvement: '+5% in booking success rate' },
    { area: 'Defect Management', improvement: '-12% in mean time to resolve' },
    { area: 'Operability', improvement: '-5 incidents per month' },
  ];

  const topRisks = [
    { area: 'Defect Management', risk: 'Defect leakage rate above target' },
    { area: 'Maintainability', risk: 'Technical debt increasing' },
    { area: 'Operability', risk: 'Alert noise ratio needs improvement' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Executive Summary */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Executive Summary</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* QMI Score */}
            <Card className="p-6 flex items-center justify-center">
              <QMIScore score={qmiScore} trend={qmiTrend} />
            </Card>

            {/* QMI Trend */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">12-Month Trend</h3>
              <div className="h-64">
                <TrendChart data={qmiHistory} />
              </div>
            </Card>

            {/* Radar Chart */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Maturity Overview</h3>
              <div className="h-64">
                <MaturityRadar categories={categories} />
              </div>
            </Card>
          </div>
        </div>

        {/* Top Improvements and Risks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 text-success">Top 5 Improvements</h3>
            <div className="space-y-3">
              {topImprovements.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-success/5 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-success text-success-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{item.area}</div>
                    <div className="text-sm text-muted-foreground">{item.improvement}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4 text-warning">Top Risks</h3>
            <div className="space-y-3">
              {topRisks.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-warning/5 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-warning text-warning-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                    !
                  </div>
                  <div>
                    <div className="font-medium text-sm">{item.area}</div>
                    <div className="text-sm text-muted-foreground">{item.risk}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Component Quality Index */}
        <ComponentQualityGrid />

        {/* Category Panels */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Quality Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
