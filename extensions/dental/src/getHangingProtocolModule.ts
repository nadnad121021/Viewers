import { Types } from '@ohif/core';

const sameAs = function (displaySet, options) {
  const { sameAttribute, sameDisplaySetId } = this;
  if (!sameAttribute || !sameDisplaySetId) {
    return false;
  }

  const { displaySetMatchDetails, displaySets } = options;
  const match = displaySetMatchDetails.get(sameDisplaySetId);
  if (!match) {
    return false;
  }

  const { displaySetInstanceUID } = match;
  const referenceDisplaySet = displaySets.find(it => it.displaySetInstanceUID === displaySetInstanceUID);
  if (!referenceDisplaySet) {
    return false;
  }

  return referenceDisplaySet[sameAttribute] === displaySet[sameAttribute];
};

const currentDisplaySetSelector = {
  studyMatchingRules: [
    {
      attribute: 'studyInstanceUIDsIndex',
      from: 'options',
      required: true,
      constraint: {
        equals: { value: 0 },
      },
    },
  ],
  seriesMatchingRules: [
    {
      attribute: 'numImageFrames',
      constraint: {
        greaterThan: { value: 0 },
      },
    },
  ],
};

const priorDisplaySetSelector = {
  studyMatchingRules: [
    {
      attribute: 'studyInstanceUIDsIndex',
      from: 'options',
      required: true,
      constraint: {
        equals: { value: 1 },
      },
    },
  ],
  seriesMatchingRules: [
    {
      attribute: 'sameAs',
      sameAttribute: 'Modality',
      sameDisplaySetId: 'currentDisplaySetId',
      required: true,
      constraint: {
        equals: {
          value: true,
        },
      },
    },
    {
      attribute: 'numImageFrames',
      constraint: {
        greaterThan: { value: 0 },
      },
    },
  ],
};

const currentViewport = {
  viewportOptions: {
    toolGroupId: 'default',
    allowUnmatchedView: true,
  },
  displaySets: [
    {
      id: 'currentDisplaySetId',
    },
  ],
};

const priorViewport = {
  viewportOptions: {
    toolGroupId: 'default',
    allowUnmatchedView: true,
  },
  displaySets: [
    {
      id: 'priorDisplaySetId',
    },
  ],
};

const bitewingTopLeft = {
  ...currentViewport,
  viewportOptions: {
    ...currentViewport.viewportOptions,
    viewportId: 'bitewingCurrent',
    customViewportProps: {
      placeholderTitle: 'Current image',
      placeholderSubtitle: 'Current dental image or series.',
    },
  },
};

const bitewingTopRight = {
  ...currentViewport,
  viewportOptions: {
    ...currentViewport.viewportOptions,
    viewportId: 'bitewingPrior',
    customViewportProps: {
      placeholderTitle: 'Prior exam',
      placeholderSubtitle: 'Same modality prior exam or demo comparison view.',
    },
  },
};

const bitewingBottomLeft = {
  ...currentViewport,
  viewportOptions: {
    ...currentViewport.viewportOptions,
    viewportId: 'bitewingPlaceholderLeft',
    customViewportProps: {
      isDentalPlaceholder: true,
      placeholderTitle: 'Bitewing Placeholder - Left',
      placeholderSubtitle: 'Supplemental bitewing view placeholder.',
    },
  },
};

const bitewingBottomRight = {
  ...currentViewport,
  viewportOptions: {
    ...currentViewport.viewportOptions,
    viewportId: 'bitewingPlaceholderRight',
    customViewportProps: {
      isDentalPlaceholder: true,
      placeholderTitle: 'Bitewing Placeholder - Right',
      placeholderSubtitle: 'Supplemental bitewing view placeholder.',
    },
  },
};

const dentalProtocol: Types.HangingProtocol.Protocol = {
  id: 'dental-compare',
  description: 'Dental 2x2 comparison layout',
  name: 'dental-compare',
  numberOfPriorsReferenced: 1,
  protocolMatchingRules: [
    {
      id: 'Two Studies',
      weight: 1000,
      attribute: 'StudyInstanceUID',
      from: 'prior',
      required: true,
      constraint: {
        notNull: true,
      },
    },
  ],
  toolGroupIds: ['default'],
  displaySetSelectors: {
    currentDisplaySetId: currentDisplaySetSelector,
    priorDisplaySetId: priorDisplaySetSelector,
  },
  defaultViewport: {
    viewportOptions: {
      viewportType: 'stack',
      toolGroupId: 'default',
      allowUnmatchedView: true,
    },
    displaySets: [
      {
        id: 'currentDisplaySetId',
        matchedDisplaySetsIndex: -1,
      },
    ],
  },
  stages: [
    {
      name: 'Dental 2x2',
      viewportStructure: {
        layoutType: 'grid',
        properties: {
          rows: 2,
          columns: 2,
        },
      },
      viewports: [bitewingTopLeft, bitewingTopRight, bitewingBottomLeft, bitewingBottomRight],
    },
  ],
};

function getHangingProtocolModule() {
  return [
    {
      name: dentalProtocol.id,
      protocol: dentalProtocol,
    },
  ];
}

export default getHangingProtocolModule;
export { sameAs, dentalProtocol };
