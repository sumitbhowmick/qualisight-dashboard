import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { QMIScore } from '@/components/QMIScore';
import { CategoryCard } from '@/components/CategoryCard';
import { TrendChart } from '@/components/TrendChart';
import { Navigation } from '@/components/Navigation';
import { ComponentQualityGrid } from '@/components/ComponentQualityGrid';
import { builtInQmiHistory, perceivedQmiHistory } from '@/lib/mockData';
import { useConfig } from '@/contexts/ConfigContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

type QualityMode = 'builtin' | 'perceived';

const Index = () => {
  const { getCalculatedCategories, getCalculatedQMI } = useConfig();
  const categories = getCalculatedCategories();
  const builtInScore = 77.0;
  const perceivedScore = 77.0;
  const builtInTrend = 5.2;
  const perceivedTrend = 3.8;

  const [qualityMode, setQualityMode] = useState<QualityMode>('builtin');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Executive Summary */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Executive Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Built-in Quality Index */}
            <Card
              className={`p-6 flex items-center justify-center cursor-pointer transition-all ${qualityMode === 'builtin' ? 'ring-2 ring-primary shadow-lg' : 'opacity-80 hover:opacity-100'}`}
              onClick={() => setQualityMode('builtin')}
            >
              <QMIScore score={builtInScore} trend={builtInTrend} label="Quality Index" />
            </Card>

            {/* Built-in Quality Trend */}
            <Card className={`p-6 transition-opacity ${qualityMode === 'builtin' ? '' : 'opacity-60'}`}>
              <h3 className="font-semibold mb-4 text-sm">Quality Index Trend</h3>
              <div className="h-52">
                <TrendChart data={builtInQmiHistory} />
              </div>
            </Card>

            {/* Perceived Quality Index */}
            <Card
              className={`p-6 flex items-center justify-center cursor-pointer transition-all ${qualityMode === 'perceived' ? 'ring-2 ring-primary shadow-lg' : 'opacity-80 hover:opacity-100'}`}
              onClick={() => setQualityMode('perceived')}
            >
              <QMIScore score={perceivedScore} trend={perceivedTrend} label="Perceived Quality" />
            </Card>

            {/* Perceived Quality Trend */}
            <Card className={`p-6 transition-opacity ${qualityMode === 'perceived' ? '' : 'opacity-60'}`}>
              <h3 className="font-semibold mb-4 text-sm">Perceived Quality Trend</h3>
              <div className="h-52">
                <TrendChart data={perceivedQmiHistory} />
              </div>
            </Card>
          </div>
        </div>

        {/* Quality Mode Selector */}
        <div className="mb-4">
          <Tabs value={qualityMode} onValueChange={(v) => setQualityMode(v as QualityMode)}>
            <TabsList>
              <TabsTrigger value="builtin">Quality Index</TabsTrigger>
              <TabsTrigger value="perceived">Perceived Quality</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Component Quality Index */}
        <ComponentQualityGrid qualityMode={qualityMode} />

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
