import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { travelComponents } from '@/lib/mockData';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const getScoreColor = (score: number) => {
  if (score >= 85) return 'hsl(var(--success))';
  if (score >= 70) return 'hsl(var(--warning))';
  return 'hsl(var(--danger))';
};

const getChangeColor = (change: number) => {
  if (change > 0) return 'hsl(var(--success))';
  if (change < 0) return 'hsl(var(--danger))';
  return 'hsl(var(--muted-foreground))';
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="font-semibold text-foreground text-sm mb-1">{data.fullName}</p>
      <p className="text-sm text-muted-foreground">Group: {data.group}</p>
      <p className="text-sm" style={{ color: getScoreColor(data.score) }}>
        Current: {data.score}%
      </p>
      <p className="text-sm" style={{ color: getChangeColor(data.change) }}>
        Change: {data.change > 0 ? '+' : ''}{data.change}%
      </p>
    </div>
  );
};

const CustomBar = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!payload) return null;
  const change = payload.change;
  const arrowSize = 6;
  const arrowX = x + width / 2;
  const arrowY = y - 4;

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={getScoreColor(payload.score)} rx={3} ry={3} />
      {change > 0 && (
        <polygon
          points={`${arrowX},${arrowY - arrowSize * 1.5} ${arrowX - arrowSize},${arrowY} ${arrowX + arrowSize},${arrowY}`}
          fill="hsl(var(--success))"
        />
      )}
      {change < 0 && (
        <polygon
          points={`${arrowX},${arrowY + arrowSize * 0.5} ${arrowX - arrowSize},${arrowY - arrowSize} ${arrowX + arrowSize},${arrowY - arrowSize}`}
          fill="hsl(var(--danger))"
        />
      )}
      {/* Change label */}
      <text
        x={arrowX}
        y={arrowY - (change !== 0 ? arrowSize * 1.8 : arrowSize * 0.3)}
        textAnchor="middle"
        fill={getChangeColor(change)}
        fontSize={9}
        fontWeight="bold"
      >
        {change > 0 ? '+' : ''}{change}
      </text>
    </g>
  );
};

export const ComponentQualityGrid = () => {
  const navigate = useNavigate();

  const chartData = [...travelComponents]
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .map(c => {
      const history = c.history;
      const prevScore = history.length >= 2 ? history[history.length - 2].value : c.qualityScore;
      const change = Math.round((c.qualityScore - prevScore) * 10) / 10;
      return {
        name: c.name.length > 12 ? c.name.substring(0, 10) + '…' : c.name,
        fullName: c.name,
        group: c.group,
        score: c.qualityScore,
        change,
        id: c.id,
      };
    });

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold">Component Quality Index</h2>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-success" /> Improved</span>
          <span className="flex items-center gap-1"><TrendingDown className="w-3.5 h-3.5 text-danger" /> Declined</span>
          <span className="flex items-center gap-1"><Minus className="w-3.5 h-3.5 text-muted-foreground" /> No Change</span>
        </div>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="h-[450px] sm:h-[500px] overflow-x-auto">
          <div style={{ minWidth: `${chartData.length * 32}px`, height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: 5, right: 5, top: 30, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={80}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                <ReferenceLine y={85} stroke="hsl(var(--success))" strokeDasharray="4 4" strokeOpacity={0.5} />
                <ReferenceLine y={70} stroke="hsl(var(--warning))" strokeDasharray="4 4" strokeOpacity={0.5} />
                <Bar
                  dataKey="score"
                  shape={<CustomBar />}
                  cursor="pointer"
                  onClick={(data: any) => {
                    const comp = travelComponents.find(c => c.name === data.fullName);
                    if (comp) navigate(`/component/${comp.id}`);
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

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
