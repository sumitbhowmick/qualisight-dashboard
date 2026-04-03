import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { travelComponents } from '@/lib/mockData';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

type QualityMode = 'builtin' | 'perceived';

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

const getChartData = (mode: QualityMode) =>
  [...travelComponents]
    .sort((a, b) => {
      const scoreA = mode === 'builtin' ? a.qualityScore : a.perceivedQualityScore;
      const scoreB = mode === 'builtin' ? b.qualityScore : b.perceivedQualityScore;
      return scoreB - scoreA;
    })
    .map(c => {
      const history = mode === 'builtin' ? c.history : c.perceivedHistory;
      const score = mode === 'builtin' ? c.qualityScore : c.perceivedQualityScore;
      const prevScore = history.length >= 2 ? history[history.length - 2].value : score;
      const change = Math.round((score - prevScore) * 10) / 10;
      return {
        name: c.name.length > 14 ? c.name.substring(0, 12) + '…' : c.name,
        fullName: c.name,
        group: c.group,
        score,
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
      <p className="text-sm" style={{ color: getScoreColor(data.score) }}>Current: {data.score}%</p>
      <p className="text-sm" style={{ color: getChangeColor(data.change) }}>Change: {data.change > 0 ? '+' : ''}{data.change}%</p>
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
      <text x={arrowX} y={arrowY - (change !== 0 ? arrowSize * 1.8 : arrowSize * 0.3)} textAnchor="middle" fill={getChangeColor(change)} fontSize={9} fontWeight="bold">
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

/* ── Circular Progress Card with score & change INSIDE circle ── */
const CircularProgressCard = ({ data, onClick }: { data: any; onClick: () => void }) => {
  const radius = 44;
  const stroke = 7;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (data.score / 100) * circumference;
  const size = (radius + stroke) * 2;
  const center = radius + stroke;

  return (
    <Card
      className="p-3 flex flex-col items-center gap-2 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={center} cy={center} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={getScoreColor(data.score)}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        {/* Score & change inside the circle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold leading-none" style={{ color: getScoreColor(data.score) }}>
            {data.score}%
          </span>
          <span className="text-[10px] font-semibold mt-0.5" style={{ color: getChangeColor(data.change) }}>
            {data.change > 0 ? '▲ +' : data.change < 0 ? '▼ ' : '– '}{data.change}%
          </span>
        </div>
      </div>
      <span className="text-xs text-center text-muted-foreground leading-tight line-clamp-2 max-w-[110px]">{data.fullName}</span>
    </Card>
  );
};

export const ComponentQualityGrid = ({ qualityMode }: { qualityMode: QualityMode }) => {
  const navigate = useNavigate();
  const chartData = getChartData(qualityMode);

  const navigateToComponent = (fullName: string) => {
    const comp = travelComponents.find(c => c.name === fullName);
    if (comp) navigate(`/component/${comp.id}`);
  };

  const components = travelComponents;
  const scoreKey = qualityMode === 'builtin' ? 'qualityScore' : 'perceivedQualityScore';

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold">
          Component Quality Index
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({qualityMode === 'builtin' ? 'Built-in Quality' : 'Perceived Quality'})
          </span>
        </h2>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-success" /> Improved</span>
          <span className="flex items-center gap-1"><TrendingDown className="w-3.5 h-3.5 text-danger" /> Declined</span>
          <span className="flex items-center gap-1"><Minus className="w-3.5 h-3.5 text-muted-foreground" /> No Change</span>
        </div>
      </div>

      <Tabs defaultValue="circular">
        <TabsList className="mb-4">
          <TabsTrigger value="circular">Circular Progress</TabsTrigger>
          <TabsTrigger value="vertical">Column Chart</TabsTrigger>
          <TabsTrigger value="horizontal">Horizontal Bar</TabsTrigger>
        </TabsList>

        {/* ── Circular Progress Grid (Default) ── */}
        <TabsContent value="circular">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {chartData.map(d => (
              <CircularProgressCard key={d.id} data={d} onClick={() => navigateToComponent(d.fullName)} />
            ))}
          </div>
        </TabsContent>

        {/* ── Vertical Column Chart ── */}
        <TabsContent value="vertical">
          <Card className="p-4 sm:p-6">
            <div className="h-[450px] sm:h-[500px] overflow-x-auto">
              <div style={{ minWidth: `${chartData.length * 50}px`, height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ left: 5, right: 5, top: 30, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} angle={-45} textAnchor="end" interval={0} height={80} />
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
            <div className="overflow-y-auto" style={{ height: `${Math.max(400, chartData.length * 32)}px` }}>
              <ResponsiveContainer width="100%" height={chartData.length * 32}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 60, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis type="category" dataKey="fullName" width={160} stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                  <Bar dataKey="score" shape={<HorizontalCustomBar />} cursor="pointer" onClick={(data: any) => navigateToComponent(data.fullName)} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold">{components.length}</div>
          <div className="text-xs text-muted-foreground">Total Components</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-success">{components.filter(c => c[scoreKey] >= 85).length}</div>
          <div className="text-xs text-muted-foreground">High Quality (≥85)</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-warning">{components.filter(c => c[scoreKey] >= 70 && c[scoreKey] < 85).length}</div>
          <div className="text-xs text-muted-foreground">Needs Attention (70-84)</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-danger">{components.filter(c => c[scoreKey] < 70).length}</div>
          <div className="text-xs text-muted-foreground">At Risk (&lt;70)</div>
        </Card>
      </div>
    </div>
  );
};
