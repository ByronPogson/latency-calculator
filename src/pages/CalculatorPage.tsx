import { useScenarios } from '@/hooks/useScenarios';
import { ScenarioForm } from '@/components/ScenarioForm';
import { ScenarioTable } from '@/components/ScenarioTable';
import { ComparisonChart } from '@/components/ComparisonChart';

export function CalculatorPage() {
  const { scenarios, addScenario, deleteScenario, reorderScenarios } = useScenarios();

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Latency Calculator
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Compare file transfer times across different network scenarios and protocols
        </p>
      </div>

      <ScenarioForm onSubmit={addScenario} />

      <ScenarioTable 
        scenarios={scenarios} 
        onDelete={deleteScenario} 
        onReorder={reorderScenarios}
      />

      <ComparisonChart scenarios={scenarios} />
    </div>
  );
}
