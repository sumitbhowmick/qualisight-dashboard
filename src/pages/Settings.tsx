import { useState, useEffect } from 'react';
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
import { useConfig } from '@/contexts/ConfigContext';

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
  const { kpiWeights: savedKpiWeights, categoryWeights: savedCategoryWeights, updateKPIWeights, updateCategoryWeights } = useConfig();
  
  const [categoryWeights, setCategoryWeights] = useState<CategoryWeight[]>(() => {
    return categories.map(cat => {
      const saved = savedCategoryWeights.find(w => w.categoryId === cat.id);
      return {
        id: cat.id,
        name: cat.name,
        weight: saved?.weight || cat.weight
      };
    });
  });

  const [kpiWeights, setKpiWeights] = useState<KPIWeight[]>(() => {
    return categories.flatMap(cat =>
      cat.kpis.map(kpi => {
        const saved = savedKpiWeights.find(w => w.kpiId === kpi.id);
        return {
          categoryId: cat.id,
          kpiId: kpi.id,
          kpiName: kpi.name,
          weight: saved?.weight || (100 / cat.kpis.length),
        };
      })
    );
  });

  // Update local state when context changes
  useEffect(() => {
    setCategoryWeights(categories.map(cat => {
      const saved = savedCategoryWeights.find(w => w.categoryId === cat.id);
      return {
        id: cat.id,
        name: cat.name,
        weight: saved?.weight || cat.weight
      };
    }));
  }, [savedCategoryWeights]);

  useEffect(() => {
    setKpiWeights(categories.flatMap(cat =>
      cat.kpis.map(kpi => {
        const saved = savedKpiWeights.find(w => w.kpiId === kpi.id);
        return {
          categoryId: cat.id,
          kpiId: kpi.id,
          kpiName: kpi.name,
          weight: saved?.weight || (100 / cat.kpis.length),
        };
      })
    ));
  }, [savedKpiWeights]);

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

    // Save to context
    updateCategoryWeights(categoryWeights.map(cat => ({
      categoryId: cat.id,
      weight: cat.weight,
    })));

    updateKPIWeights(kpiWeights.map(kpi => ({
      kpiId: kpi.kpiId,
      categoryId: kpi.categoryId,
      weight: kpi.weight,
    })));

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
            Configure KPI mappings, weights, and Quality Maturity Index calculation
          </p>
        </div>

        <Tabs defaultValue="category-weights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="category-weights">Category Weights</TabsTrigger>
            <TabsTrigger value="kpi-weights">KPI Weights</TabsTrigger>
          </TabsList>

          <TabsContent value="category-weights" className="space-y-4">
            <Card className="p-4 sm:p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Quality Category Weights</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure how each category contributes to the overall Quality Maturity Index.
                  Total must equal 100%.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Total Weight:</span>
                  <span className={`font-bold ${Math.abs(totalWeight - 100) < 0.1 ? 'text-success' : 'text-danger'}`}>
                    {totalWeight.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {categoryWeights.map(category => (
                  <div key={category.id} className="space-y-2 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`cat-${category.id}`} className="font-medium">
                        {category.name}
                      </Label>
                      <Input
                        id={`cat-${category.id}`}
                        type="number"
                        value={category.weight}
                        onChange={(e) => handleCategoryWeightChange(category.id, parseFloat(e.target.value) || 0)}
                        className="w-20 text-right"
                        step="0.1"
                        min="0"
                        max="100"
                      />
                    </div>
                    <Slider
                      value={[category.weight]}
                      onValueChange={([value]) => handleCategoryWeightChange(category.id, value)}
                      max={100}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="kpi-weights" className="space-y-4">
            {categories.map(category => {
              const categoryKPIs = kpiWeights.filter(kpi => kpi.categoryId === category.id);
              const categoryTotal = getCategoryKPITotal(category.id);

              return (
                <Card key={category.id} className="p-4 sm:p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Category KPI Total:</span>
                      <span className={`font-bold ${Math.abs(categoryTotal - 100) < 0.1 ? 'text-success' : 'text-danger'}`}>
                        {categoryTotal.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {categoryKPIs.map(kpi => (
                      <div key={kpi.kpiId} className="space-y-2 p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`kpi-${kpi.kpiId}`} className="text-sm">
                            {kpi.kpiName}
                          </Label>
                          <Input
                            id={`kpi-${kpi.kpiId}`}
                            type="number"
                            value={kpi.weight}
                            onChange={(e) => handleKPIWeightChange(category.id, kpi.kpiId, parseFloat(e.target.value) || 0)}
                            className="w-20 text-right"
                            step="0.1"
                            min="0"
                            max="100"
                          />
                        </div>
                        <Slider
                          value={[kpi.weight]}
                          onValueChange={([value]) => handleKPIWeightChange(category.id, kpi.kpiId, value)}
                          max={100}
                          step={0.1}
                          className="mt-2"
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 mt-6">
          <Button onClick={handleSave} className="flex-1 sm:flex-initial">
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
          <Button onClick={handleReset} variant="outline" className="flex-1 sm:flex-initial">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}
