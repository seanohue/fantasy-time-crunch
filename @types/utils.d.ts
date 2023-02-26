import { ITimeCrunchTimeUnitWithId, ITimeCrunchValidation } from './TimeCrunch';

export declare const createIdList = <T extends string, States extends string>(
  args:
    | ITimeCrunchTimeUnitWithId<T, States>[]
    | { [K in T]: ITimeCrunchTimeUnitWithId<T, States> }
): string => string;

export function maybeCallWithContext<T extends ((...args: any[]) => K) | K, K>(
  ctx: any,
  maybeFn: T
): K;

// Config Validation
export declare const handleConfigErrors: (
  errors: ITimeCrunchValidation<string, string>
) => ITimeCrunchValidation<string, string>;

// Generic Error handling...
export declare function handleErrors<T extends string, K extends string>(
  label: string,
  message: string,
  { system, input, errors }: ITimeCrunchValidation<T, K>
): ITimeCrunchValidation<T, K>;
