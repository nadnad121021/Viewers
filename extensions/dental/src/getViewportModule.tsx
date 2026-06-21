import React from 'react';
import DentalViewport from './components/DentalViewport';

export default function getViewportModule() {
  return [
    {
      name: 'dentalCornerstone',
      component: props => <DentalViewport {...props} />,
    },
  ];
}
