import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatTime } from '@/lib/calculator';
import type { ScenarioWithResult } from '@/types/scenario';

interface ComparisonChartProps {
  scenarios: ScenarioWithResult[];
}

interface ChartDataItem {
  name: string;
  baseTime: number;
  overhead: number;
  total: number;
}

interface TooltipPayloadItem {
  dataKey: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const baseTime = payload.find((p) => p.dataKey === 'baseTime')?.value ?? 0;
    const overhead = payload.find((p) => p.dataKey === 'overhead')?.value ?? 0;
    const total = baseTime + overhead;

    return (
      <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold mb-2">{label}</p>
        <div className="space-y-1.5">
          <p className="flex justify-between gap-6">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#3a9bdc' }}></span>
              Base Transfer:
            </span>
            <span className="font-mono tabular-nums">{formatTime(baseTime)}</span>
          </p>
          <p className="flex justify-between gap-6">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#f7dc6f' }}></span>
              Latency Overhead:
            </span>
            <span className="font-mono tabular-nums">{formatTime(overhead)}</span>
          </p>
          <hr className="border-border" />
          <p className="flex justify-between gap-6 font-semibold">
            <span>Total:</span>
            <span className="font-mono tabular-nums">{formatTime(total)}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
}

export function ComparisonChart({ scenarios }: ComparisonChartProps) {
  if (scenarios.length === 0) {
    return null;
  }

  const data: ChartDataItem[] = scenarios.map((s) => ({
    name: s.name,
    baseTime: s.result.baseTransferTime,
    overhead: s.result.latencyOverhead,
    total: s.result.totalTime,
  }));

  const maxTime = Math.max(...data.map((d) => d.total));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Transfer Time Comparison</CardTitle>
        <CardDescription>
          Stacked bars show base transfer time vs. latency overhead
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            barCategoryGap="20%"
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="hsl(var(--border))"
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              interval={0}
              angle={scenarios.length > 4 ? -45 : 0}
              textAnchor={scenarios.length > 4 ? 'end' : 'middle'}
              height={scenarios.length > 4 ? 80 : 30}
            />
            <YAxis
              domain={[0, Math.ceil(maxTime * 1.1)]}
              tickFormatter={(value) => formatTime(value)}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              width={60}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: 'hsl(var(--muted))', fillOpacity: 0.3 }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: 16 }}
              formatter={(value) => (
                <span style={{ color: 'hsl(var(--foreground))', fontSize: '14px' }}>{value}</span>
              )}
              iconType="square"
              iconSize={12}
            />
            <Bar
              dataKey="baseTime"
              name="Base Transfer Time"
              stackId="a"
              radius={[0, 0, 4, 4]}
              fill="#3a9bdc"
            />
            <Bar
              dataKey="overhead"
              name="Latency Overhead"
              stackId="a"
              radius={[4, 4, 0, 0]}
              fill="#f7dc6f"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
