import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCalculationBreakdown } from '@/lib/calculator';
import type { ScenarioWithResult } from '@/types/scenario';

interface CalculationBreakdownProps {
  scenario: ScenarioWithResult;
}

export function CalculationBreakdown({ scenario }: CalculationBreakdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const steps = getCalculationBreakdown(scenario, scenario.result);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group w-full text-left py-1">
        <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        <span>How is <span className="font-medium text-foreground">"{scenario.name}"</span> calculated?</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 ml-6">
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="space-y-2.5">
            {steps.map((step, index) => (
              <div
                key={index}
                className="grid grid-cols-[140px,1fr,auto] gap-3 text-sm items-baseline"
              >
                <span className="font-medium text-muted-foreground">{step.label}</span>
                <code className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded font-mono">
                  {step.formula}
                </code>
                <span className="font-mono text-right tabular-nums font-medium">{step.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface CalculationBreakdownListProps {
  scenarios: ScenarioWithResult[];
}

export function CalculationBreakdownList({ scenarios }: CalculationBreakdownListProps) {
  if (scenarios.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Calculation Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {scenarios.map((scenario) => (
          <CalculationBreakdown key={scenario.id} scenario={scenario} />
        ))}
      </CardContent>
    </Card>
  );
}
