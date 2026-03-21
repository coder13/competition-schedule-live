// This file exists becausee we're supposed to import this code "once"

import React from 'react';
import FlagIconFactory, { FlagIconProps } from 'react-flag-icon-css';

const RawFlagIcon = FlagIconFactory(React, { useCssModules: false });
const FlagIcon = RawFlagIcon as React.ComponentType<FlagIconProps>;

function Flag({ ...props }: FlagIconProps) {
  return <FlagIcon {...props} />;
}

export default Flag;
