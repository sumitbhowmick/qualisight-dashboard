import { Card } from '@/components/ui/card';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CategoryData } from '@/lib/mockData';
import { Progress } from '@/components/ui/progress';

interface CategoryCardProps {
  category: CategoryData;
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
  const navigate = useNavigate();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-danger';
  };

  const criticalKpis = category.kpis.filter((k) => k.status === 'critical').length;
  const warningKpis = category.kpis.filter((k) => k.status === 'warning').length;
  const goodKpis = category.kpis.filter((k) => k.status === 'good').length;

  return (
    <Card
      onClick={() => navigate(`/category/${category.id}`)}
      className="p-6 cursor-pointer transition-all hover:shadow-lg hover:border-primary group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {category.description}
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <div className={`text-3xl font-bold ${getScoreColor(category.score)}`}>
            {category.score}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Weight: {category.weight}%
          </div>
        </div>
      </div>

      <div className="mb-4">
        <Progress 
          value={category.score} 
          className="h-2"
        />
      </div>

      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-success"></div>
          <span className="text-muted-foreground">{goodKpis} Good</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-warning"></div>
          <span className="text-muted-foreground">{warningKpis} Warning</span>
        </div>
        {criticalKpis > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-danger"></div>
            <span className="text-muted-foreground">{criticalKpis} Critical</span>
          </div>
        )}
      </div>
    </Card>
  );
};
