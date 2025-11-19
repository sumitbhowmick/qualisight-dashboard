import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navigation } from '@/components/Navigation';
import { useConfig } from '@/contexts/ConfigContext';
import { categories } from '@/lib/mockData';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const KPIDataEntry = () => {
  const { categoryId, kpiId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getKPIDataPoints, addKPIDataPoint, deleteKPIDataPoint } = useConfig();

  const category = categories.find((c) => c.id === categoryId);
  const kpi = category?.kpis.find((k) => k.id === kpiId);
  const dataPoints = kpiId ? getKPIDataPoints(kpiId) : [];

  const [newDataPoint, setNewDataPoint] = useState({
    date: new Date().toISOString().split('T')[0],
    value: '',
    unit: kpi?.unit || '',
  });

  if (!category || !kpi) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">KPI Not Found</h1>
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const handleAddDataPoint = () => {
    if (!newDataPoint.value) {
      toast({
        title: 'Error',
        description: 'Please enter a value',
        variant: 'destructive',
      });
      return;
    }

    addKPIDataPoint({
      kpiId: kpi.id,
      date: newDataPoint.date,
      value: parseFloat(newDataPoint.value),
      unit: newDataPoint.unit,
    });

    toast({
      title: 'Success',
      description: 'Data point added successfully',
    });

    setNewDataPoint({
      date: new Date().toISOString().split('T')[0],
      value: '',
      unit: kpi.unit,
    });
  };

  const handleDeleteDataPoint = (date: string) => {
    deleteKPIDataPoint(kpi.id, date);
    toast({
      title: 'Success',
      description: 'Data point deleted successfully',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/category/${categoryId}`)}
            className="mb-3 sm:mb-4"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {category.name}
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{kpi.name}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Category: {category.name}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Add New Data Point */}
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Data Point</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newDataPoint.date}
                onChange={(e) =>
                  setNewDataPoint({ ...newDataPoint, date: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                placeholder="Enter value"
                value={newDataPoint.value}
                onChange={(e) =>
                  setNewDataPoint({ ...newDataPoint, value: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                type="text"
                value={newDataPoint.unit}
                onChange={(e) =>
                  setNewDataPoint({ ...newDataPoint, unit: e.target.value })
                }
              />
            </div>
          </div>
          <Button onClick={handleAddDataPoint} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Data Point
          </Button>
        </Card>

        {/* Data Points Table */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4">Historical Data</h2>
          {dataPoints.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No data points entered yet. Add your first data point above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataPoints.map((dp) => (
                    <TableRow key={`${dp.kpiId}-${dp.date}`}>
                      <TableCell>
                        {new Date(dp.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">{dp.value}</TableCell>
                      <TableCell>{dp.unit}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDataPoint(dp.date)}
                        >
                          <Trash2 className="w-4 h-4 text-danger" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default KPIDataEntry;
