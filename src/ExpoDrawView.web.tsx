import * as React from 'react';

import { ExpoDrawViewProps } from './ExpoDraw.types';

export default function ExpoDrawView(props: ExpoDrawViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
