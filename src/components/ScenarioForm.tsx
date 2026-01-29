import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PROTOCOL_LIST } from '@/lib/protocols';
import type { Scenario, FileSizeUnit, ProtocolId } from '@/types/scenario';

interface ScenarioFormProps {
  onSubmit: (scenario: Omit<Scenario, 'id'>) => void;
}

const FILE_SIZE_UNITS: FileSizeUnit[] = ['KB', 'MB', 'GB'];

export function ScenarioForm({ onSubmit }: ScenarioFormProps) {
  const [name, setName] = useState('');
  const [fileSizeValue, setFileSizeValue] = useState('2');
  const [fileSizeUnit, setFileSizeUnit] = useState<FileSizeUnit>('GB');
  const [bandwidthMbps, setBandwidthMbps] = useState('500');
  const [latencyMs, setLatencyMs] = useState('55');
  const [protocolId, setProtocolId] = useState<ProtocolId>('smb2');
  const [concurrentUsers, setConcurrentUsers] = useState('1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const scenario: Omit<Scenario, 'id'> = {
      name: name.trim() || `Scenario ${Date.now()}`,
      fileSizeValue: parseFloat(fileSizeValue) || 1,
      fileSizeUnit,
      bandwidthMbps: parseFloat(bandwidthMbps) || 100,
      latencyMs: parseFloat(latencyMs) || 10,
      protocolId,
      concurrentUsers: parseInt(concurrentUsers) || 1,
    };
    
    onSubmit(scenario);
    setName('');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Add Scenario</CardTitle>
        <CardDescription>Configure a file transfer scenario to compare</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Office WAN"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fileSize" className="text-sm">File Size</Label>
              <div className="flex gap-1.5">
                <Input
                  id="fileSize"
                  type="number"
                  min="0.01"
                  step="any"
                  value={fileSizeValue}
                  onChange={(e) => setFileSizeValue(e.target.value)}
                  className="flex-1 h-9"
                />
                <Select value={fileSizeUnit} onValueChange={(v) => setFileSizeUnit(v as FileSizeUnit)}>
                  <SelectTrigger className="w-18 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FILE_SIZE_UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bandwidth" className="text-sm">Bandwidth (Mbps)</Label>
              <Input
                id="bandwidth"
                type="number"
                min="1"
                step="any"
                value={bandwidthMbps}
                onChange={(e) => setBandwidthMbps(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="latency" className="text-sm">Latency (ms)</Label>
              <Input
                id="latency"
                type="number"
                min="0"
                step="any"
                value={latencyMs}
                onChange={(e) => setLatencyMs(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="protocol" className="text-sm">Protocol</Label>
              <Select value={protocolId} onValueChange={(v) => setProtocolId(v as ProtocolId)}>
                <SelectTrigger id="protocol" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROTOCOL_LIST.map((protocol) => (
                    <SelectItem key={protocol.id} value={protocol.id}>
                      {protocol.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="users" className="text-sm">Users</Label>
              <Input
                id="users"
                type="number"
                min="1"
                step="1"
                value={concurrentUsers}
                onChange={(e) => setConcurrentUsers(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
