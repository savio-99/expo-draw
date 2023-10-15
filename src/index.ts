import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to ExpoDraw.web.ts
// and on native platforms to ExpoDraw.ts
import ExpoDrawModule from './ExpoDrawModule';
import ExpoDrawView from './ExpoDrawView';
import { ChangeEventPayload, ExpoDrawViewProps } from './ExpoDraw.types';

// Get the native constant value.
export const PI = ExpoDrawModule.PI;

export function hello(): string {
  return ExpoDrawModule.hello();
}

export async function setValueAsync(value: string) {
  return await ExpoDrawModule.setValueAsync(value);
}

const emitter = new EventEmitter(ExpoDrawModule ?? NativeModulesProxy.ExpoDraw);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export { ExpoDrawView, ExpoDrawViewProps, ChangeEventPayload };
