export type Partner = {
  id: string;
  name: string;
  color: string;
  pmsDays?: number;
  icon?: string;
};

export type PeriodLog = {
  id: string;
  partnerId: string;
  startDate: string;
  periodLengthDays: number;
};

export type PredictedDayState = {
  isPeriod?: boolean;
  isPMS?: boolean;
  isFertileWindow?: boolean;
  isOvulationDay?: boolean;
};
