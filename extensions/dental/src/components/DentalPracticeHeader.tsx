import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Icons } from '@ohif/ui-next';
import { Toolbar, usePatientInfo } from '@ohif/extension-default';
import { useSystem } from '@ohif/core';
import { preserveQueryParameters } from '@ohif/app';
import { useDentalState } from '../state/DentalStateContext';
import { DENTAL_NUMBERING_SYSTEMS, getToothOptions } from '../data/teeth';
import DentalMeasurementPaletteDialog from './DentalMeasurementPaletteDialog';

const PRACTICE_NAME = 'Danilo Alingasa - Practice Dental Mode';

function DentalPracticeHeader() {
  const { servicesManager, commandsManager  } = useSystem();
  const { uiDialogService } = servicesManager.services;
  const { patientInfo, isMixedPatients } = usePatientInfo();
  const { state, setTheme, setNumberingSystem, setSelectedTooth, setActivePreset } = useDentalState();
  const navigate = useNavigate();
  const location = useLocation();

  const onClickReturnButton = () => {
    const { pathname } = location;
    const dataSourceIdx = pathname.indexOf('/', 1);

    const searchQuery = new URLSearchParams();
    preserveQueryParameters(searchQuery);

    if (dataSourceIdx !== -1) {
      searchQuery.append('datasources', pathname.substring(dataSourceIdx + 1));
    }

    navigate({
      pathname: '/',
      search: decodeURIComponent(searchQuery.toString()),
    });
  };

  const openMeasurements = () => {
    uiDialogService.show({
      id: 'dental-measurements-palette',
      title: 'Measurements',
      content: DentalMeasurementPaletteDialog,
      contentProps: {
        commandsManager,
        // onActivatePreset: preset => setActivePreset(preset),
         activePreset: state.activePreset,
         selectedTooth: state.selectedTooth,
         onActivatePreset: preset => setActivePreset(preset),
      },
    });
  };

  const toothOptions = getToothOptions(state.numberingSystem);

  return (
    <div className="border-border bg-background/95 text-foreground shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClickReturnButton}
            className="hover:bg-muted"
          >
            <Icons.ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
              Practice
            </div>
            <div className="truncate text-lg font-semibold text-foreground">{PRACTICE_NAME}</div>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-border bg-card px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Patient
            </div>
            <div className="text-sm font-medium text-foreground">
              {isMixedPatients ? 'Multiple patients' : patientInfo.PatientName || 'Unknown patient'}
            </div>
            <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
              <span>{patientInfo.PatientID || 'No ID'}</span>
              <span>{patientInfo.PatientSex || 'Sex n/a'}</span>
              <span>{patientInfo.PatientDOB || 'DOB n/a'}</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Tooth selector
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <select
                value={state.numberingSystem}
                onChange={event => {
                  const numberingSystem = event.target.value as (typeof DENTAL_NUMBERING_SYSTEMS)[number];
                  setNumberingSystem(numberingSystem);
                  const nextTooth = getToothOptions(numberingSystem)[0];
                  setSelectedTooth(nextTooth);
                }}
                className="border-input bg-background text-foreground h-8 rounded-md border px-2 text-sm outline-none"
              >
                {DENTAL_NUMBERING_SYSTEMS.map(system => (
                  <option
                    key={system}
                    value={system}
                  >
                    {system}
                  </option>
                ))}
              </select>
              <select
                value={state.selectedTooth}
                onChange={event => setSelectedTooth(event.target.value)}
                className="border-input bg-background text-foreground h-8 min-w-[110px] rounded-md border px-2 text-sm outline-none"
              >
                {toothOptions.map(tooth => (
                  <option
                    key={tooth}
                    value={tooth}
                  >
                    Tooth {tooth}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setTheme(state.theme === 'warm' ? 'clinical' : 'warm')}
          >
            {/* <Icons.Sun className="mr-2 h-4 w-4" /> */}
            {state.theme === 'warm' ? 'Warm theme' : 'Clinical theme'}
          </Button>

          <Button onClick={openMeasurements}>
            {/* <Icons.Measure className="mr-2 h-4 w-4" /> */}
            Measurements
          </Button>
        </div>
      </div>

      {/* <div className="border-t border-border px-4 py-2">
        <Toolbar buttonSection="primary" />
      </div> */}
    </div>
  );
}

export default DentalPracticeHeader;
