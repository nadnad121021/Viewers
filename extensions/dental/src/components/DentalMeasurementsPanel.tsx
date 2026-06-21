import React, { useEffect, useMemo, useState } from 'react';
import { Button, Icons } from '@ohif/ui-next';
import { useSystem } from '@ohif/core';
import { useMeasurements } from '@ohif/extension-cornerstone';
import { useDentalState } from '../state/DentalStateContext';
import { dentalMeasurementPresets } from './DentalMeasurementPaletteDialog';

type SortKey = 'label' | 'toolName' | 'unit';

function serializeMeasurement(measurement) {
  return {
    uid: measurement.uid,
    label: measurement.label,
    toolName: measurement.toolName,
    unit: measurement.unit,
    displayText: measurement.displayText,
    referenceStudyUID: measurement.referenceStudyUID,
    referenceSeriesUID: measurement.referenceSeriesUID,
    SOPInstanceUID: measurement.SOPInstanceUID,
    frameNumber: measurement.frameNumber,
    isLocked: measurement.isLocked,
    isVisible: measurement.isVisible,
    selected: measurement.isSelected,
    length: measurement.length,
    angle: measurement.angle,
    perimeter: measurement.perimeter,
    area: measurement.area,
    finding: measurement.finding,
    findingSites: measurement.findingSites,
    metadata: measurement.metadata,
  };
}

function downloadMeasurements(measurements, dentalState) {
  const payload = {
    exportedAt: new Date().toISOString(),
    studyType: 'Dental',
    selectedTooth: dentalState.selectedTooth,
    numberingSystem: dentalState.numberingSystem,
    activePreset: dentalState.activePreset,
    measurementCount: measurements.length,
    presets: dentalMeasurementPresets(),
    measurements: measurements.length
      ? measurements.map(measurement => ({
          ...serializeMeasurement(measurement),
          tooth: dentalState.selectedTooth,
          numberingSystem: dentalState.numberingSystem,
          dentalPreset: dentalState.activePreset,
        }))
      : dentalState.activePreset
        ? [
            {
              tooth: dentalState.selectedTooth,
              numberingSystem: dentalState.numberingSystem,
              label: dentalState.activePreset.label,
              toolName: dentalState.activePreset.toolName,
              unit: dentalState.activePreset.unit,
              status: 'preset-selected',
            },
          ]
        : [],
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `dental-measurements-tooth-${dentalState.selectedTooth}-${new Date()
    .toISOString()
    .replace(/[:.]/g, '-')}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function DentalMeasurementsPanel(): React.ReactNode {
  const { servicesManager, commandsManager } = useSystem();
  const { measurementService } = servicesManager.services;
  const measurements = useMeasurements();
  const { state, setActivePreset } = useDentalState();
  console.log("🚀 ~ DentalMeasurementsPanel ~ state:", state)
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('label');

  useEffect(() => {
    const handler = ({ measurement }: any) => {
      if (!state.activePreset || measurement.toolName !== state.activePreset.toolName) {
        return;
      }

      if (measurement.label === state.activePreset.label) {
        return;
      }

      commandsManager.runCommand('updateMeasurement', {
        uid: measurement.uid,
        textLabel: state.activePreset.label,
      });
    };

    const subscriptions = [
      measurementService.subscribe(measurementService.EVENTS.MEASUREMENT_ADDED, handler),
      measurementService.subscribe(measurementService.EVENTS.RAW_MEASUREMENT_ADDED, handler),
    ];

    return () => {
      subscriptions.forEach(({ unsubscribe }) => unsubscribe());
    };
  }, [commandsManager, measurementService, state.activePreset]);

  const filteredMeasurements = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    return [...measurements]
      .filter(measurement => {
        if (!searchTerm) {
          return true;
        }

        const haystack = [
          measurement.label,
          measurement.toolName,
          measurement.unit,
          measurement.displayText?.primary?.join(' '),
          measurement.displayText?.secondary?.join(' '),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(searchTerm);
      })
      .sort((left, right) => {
        const leftValue = String(left[sortKey] ?? '').toLowerCase();
        const rightValue = String(right[sortKey] ?? '').toLowerCase();
        return leftValue.localeCompare(rightValue);
      });
  }, [measurements, search, sortKey]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Dental measurements
            </div>
            <div className="text-lg font-semibold text-foreground">{filteredMeasurements.length} items</div>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => downloadMeasurements(measurements,state)}
          >
            Export JSON
          </Button>
        </div>

        <div className="mt-3 grid gap-2">
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Filter measurements"
            className="border-input bg-background text-foreground placeholder:text-muted-foreground h-9 rounded-md border px-3 text-sm outline-none"
          />
          <select
            value={sortKey}
            onChange={event => setSortKey(event.target.value as SortKey)}
            className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm outline-none"
          >
            <option value="label">Sort by label</option>
            <option value="toolName">Sort by tool</option>
            <option value="unit">Sort by unit</option>
          </select>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-card p-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium text-foreground">Latest preset</div>
          {state.activePreset ? (
            <div className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
              {state.activePreset.label}
            </div>
          ) : (
            <div className="text-muted-foreground text-xs">None selected</div>
          )}
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {filteredMeasurements.length ? (
            filteredMeasurements.map(measurement => (
              <button
                key={measurement.uid}
                type="button"
                className="hover:bg-muted/70 flex w-full flex-col rounded-md border border-border bg-background px-3 py-2 text-left transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-foreground">
                    {measurement.label || measurement.toolName}
                  </div>
                  <div className="text-primary text-sm font-semibold">
                    {measurement.displayText?.primary?.[0] ?? measurement.displayText?.secondary?.[0] ?? 'n/a'}
                  </div>
                </div>
                <div className="text-muted-foreground mt-1 text-xs">
                  {measurement.toolName} · {measurement.unit || 'unitless'}
                </div>
                <div className="text-muted-foreground mt-1 text-xs">
                  Tooth {state.selectedTooth} · {state.numberingSystem}
                </div>
                <div className="text-muted-foreground mt-1 text-xs">
                  {measurement.displayText?.secondary?.join(' · ') || measurement.displayText?.primary?.slice(1).join(' · ') || 'No secondary text'}
                </div>
              </button>
            ))
          ) : (
            <div className="text-muted-foreground rounded-md border border-dashed border-border p-4 text-sm">
            {state.activePreset ? (
              <div className="space-y-1">
                <div className="font-medium text-foreground">
                  Tooth {state.selectedTooth} · {state.activePreset.label}
                </div>
                <div>
                  {state.activePreset.toolName} tool · {state.activePreset.unit}
                </div>
                <div className="text-xs">
                  Draw the measurement on the image, then export JSON.
                </div>
              </div>
            ) : (
              'Dental measurements will appear here after you use a preset.'
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DentalMeasurementsPanel;
