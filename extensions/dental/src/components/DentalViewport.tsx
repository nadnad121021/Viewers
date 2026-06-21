import React from 'react';
import { useSystem } from '@ohif/core';
import { OHIFCornerstoneViewport } from '@ohif/extension-cornerstone';
import { useDentalState } from '../state/DentalStateContext';

function BitewingPlaceholder({ title, subtitle }) {
  return (
    <div className="flex h-full w-full items-center justify-center border border-dashed border-border bg-background">
      <div className="rounded-2xl border border-border bg-card px-6 py-5 text-center shadow-sm">
        <div className="text-primary mx-auto text-3xl">▧</div>
        <div className="mt-3 text-lg font-semibold text-foreground">{title}</div>
        <div className="text-muted-foreground mt-1 text-sm">{subtitle}</div>
      </div>
    </div>
  );
}

function DentalViewport(props) {
  const { servicesManager, commandsManager } = useSystem();
  const { state } = useDentalState();

  const { displaySets = [], viewportOptions = {} } = props;
  const customProps = viewportOptions?.customViewportProps || {};
  const validDisplaySets = (displaySets || []).filter(Boolean);
  const isPlaceholder =
  customProps.isDentalPlaceholder ||
  !validDisplaySets.length ||
  viewportOptions?.viewportId?.includes('Placeholder');


  if (isPlaceholder) {
    return (
      <BitewingPlaceholder
        title={customProps.placeholderTitle || 'Bitewing Placeholder'}
        subtitle={customProps.placeholderSubtitle || 'Supplemental dental view placeholder.'}
      />
    );
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-2 top-2 z-10 rounded bg-black/60 px-2 py-1 text-xs text-white">
        {customProps.placeholderTitle || 'Current Image'}
      </div>

      <div className="absolute right-2 top-2 z-10 rounded bg-primary/80 px-2 py-1 text-xs text-white">
        Tooth {state.selectedTooth}
      </div>

      <OHIFCornerstoneViewport
        {...props}
        servicesManager={servicesManager}
        commandsManager={commandsManager}
        displaySets={validDisplaySets}
        viewportOptions={viewportOptions}
      />
    </div>
  );
}

export default DentalViewport;
