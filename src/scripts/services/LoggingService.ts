import { EventLogModel, EventLogType } from '../models';

import NotificationService from './NotificationService';

export class LoggingService {
  static logEvent(event: EventLogModel) {
    console[event.type](event.title, event.description, event.details);
    if (event.showNotification) {
      NotificationService.showNotification(event);
    }
  }

  static logInvalidSettingEvent(key: string, value: string) {
    this.logEvent({
      title: 'Incorrect configuration value.',
      description: `An incorrect value was stored for the ${key} setting, so we have reset it to the default value.`,
      type: EventLogType.ERROR,
      details: `Setting: ${key}, Value: ${value}`
    });
  }
}