import { useState } from 'react';
import { Trash2, Info, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getProtocol } from '@/lib/protocols';
import { formatTime, getCalculationBreakdown } from '@/lib/calculator';
import type { ScenarioWithResult } from '@/types/scenario';

interface ScenarioTableProps {
  scenarios: ScenarioWithResult[];
  onDelete: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
}

function CalculationTooltip({ scenario }: { scenario: ScenarioWithResult }) {
  const steps = getCalculationBreakdown(scenario, scenario.result);
  
  return (
    <div className="space-y-2 text-sm">
      <p className="font-semibold border-b pb-1 mb-2">Calculation for "{scenario.name}"</p>
      {steps.map((step, index) => (
        <div key={index} className="grid grid-cols-[120px,1fr,auto] gap-2 items-baseline">
          <span className="text-muted-foreground">{step.label}</span>
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{step.formula}</code>
          <span className="font-mono tabular-nums font-medium">{step.value}</span>
        </div>
      ))}
    </div>
  );
}

interface SortableRowProps {
  scenario: ScenarioWithResult;
  onDelete: (id: string) => void;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
}

function SortableRow({ scenario, onDelete, isExpanded, onToggleExpand }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scenario.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      <TableRow ref={setNodeRef} style={style} className={isDragging ? 'bg-muted' : ''}>
        <TableCell className="w-[40px]">
          <button
            className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </TableCell>
        <TableCell className="font-medium">{scenario.name}</TableCell>
        <TableCell className="tabular-nums">
          {scenario.fileSizeValue} {scenario.fileSizeUnit}
        </TableCell>
        <TableCell className="tabular-nums">{scenario.bandwidthMbps} Mbps</TableCell>
        <TableCell className="tabular-nums">{scenario.latencyMs} ms</TableCell>
        <TableCell>{getProtocol(scenario.protocolId).name}</TableCell>
        <TableCell className="text-right tabular-nums text-sky-600 dark:text-sky-400">
          {formatTime(scenario.result.baseTransferTime)}
        </TableCell>
        <TableCell className="text-right tabular-nums text-yellow-600 dark:text-yellow-400">
          +{formatTime(scenario.result.latencyOverhead)}
        </TableCell>
        <TableCell className="text-right tabular-nums font-semibold">
          {formatTime(scenario.result.totalTime)}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleExpand(scenario.id)}
                  className={`h-8 w-8 ${isExpanded ? 'text-foreground bg-muted' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-md p-3 hidden md:block">
                <CalculationTooltip scenario={scenario} />
              </TooltipContent>
            </Tooltip>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(scenario.id)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          <TableCell colSpan={10} className="py-3 px-4">
            <CalculationTooltip scenario={scenario} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function ScenarioTable({ scenarios, onDelete, onReorder }: ScenarioTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string);
    }
  };

  if (scenarios.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Scenario Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <svg
                className="h-6 w-6 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-muted-foreground">No scenarios added yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Add a scenario above to start comparing transfer times
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Scenario Details</CardTitle>
          <CardDescription>
            {scenarios.length} scenario{scenarios.length !== 1 ? 's' : ''} configured • Drag to reorder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">File Size</TableHead>
                    <TableHead className="font-semibold">Bandwidth</TableHead>
                    <TableHead className="font-semibold">Latency</TableHead>
                    <TableHead className="font-semibold">Protocol</TableHead>
                    <TableHead className="font-semibold text-right">Base Time</TableHead>
                    <TableHead className="font-semibold text-right">Overhead</TableHead>
                    <TableHead className="font-semibold text-right">Total</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={scenarios.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {scenarios.map((scenario) => (
                      <SortableRow
                        key={scenario.id}
                        scenario={scenario}
                        onDelete={onDelete}
                        isExpanded={expandedId === scenario.id}
                        onToggleExpand={handleToggleExpand}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
