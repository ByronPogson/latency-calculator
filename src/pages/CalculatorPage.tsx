import { useState, useEffect } from 'react';
import { useScenarios } from '@/hooks/useScenarios';
import { ScenarioForm } from '@/components/ScenarioForm';
import { ScenarioTable } from '@/components/ScenarioTable';
import { ComparisonChart } from '@/components/ComparisonChart';
import { ShareButton } from '@/components/ShareButton';
import { ImportDialog } from '@/components/ImportDialog';
import { getEncodedFromUrl, decodeScenarios, clearUrlParam } from '@/lib/urlSharing';
import type { Scenario } from '@/types/scenario';

export function CalculatorPage() {
  const { scenarios, addScenario, deleteScenario, reorderScenarios, importScenarios } = useScenarios();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<Scenario[] | null>(null);

  // Check URL for shared scenarios on mount
  useEffect(() => {
    const encoded = getEncodedFromUrl();
    if (encoded) {
      const decoded = decodeScenarios(encoded);
      if (decoded && decoded.length > 0) {
        // If no existing scenarios, just import directly
        if (scenarios.length === 0) {
          importScenarios(decoded, true);
          clearUrlParam();
        } else {
          // Otherwise ask user what to do
          setPendingImport(decoded);
          setImportDialogOpen(true);
        }
      } else {
        // Invalid data, just clear the param
        clearUrlParam();
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImport = (replace: boolean) => {
    if (pendingImport) {
      importScenarios(pendingImport, replace);
    }
    setImportDialogOpen(false);
    setPendingImport(null);
    clearUrlParam();
  };

  const handleCancelImport = () => {
    setImportDialogOpen(false);
    setPendingImport(null);
    clearUrlParam();
  };

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

      <div className="flex justify-end">
        <ShareButton scenarios={scenarios} />
      </div>

      <ScenarioForm onSubmit={addScenario} />

      <ScenarioTable 
        scenarios={scenarios} 
        onDelete={deleteScenario} 
        onReorder={reorderScenarios}
      />

      <ComparisonChart scenarios={scenarios} />

      <ImportDialog
        open={importDialogOpen}
        scenarios={pendingImport ?? []}
        onImport={handleImport}
        onCancel={handleCancelImport}
      />
    </div>
  );
}
