import { ITimeCrunchSeed, ITimeCrunchValidation } from './TimeCrunch';

export declare function validate<T extends string, K extends string>(
  args: ITimeCrunchSeed<T, K>
): ITimeCrunchValidation<T, K>;

declare function validateParameters<T extends string, K extends string>(
  seed: ITimeCrunchSeed<T, K>
): ITimeCrunchValidation<T, K>;

declare function validateTick<T extends string, K extends string>(
  seed: ITimeCrunchSeed<T, K>
): ITimeCrunchValidation<T, K>;

declare function validateMakes<T extends string, K extends string>(
  seed: ITimeCrunchSeed<T, K>
): ITimeCrunchValidation<T, K>;

declare function validateHooks<T extends string, K extends string>(
  seed: ITimeCrunchSeed<T, K>
): ITimeCrunchValidation<T, K>;
