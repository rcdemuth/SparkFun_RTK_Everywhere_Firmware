import React from 'react';
import { BoardDefinition, GnssChipDefinition, SystemConfiguration } from '../types/config';
import { MultiDisplaySimulator } from './MultiDisplaySimulator';

interface Props {
  selectedBoard: BoardDefinition;
  selectedGnss: GnssChipDefinition;
  config: SystemConfiguration;
  onChangeConfig: (newConfig: SystemConfiguration) => void;
}

export const CydTouchSimulator: React.FC<Props> = (props) => {
  return <MultiDisplaySimulator {...props} />;
};

export default CydTouchSimulator;
