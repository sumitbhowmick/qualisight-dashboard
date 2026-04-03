import { TrendingUp } from 'lucide-react';

interface QMIScoreProps {
  score: number;
  trend: number;
  label?: string;
  className?: string;
}

export const QMIScore = ({ score, trend, className = '' }: QMIScoreProps) => {
  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="hsl(var(--border))"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke={score >= 80 ? 'hsl(var(--success))' : score >= 60 ? 'hsl(var(--warning))' : 'hsl(var(--danger))'}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-bold ${getScoreColor(score)}`}>
            {score.toFixed(1)}%
          </span>
          <span className="text-sm text-muted-foreground mt-1">Quality Index</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <TrendingUp className="w-4 h-4 text-success" />
        <span className="text-sm text-success font-medium">
          +{trend.toFixed(1)}% from last month
        </span>
      </div>
    </div>
  );
};
