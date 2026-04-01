import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { travelComponents, ComponentData } from '@/lib/mockData';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const getScoreColor = (score: number) => {
  if (score >= 85) return 'hsl(var(--success))';
  if (score >= 70) return 'hsl(var(--warning))';
  return 'hsl(var(--danger))';
};

const getScoreClass = (score: number) => {
  if (score >= 85) return 'text-success';
  if (score >= 70) return 'text-warning';
  return 'text-danger';
};

const getBgClass = (score: number) => {
  if (score >= 85) return 'bg-success/10 border-success/20';
  if (score >= 70) return 'bg-warning/10 border-warning/20';
  return 'bg-danger/10 border-danger/20';
};

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-success" />;
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-danger" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
};

export const ComponentQualityGrid = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'heatmap' | 'chart'>('heatmap');

  const groups = Array.from(new Set(travelComponents.map(c => c.group)));
  const sortedComponents = [...travelComponents].sort((a, b) => b.qualityScore - a.qualityScore);

  const chartData = sortedComponents.map(c => ({
    name: c.name.length > 20 ? c.name.substring(0, 18) + '…' : c.name,
    fullName: c.name,
    score: c.qualityScore,
    id: c.id,
  }));

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold">Component Quality Index</h2>
        <Tabs value={view} onValueChange={(v) => setView(v as 'heatmap' | 'chart')}>
          <TabsList className="grid w-full grid-cols-2 max-w-[240px]">
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
            <TabsTrigger value="chart">Bar Chart</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === 'heatmap' ? (
        <div className="space-y-6">
          {groups.map(group => {
            const groupComponents = travelComponents.filter(c => c.group === group);
            return (
              <div key={group}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{group}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                  {groupComponents.map(component => (
                    <Card
                      key={component.id}
                      onClick={() => navigate(`/component/${component.id}`)}
                      className={`p-3 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border ${getBgClass(component.qualityScore)} group`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className={`text-lg sm:text-xl font-bold ${getScoreClass(component.qualityScore)}`}>
                          {component.qualityScore}
                        </span>
                        <TrendIcon trend={component.trend} />
                      </div>
                      <div className="text-xs font-medium truncate group-hover:text-primary transition-colors" title={component.name}>
                        {component.name}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="p-4 sm:p-6">
          <div className="h-[500px] sm:h-[600px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, cursor: 'pointer' }}
                  onClick={(e: any) => {
                    const comp = travelComponents.find(c => c.name.startsWith(e.value?.replace('…', '')));
                    if (comp) navigate(`/component/${comp.id}`);
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [`${value}%`, 'Quality Score']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} cursor="pointer" onClick={(data: any) => {
                  const comp = travelComponents.find(c => c.name === data.fullName);
                  if (comp) navigate(`/component/${comp.id}`);
                }}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={getScoreColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold">{travelComponents.length}</div>
          <div className="text-xs text-muted-foreground">Total Components</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-success">
            {travelComponents.filter(c => c.qualityScore >= 85).length}
          </div>
          <div className="text-xs text-muted-foreground">High Quality (≥85)</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-warning">
            {travelComponents.filter(c => c.qualityScore >= 70 && c.qualityScore < 85).length}
          </div>
          <div className="text-xs text-muted-foreground">Needs Attention (70-84)</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-danger">
            {travelComponents.filter(c => c.qualityScore < 70).length}
          </div>
          <div className="text-xs text-muted-foreground">At Risk (&lt;70)</div>
        </Card>
      </div>
    </div>
  );
};
