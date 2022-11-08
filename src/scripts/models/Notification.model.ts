import { EventLogType } from './EventLog.model';

export type NotificationModel = {
  title: string;
  description: string;
  type: EventLogType;
}