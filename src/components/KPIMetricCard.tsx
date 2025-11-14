import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { KPI } from '@/lib/mockData';
import { TrendChart } from './TrendChart';

interface KPIMetricCardProps {
  kpi: KPI;
}

export const KPIMetricCard = ({ kpi }: KPIMetricCardProps) => {
  const getStatusBadge = (status: string) => {
    if (status === 'good') {
      return <Badge className="bg-success text-success-foreground">Good</Badge>;
    }
    if (status === 'warning') {
      return <Badge className="bg-warning text-warning-foreground">Warning</Badge>;
    }
    return <Badge className="bg-danger text-danger-foreground">Critical</Badge>;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-success" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-success" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getChartColor = (status: string) => {
    if (status === 'good') return 'hsl(var(--success))';
    if (status === 'warning') return 'hsl(var(--warning))';
    return 'hsl(var(--danger))';
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-semibold text-base mb-1">{kpi.name}</h4>
          <div className="flex items-center gap-2 mt-2">
            {getStatusBadge(kpi.status)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-muted-foreground mb-1">Current</div>
          <div className="text-2xl font-bold">
            {kpi.value}
            <span className="text-sm text-muted-foreground ml-1">{kpi.unit}</span>
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1">Target</div>
          <div className="text-2xl font-bold text-muted-foreground">
            {kpi.target}
            <span className="text-sm ml-1">{kpi.unit}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {getTrendIcon(kpi.trend)}
        <span className="text-sm text-muted-foreground">
          {kpi.trend === 'stable' ? 'No change' : `${Math.abs(kpi.trendValue)} ${kpi.unit} ${kpi.trend === 'up' ? 'increase' : 'decrease'}`}
        </span>
      </div>

      <div className="h-32">
        <TrendChart data={kpi.history} color={getChartColor(kpi.status)} unit={kpi.unit} />
      </div>
    </Card>
  );
};
