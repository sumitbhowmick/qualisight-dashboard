import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { CategoryData } from '@/lib/mockData';

interface MaturityRadarProps {
  categories: CategoryData[];
}

export const MaturityRadar = ({ categories }: MaturityRadarProps) => {
  const data = categories.map((cat) => ({
    category: cat.name,
    score: cat.score,
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis 
          dataKey="category" 
          tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
        />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
        <Radar
          name="Maturity Score"
          dataKey="score"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.3}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};
