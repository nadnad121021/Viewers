import update from 'immutability-helper';
import { ToolbarService } from '@ohif/core';
import { id } from './id';
import {
  modeInstance as basicModeInstance,
  toolbarButtons,
  toolbarSections,
  extensionDependencies as basicExtensionDependencies,
  sopClassHandlers,
  isValidMode,
  NON_IMAGE_MODALITIES,
  onModeExit as basicOnModeExit,
  onModeEnter as basicOnModeEnter,
} from '@ohif/mode-basic';

const { TOOLBAR_SECTIONS } = ToolbarService;

const dentalExtensionDependencies = {
  ...basicExtensionDependencies,
  '@ohif/extension-dental': '^3.13.0-beta.95',
};

const dentalRoute = {
  path: 'dental',
  layoutTemplate: () => ({
    id: '@ohif/extension-dental.layoutTemplateModule.viewerDentalLayout',
    props: {
      leftPanels: ['@ohif/extension-default.panelModule.seriesList'],
      leftPanelResizable: true,
      leftPanelClosed: true,
      rightPanels: [
        '@ohif/extension-dental.panelModule.dentalMeasurementsPanel',
      ],
      rightPanelClosed: false,
      rightPanelResizable: true,
      viewports: [
        {
          namespace: '@ohif/extension-dental.viewportModule.dentalCornerstone',
          displaySetsToDisplay: [
            '@ohif/extension-default.sopClassHandlerModule.stack',
          ],
        },
      ],
    },
  }),
};

const dentalModeInstance = {
  ...basicModeInstance,
  id,
  routeName: 'dental',
  displayName: 'Dental Mode',
  hide: false,
  routes: [dentalRoute],
  extensions: dentalExtensionDependencies,
  // hangingProtocol: '@ohif/extension-dental.hangingProtocolModule.dental-compare',
  hangingProtocol: 'dental-compare',
  toolbarButtons,
  toolbarSections,
  // toolbarSections: {
  //   ...toolbarSections,
  //   [TOOLBAR_SECTIONS.primary]: [
  //     'MeasurementTools',
  //     'Zoom',
  //     'Pan',
  //     'TrackballRotate',
  //     'WindowLevel',
  //     'Capture',
  //     'Layout',
  //     'Crosshairs',
  //     'MoreTools',
  //   ],
  //   MeasurementTools: ['Length', 'Bidirectional', 'ArrowAnnotate', 'EllipseROI', 'RectangleROI', 'CircleROI'],
  // },
  activatePanelTrigger: true,
  isValidMode,
  nonModeModalities: NON_IMAGE_MODALITIES,
  onModeEnter(args) {
     try {
      basicOnModeEnter.call(this, args);
    } catch (error) {
      console.warn('Skipped some basic mode setup:', error);
    }
  },
  onModeExit(args) {
    basicOnModeExit.call(this, args);
  },
};

function modeFactory({ modeConfiguration }) {
  let modeInstance = dentalModeInstance;
  if (modeConfiguration) {
    modeInstance = update(modeInstance, modeConfiguration);
  }
  return modeInstance;
}

const mode = {
  id,
  modeFactory,
  modeInstance: { ...dentalModeInstance, hide: true },
  extensionDependencies: dentalExtensionDependencies,
};

export default mode;
