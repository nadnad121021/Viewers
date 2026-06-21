import DentalViewerLayout from './DentalLayout';

export default function getLayoutTemplateModule({ servicesManager, extensionManager, commandsManager, hotkeysManager }) {
  function DentalViewerLayoutWithServices(props) {
    return DentalViewerLayout({
      servicesManager,
      extensionManager,
      commandsManager,
      hotkeysManager,
      ...props,
    });
  }

  return [
    {
      name: 'viewerDentalLayout',
      id: 'viewerDentalLayout',
      component: DentalViewerLayoutWithServices,
    },
  ];
}
