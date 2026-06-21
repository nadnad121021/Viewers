import { Types } from '@ohif/core';
import { id } from './id';
import preRegistration from './preRegistration';
import getLayoutTemplateModule from './getLayoutTemplateModule';
import getPanelModule from './getPanelModule';
import getViewportModule from './getViewportModule';
import getHangingProtocolModule from './getHangingProtocolModule';

const dentalExtension: Types.Extensions.Extension = {
  id,
  preRegistration,
  getLayoutTemplateModule,
  getPanelModule,
  getViewportModule,
  getHangingProtocolModule,
};

export default dentalExtension;
