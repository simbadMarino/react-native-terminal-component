import * as CommandMapping from 'emulator-state/command-mapping';
import * as EnvironmentVariables from 'emulator-state/environment-variables';
import * as FileSystem from 'emulator-state/file-system';
import * as History from 'emulator-state/history';
import * as Outputs from 'emulator-state/outputs';
import EmulatorState from 'emulator-state/EmulatorState';

/*export default {
  EmulatorState,
  CommandMapping,
  EnvironmentVariables,
  FileSystem,
  History,
  Outputs
};*/

export * as CommandMapping from 'emulator-state/command-mapping';
export * as EnvironmentVariables from 'emulator-state/environment-variables';
export * as FileSystem from 'emulator-state/file-system';
export * as History from 'emulator-state/history';
export * as Outputs from 'emulator-state/outputs';
//export EmulatorState from 'emulator-state/EmulatorState';
export { default as EmulatorState } from './EmulatorState';
/*
export { default as EmulatorState } from './EmulatorState';
export { default as CommandMapping } from './EmulatorState';
export { default as EnvironmentVariables } from './EmulatorState';
export { default as FileSystem } from './EmulatorState';
export { default as History } from './EmulatorState';
export { default as Outputs } from './EmulatorState';*/
