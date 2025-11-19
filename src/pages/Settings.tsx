import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { categories } from '@/lib/mockData';
import { Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CategoryWeight {
  id: string;
  name: string;
  weight: number;
}

interface KPIWeight {
  categoryId: string;
  kpiId: string;
  kpiName: string;
  weight: number;
}

export default function Settings() {
  const { toast } = useToast();
  const [categoryWeights, setCategoryWeights] = useState<CategoryWeight[]>(
    categories.map(cat => ({ id: cat.id, name: cat.name, weight: cat.weight }))
  );

  const [kpiWeights, setKpiWeights] = useState<KPIWeight[]>(
    categories.flatMap(cat =>
      cat.kpis.map(kpi => ({
        categoryId: cat.id,
        kpiId: kpi.id,
        kpiName: kpi.name,
        weight: 100 / cat.kpis.length, // Equal distribution by default
      }))
    )
  );

  const totalWeight = categoryWeights.reduce((sum, cat) => sum + cat.weight, 0);

  const handleCategoryWeightChange = (categoryId: string, newWeight: number) => {
    setCategoryWeights(prev =>
      prev.map(cat => (cat.id === categoryId ? { ...cat, weight: newWeight } : cat))
    );
  };

  const handleKPIWeightChange = (categoryId: string, kpiId: string, newWeight: number) => {
    setKpiWeights(prev =>
      prev.map(kpi =>
        kpi.categoryId === categoryId && kpi.kpiId === kpiId
          ? { ...kpi, weight: newWeight }
          : kpi
      )
    );
  };

  const handleSave = () => {
    if (Math.abs(totalWeight - 100) > 0.1) {
      toast({
        title: "Invalid Configuration",
        description: "Category weights must sum to 100%",
        variant: "destructive",
      });
      return;
    }

    // Validate KPI weights per category
    const invalidCategory = categories.find(cat => {
      const catKPIs = kpiWeights.filter(kpi => kpi.categoryId === cat.id);
      const total = catKPIs.reduce((sum, kpi) => sum + kpi.weight, 0);
      return Math.abs(total - 100) > 0.1;
    });

    if (invalidCategory) {
      toast({
        title: "Invalid Configuration",
        description: `KPI weights in ${invalidCategory.name} must sum to 100%`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Settings Saved",
      description: "Your configuration has been saved successfully",
    });
  };

  const handleReset = () => {
    setCategoryWeights(categories.map(cat => ({ id: cat.id, name: cat.name, weight: cat.weight })));
    setKpiWeights(
      categories.flatMap(cat =>
        cat.kpis.map(kpi => ({
          categoryId: cat.id,
          kpiId: kpi.id,
          kpiName: kpi.name,
          weight: 100 / cat.kpis.length,
        }))
      )
    );
    toast({
      title: "Settings Reset",
      description: "Configuration has been reset to defaults",
    });
  };

  const getCategoryKPITotal = (categoryId: string) => {
    return kpiWeights
      .filter(kpi => kpi.categoryId === categoryId)
      .reduce((sum, kpi) => sum + kpi.weight, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard Settings</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Configure KPI mappings, category weights, and Quality Maturity Index calculations
          </p>
        </div>

        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="categories">Category Weights</TabsTrigger>
            <TabsTrigger value="kpis">KPI Weights</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            <Card className="p-4 sm:p-6">
              <div className="mb-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Quality Category Weights</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure how much each category contributes to the overall Quality Maturity Index
                </p>
                <div className={`text-sm font-medium ${Math.abs(totalWeight - 100) < 0.1 ? 'text-success' : 'text-danger'}`}>
                  Total Weight: {totalWeight.toFixed(1)}% {Math.abs(totalWeight - 100) < 0.1 ? '✓' : '(Must equal 100%)'}
                </div>
              </div>

              <div className="space-y-6">
                {categoryWeights.map(category => (
                  <div key={category.id} className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <Label className="text-sm sm:text-base font-medium truncate flex-1">{category.name}</Label>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Input
                          type="number"
                          value={category.weight}
                          onChange={(e) => handleCategoryWeightChange(category.id, parseFloat(e.target.value) || 0)}
                          className="w-20 text-right"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                    <Slider
                      value={[category.weight]}
                      onValueChange={([value]) => handleCategoryWeightChange(category.id, value)}
                      max={100}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="kpis" className="space-y-6">
            {categories.map(category => {
              const categoryKPIs = kpiWeights.filter(kpi => kpi.categoryId === category.id);
              const categoryTotal = getCategoryKPITotal(category.id);
              
              return (
                <Card key={category.id} className="p-4 sm:p-6">
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-semibold mb-1">{category.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">{category.description}</p>
                    <div className={`text-sm font-medium ${Math.abs(categoryTotal - 100) < 0.1 ? 'text-success' : 'text-danger'}`}>
                      Total: {categoryTotal.toFixed(1)}% {Math.abs(categoryTotal - 100) < 0.1 ? '✓' : '(Must equal 100%)'}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {categoryKPIs.map(kpi => (
                      <div key={kpi.kpiId} className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <Label className="text-xs sm:text-sm truncate flex-1">{kpi.kpiName}</Label>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Input
                              type="number"
                              value={kpi.weight.toFixed(1)}
                              onChange={(e) =>
                                handleKPIWeightChange(category.id, kpi.kpiId, parseFloat(e.target.value) || 0)
                              }
                              className="w-16 sm:w-20 text-right text-sm"
                              min="0"
                              max="100"
                              step="0.1"
                            />
                            <span className="text-xs sm:text-sm text-muted-foreground">%</span>
                          </div>
                        </div>
                        <Slider
                          value={[kpi.weight]}
                          onValueChange={([value]) => handleKPIWeightChange(category.id, kpi.kpiId, value)}
                          max={100}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
          <Button onClick={handleSave} className="w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
          <Button onClick={handleReset} variant="outline" className="w-full sm:w-auto">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}
