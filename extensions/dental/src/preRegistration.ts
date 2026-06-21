import type { Types } from '@ohif/core';
import { sameAs } from './getHangingProtocolModule';

export default function preRegistration({ servicesManager }: Types.Extensions.ExtensionParams) {
  const { hangingProtocolService } = servicesManager.services;
  hangingProtocolService.addCustomAttribute('sameAs', 'Compare a matched display set attribute', sameAs);
}
