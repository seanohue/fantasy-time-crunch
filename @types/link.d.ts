import {
  ITimeCrunchValidation,
  ITimeCrunchValidationWithTime,
} from './TimeCrunch';

// Linking time units
export declare const link = <T extends string, K extends string>(
  args: ITimeCrunchValidation<T, K>
): ITimeCrunchValidationWithTime<T, K> => string;

declare function buildTime<T extends string, States extends string>(
  validation: ITimeCrunchValidation<T, States>
): ITimeCrunchValidationWithTime<T, States>;

declare function buildSystemUnits<T extends string, States extends string>(
  validation: ITimeCrunchValidationWithTime<T, States>
): ITimeCrunchValidationWithTime<T, States>;

declare function linkToNext<T extends string, States extends string>(
  validation: ITimeCrunchValidationWithTime<T, States>
): ITimeCrunchValidationWithTime<T, States>;
