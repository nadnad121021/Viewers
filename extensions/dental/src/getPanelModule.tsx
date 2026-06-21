import DentalMeasurementsPanel from './components/DentalMeasurementsPanel';

export default function getPanelModule() {
  return [
    {
      name: 'dentalMeasurementsPanel',
      iconName: 'ruler',
      iconLabel: 'Measurements',
      label: 'Measurements',
      component: DentalMeasurementsPanel,
    },
  ];
}
