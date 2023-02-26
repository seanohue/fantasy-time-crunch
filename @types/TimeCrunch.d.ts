export interface ITimeCrunchTimeUnit<
  TimeUnitKeys extends string,
  States extends string
> {
  makes?:
    | { [K in TimeUnitKeys]?: number }
    | (() => { [K in TimeUnitKeys]?: number });
  max?: ((this: TimeCrunch<TimeUnitKeys, States>) => number) | number;
  next?:
    | ((this: TimeCrunch<TimeUnitKeys, States>) => TimeUnitKeys)
    | TimeUnitKeys;
  onIncrement?: (this: TimeCrunch<TimeUnitKeys, States>) => void;
  states?: TimeCrunchTimeCycle<States>;
  tick?: boolean;
}

export type ITimeCrunchConfig<T extends string, States extends string> = {
  [K in T]: ITimeCrunchTimeUnit<T, States>;
};

export interface ITimeCrunchTimeUnitWithId<
  T extends string,
  States extends string
> extends ITimeCrunchTimeUnit<T, States> {
  id: T;
}

export type TimeCrunchTimeCycle<States extends string> = {
  [K in States]?: number;
};
export type TimeCrunchHumanType<TimeUnitKeys extends string> = {
  [K in TimeUnitKeys]: number;
};

export interface ITimeCrunchSystem<
  TimeUnitKeys extends string,
  States extends string
> {
  tickUnit: TimeUnitKeys;
  units: {
    [K in TimeUnitKeys]: ITimeCrunchTimeUnitWithId<TimeUnitKeys, States>;
  };
}

export interface ITimeCrunchValidation<
  TimeUnitKeys extends string,
  States extends string
> {
  errors: string[];
  input: ITimeCrunchTimeUnitWithId<TimeUnitKeys, States>[];
  system: ITimeCrunchSystem<TimeUnitKeys, States>;
}

export interface ITimeCrunchValidationWithTime<
  TimeUnitKeys extends string,
  States extends string
> extends ITimeCrunchValidation<TimeUnitKeys, States> {
  time: { [K in TimeUnitKeys]: number };
}

export interface ITimeCrunchSeed<
  TimeUnitKeys extends string,
  States extends string
> {
  errors: string[];
  input: ITimeCrunchTimeUnitWithId<TimeUnitKeys, States>[];
  system: ITimeCrunchSystem<TimeUnitKeys, States>;
}

export type TimeCrunchExport<
  TimeUnitKeys extends string,
  States extends string
> = {
  time: TimeCrunchHumanType<TimeUnitKeys>;
} & {
  [K in TimeUnitKeys]: States | null;
};

declare class TimeCrunch<TimeUnitKeys extends string, States extends string> {
  system: ITimeCrunchSystem<TimeUnitKeys, States>;
  time: { [K in TimeUnitKeys]: number };
  errors: string[];

  constructor(def: ITimeCrunchConfig<TimeUnitKeys, States>);

  tick(id?: TimeUnitKeys, amount = 1): this;

  increment(
    id: TimeUnitKeys,
    unit: ITimeCrunchTimeUnit<TimeUnitKeys, States>,
    amount: number
  ): this;

  optimizedIncrement(
    id: TimeUnitKeys,
    unit: ITimeCrunchTimeUnit<TimeUnitKeys, States>
  ): this;

  getUnit(id: TimeUnitKeys): ITimeCrunchTimeUnitWithId<TimeUnitKeys, States>;

  getState(id: TimeUnitKeys): States | undefined;

  synchronizeTime(timeToSync: Record<TimeUnitKeys, number>);

  createUpdateObject(): TimeCrunchExport<TimeUnitKeys, States>;

  getHumanTime(): TimeCrunchHumanType<TimeUnitKeys>;
}
