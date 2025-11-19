import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { categories as defaultCategories, CategoryData, KPI } from '@/lib/mockData';

interface KPIWeight {
  kpiId: string;
  categoryId: string;
  weight: number;
}

interface CategoryWeight {
  categoryId: string;
  weight: number;
}

interface KPIDataPoint {
  kpiId: string;
  date: string;
  value: number;
  unit: string;
}

interface ConfigContextType {
  kpiWeights: KPIWeight[];
  categoryWeights: CategoryWeight[];
  kpiDataPoints: KPIDataPoint[];
  updateKPIWeights: (weights: KPIWeight[]) => void;
  updateCategoryWeights: (weights: CategoryWeight[]) => void;
  addKPIDataPoint: (dataPoint: KPIDataPoint) => void;
  updateKPIDataPoint: (kpiId: string, date: string, dataPoint: Partial<KPIDataPoint>) => void;
  deleteKPIDataPoint: (kpiId: string, date: string) => void;
  getKPIDataPoints: (kpiId: string) => KPIDataPoint[];
  getCalculatedCategories: () => CategoryData[];
  getCalculatedQMI: () => number;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return context;
};

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [kpiWeights, setKPIWeights] = useState<KPIWeight[]>(() => {
    const saved = localStorage.getItem('kpiWeights');
    if (saved) return JSON.parse(saved);
    
    // Initialize with default weights (equal distribution within category)
    const weights: KPIWeight[] = [];
    defaultCategories.forEach(category => {
      const weightPerKPI = 100 / category.kpis.length;
      category.kpis.forEach(kpi => {
        weights.push({
          kpiId: kpi.id,
          categoryId: category.id,
          weight: weightPerKPI,
        });
      });
    });
    return weights;
  });

  const [categoryWeights, setCategoryWeights] = useState<CategoryWeight[]>(() => {
    const saved = localStorage.getItem('categoryWeights');
    if (saved) return JSON.parse(saved);
    
    return defaultCategories.map(cat => ({
      categoryId: cat.id,
      weight: cat.weight,
    }));
  });

  const [kpiDataPoints, setKPIDataPoints] = useState<KPIDataPoint[]>(() => {
    const saved = localStorage.getItem('kpiDataPoints');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('kpiWeights', JSON.stringify(kpiWeights));
  }, [kpiWeights]);

  useEffect(() => {
    localStorage.setItem('categoryWeights', JSON.stringify(categoryWeights));
  }, [categoryWeights]);

  useEffect(() => {
    localStorage.setItem('kpiDataPoints', JSON.stringify(kpiDataPoints));
  }, [kpiDataPoints]);

  const updateKPIWeights = (weights: KPIWeight[]) => {
    setKPIWeights(weights);
  };

  const updateCategoryWeights = (weights: CategoryWeight[]) => {
    setCategoryWeights(weights);
  };

  const addKPIDataPoint = (dataPoint: KPIDataPoint) => {
    setKPIDataPoints(prev => [...prev, dataPoint]);
  };

  const updateKPIDataPoint = (kpiId: string, date: string, updates: Partial<KPIDataPoint>) => {
    setKPIDataPoints(prev =>
      prev.map(dp =>
        dp.kpiId === kpiId && dp.date === date ? { ...dp, ...updates } : dp
      )
    );
  };

  const deleteKPIDataPoint = (kpiId: string, date: string) => {
    setKPIDataPoints(prev => prev.filter(dp => !(dp.kpiId === kpiId && dp.date === date)));
  };

  const getKPIDataPoints = (kpiId: string) => {
    return kpiDataPoints.filter(dp => dp.kpiId === kpiId).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const calculateKPIScore = (kpi: KPI, dataPoints: KPIDataPoint[]): number => {
    if (dataPoints.length === 0) {
      // Fallback to mock data percentage
      return ((kpi.value / kpi.target) * 100);
    }
    
    const latestDataPoint = dataPoints[dataPoints.length - 1];
    const value = latestDataPoint.value;
    
    // Normalize based on whether lower or higher is better
    // This is a simplified logic - can be enhanced per KPI
    if (kpi.unit === '%' || kpi.unit === 'count') {
      return Math.min((value / kpi.target) * 100, 100);
    }
    
    return Math.min((kpi.target / value) * 100, 100);
  };

  const getCalculatedCategories = (): CategoryData[] => {
    return defaultCategories.map(category => {
      const categoryKPIWeights = kpiWeights.filter(w => w.categoryId === category.id);
      
      let totalWeightedScore = 0;
      const updatedKPIs = category.kpis.map(kpi => {
        const weight = categoryKPIWeights.find(w => w.kpiId === kpi.id)?.weight || 0;
        const dataPoints = getKPIDataPoints(kpi.id);
        const kpiScore = calculateKPIScore(kpi, dataPoints);
        
        totalWeightedScore += (kpiScore * weight) / 100;
        
        // Update KPI with latest data if available
        if (dataPoints.length > 0) {
          const latest = dataPoints[dataPoints.length - 1];
          return {
            ...kpi,
            value: latest.value,
            unit: latest.unit,
            history: dataPoints.slice(-5).map((dp, idx) => ({
              month: new Date(dp.date).toLocaleDateString('en-US', { month: 'short' }),
              value: dp.value,
            })),
          };
        }
        
        return kpi;
      });
      
      return {
        ...category,
        kpis: updatedKPIs,
        score: Math.round(totalWeightedScore),
      };
    });
  };

  const getCalculatedQMI = (): number => {
    const calculatedCategories = getCalculatedCategories();
    let totalWeightedScore = 0;
    
    calculatedCategories.forEach(category => {
      const weight = categoryWeights.find(w => w.categoryId === category.id)?.weight || 0;
      totalWeightedScore += (category.score * weight) / 100;
    });
    
    return Math.round(totalWeightedScore * 10) / 10;
  };

  return (
    <ConfigContext.Provider
      value={{
        kpiWeights,
        categoryWeights,
        kpiDataPoints,
        updateKPIWeights,
        updateCategoryWeights,
        addKPIDataPoint,
        updateKPIDataPoint,
        deleteKPIDataPoint,
        getKPIDataPoints,
        getCalculatedCategories,
        getCalculatedQMI,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};
