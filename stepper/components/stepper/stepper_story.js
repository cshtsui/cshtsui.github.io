import React from 'react';
import { storiesOf } from '@storybook/react';
import { array, boolean, number, object, withKnobs } from '@storybook/addon-knobs';
import { withInfo } from '@storybook/addon-info';
import Stepper from './stepper.jsx';

//See Select Menu options
const defaultOptions = [
  {
    step: '1',
    label: 'Rank and Confirm List',
  },
  {
    step: '2',
    label: 'Credentialing Status',
  },
  {
    step: '3',
    label: 'Current Remittance Method',
  },
  {
    step: '4',
    label: 'Current Payment Method',
  },
  {
    step: '5',
    label: 'Review Submission',
  },
];

storiesOf('Stepper', module)
  .addDecorator(withKnobs)
  .add(
    'Example',
    withInfo('Stepper component')(() => (
      <Stepper
        selectedIndex={number('selectedIndex', 0)}
        maxWidth={number("maxWidth",640)}
        completed={array("completed",[])}
        options={object("options",defaultOptions)}
        onStepClick={(i)=> { 
          console.info("[onStepClick callback] index="+i.index+",step="+i.step+",label="+i.label);
        }}
      />
    ))
  );
