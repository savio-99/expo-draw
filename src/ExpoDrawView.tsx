import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { ExpoDrawViewProps } from './ExpoDraw.types';

const NativeView: React.ComponentType<ExpoDrawViewProps> =
  requireNativeViewManager('ExpoDraw');

export default function ExpoDrawView(props: ExpoDrawViewProps) {
  return <NativeView {...props} />;
}
