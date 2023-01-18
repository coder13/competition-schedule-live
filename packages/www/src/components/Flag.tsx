// This file exists becausee we're supposed to import this code "once"

import React from 'react';
import FlagIconFactory, { FlagIconProps } from 'react-flag-icon-css';

const FlagIcon = FlagIconFactory(React, { useCssModules: false });

function Flag({ ...props }: FlagIconProps) {
  return <FlagIcon {...props} />;
}

export default Flag;
