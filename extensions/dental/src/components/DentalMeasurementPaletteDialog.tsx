import React from 'react';
import { Button } from '@ohif/ui-next';
import type { DentalPreset } from '../state/DentalStateContext';

const dentalPresets: DentalPreset[] = [
  { id: 'pa-length', label: 'PA length', toolName: 'Length', unit: 'mm' },
  { id: 'canal-angle', label: 'Canal angle', toolName: 'Angle', unit: '°' },
  { id: 'crown-width', label: 'Crown width', toolName: 'Length', unit: 'mm' },
  { id: 'root-length', label: 'Root length', toolName: 'Length', unit: 'mm' },
];

export function dentalMeasurementPresets() {
  return dentalPresets;
}

function DentalMeasurementPaletteDialog({
  hide,
  commandsManager,
  activePreset,
  onActivatePreset,
}) {

  return (
    <div className="space-y-4">
      <div className="text-muted-foreground text-sm">
        One-click dental measurement presets. The selected preset is used to auto-label the next
        finished measurement.
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {dentalPresets.map(preset => (
          <Button
            key={preset.id}
            variant="outline"
            className={`h-auto justify-start border px-3 py-3 text-left ${
              activePreset?.id === preset.id ? 'bg-primary/10 border-primary' : ''
            }`}
           onClick={() => {
              onActivatePreset?.(preset);
              commandsManager?.runCommand?.('setToolActive', {
                toolName: preset.toolName,
                toolGroupId: 'default',
              });
              commandsManager?.runCommand?.('setToolActive', {
                toolName: preset.toolName,
              });

              hide?.();
            }}
          >
            <div>
              <div className="font-medium text-foreground">{preset.label}</div>
              <div className="text-muted-foreground text-xs">
                {preset.toolName} tool · {preset.unit}
              </div>
            </div>
          </Button>
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" onClick={hide}>
          Close
        </Button>
      </div>
    </div>
  );
}

export default DentalMeasurementPaletteDialog;
