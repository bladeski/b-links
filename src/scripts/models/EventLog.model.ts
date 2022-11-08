export type EventLogModel = {
  title: string;
  description: string;
  type: EventLogType;
  details?: string;
  showNotification?: boolean;
}

export enum EventLogType {
  INFO = 'info',
  SUCCESS = 'log',
  WARNING = 'warn',
  ERROR = 'error'
};