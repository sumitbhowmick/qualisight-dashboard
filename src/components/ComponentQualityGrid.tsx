import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { travelComponents } from '@/lib/mockData';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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

const getChartData = () =>
  [...travelComponents]
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

/* ── Vertical Column Chart custom bar ── */
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

/* ── Horizontal Bar Chart custom bar ── */
const HorizontalCustomBar = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!payload) return null;
  const change = payload.change;
  const labelX = x + width + 6;
  const labelY = y + height / 2 + 4;

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={getScoreColor(payload.score)} rx={3} ry={3} />
      <text x={labelX} y={labelY} fill={getChangeColor(change)} fontSize={10} fontWeight="bold">
        {change > 0 ? '▲' : change < 0 ? '▼' : '–'} {change > 0 ? '+' : ''}{change}
      </text>
    </g>
  );
};

/* ── Circular Progress Card ── */
const CircularProgressCard = ({ data, onClick }: { data: any; onClick: () => void }) => {
  const radius = 32;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (data.score / 100) * circumference;
  const size = (radius + stroke) * 2;

  return (
    <Card
      className="p-3 flex flex-col items-center gap-1.5 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={radius + stroke} cy={radius + stroke} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
        <circle
          cx={radius + stroke}
          cy={radius + stroke}
          r={radius}
          fill="none"
          stroke={getScoreColor(data.score)}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-lg font-bold" style={{ color: getScoreColor(data.score) }}>{data.score}%</span>
      <span className="text-[10px] text-center text-muted-foreground leading-tight line-clamp-2 max-w-[90px]">{data.fullName}</span>
      <span className="text-xs font-semibold" style={{ color: getChangeColor(data.change) }}>
        {data.change > 0 ? '▲ +' : data.change < 0 ? '▼ ' : '– '}{data.change}%
      </span>
    </Card>
  );
};

export const ComponentQualityGrid = () => {
  const navigate = useNavigate();
  const chartData = getChartData();

  const navigateToComponent = (fullName: string) => {
    const comp = travelComponents.find(c => c.name === fullName);
    if (comp) navigate(`/component/${comp.id}`);
  };

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

      <Tabs defaultValue="vertical">
        <TabsList className="mb-4">
          <TabsTrigger value="vertical">Column Chart</TabsTrigger>
          <TabsTrigger value="horizontal">Horizontal Bar</TabsTrigger>
          <TabsTrigger value="circular">Circular Progress</TabsTrigger>
        </TabsList>

        {/* ── Vertical Column Chart ── */}
        <TabsContent value="vertical">
          <Card className="p-4 sm:p-6">
            <div className="h-[450px] sm:h-[500px] overflow-x-auto">
              <div style={{ minWidth: `${chartData.length * 32}px`, height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ left: 5, right: 5, top: 30, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} angle={-45} textAnchor="end" interval={0} height={80} />
                    <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                    <Bar dataKey="score" shape={<CustomBar />} cursor="pointer" onClick={(data: any) => navigateToComponent(data.fullName)} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ── Horizontal Bar Chart ── */}
        <TabsContent value="horizontal">
          <Card className="p-4 sm:p-6">
            <div className="overflow-y-auto" style={{ height: `${Math.max(500, chartData.length * 28)}px` }}>
              <ResponsiveContainer width="100%" height={chartData.length * 28}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 60, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis type="category" dataKey="fullName" width={140} stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                  <Bar dataKey="score" shape={<HorizontalCustomBar />} cursor="pointer" onClick={(data: any) => navigateToComponent(data.fullName)} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        {/* ── Circular Progress Grid ── */}
        <TabsContent value="circular">
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {chartData.map(d => (
              <CircularProgressCard key={d.id} data={d} onClick={() => navigateToComponent(d.fullName)} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold">{travelComponents.length}</div>
          <div className="text-xs text-muted-foreground">Total Components</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-success">{travelComponents.filter(c => c.qualityScore >= 85).length}</div>
          <div className="text-xs text-muted-foreground">High Quality (≥85)</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-warning">{travelComponents.filter(c => c.qualityScore >= 70 && c.qualityScore < 85).length}</div>
          <div className="text-xs text-muted-foreground">Needs Attention (70-84)</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-danger">{travelComponents.filter(c => c.qualityScore < 70).length}</div>
          <div className="text-xs text-muted-foreground">At Risk (&lt;70)</div>
        </Card>
      </div>
    </div>
  );
};