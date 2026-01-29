import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Scenario } from '@/types/scenario';

interface ImportDialogProps {
  open: boolean;
  scenarios: Scenario[];
  onImport: (replace: boolean) => void;
  onCancel: () => void;
}

export function ImportDialog({ open, scenarios, onImport, onCancel }: ImportDialogProps) {
  const count = scenarios.length;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Shared Scenarios</DialogTitle>
          <DialogDescription>
            This link contains {count} scenario{count !== 1 ? 's' : ''}. 
            How would you like to import them?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-2">
          <p className="text-sm text-muted-foreground">Scenarios to import:</p>
          <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
            {scenarios.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="font-medium">{s.name}</span>
                <span className="text-muted-foreground">
                  ({s.fileSizeValue} {s.fileSizeUnit}, {s.bandwidthMbps} Mbps, {s.latencyMs}ms)
                </span>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={() => onImport(false)}>
            Add to Existing
          </Button>
          <Button onClick={() => onImport(true)}>
            Replace All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
