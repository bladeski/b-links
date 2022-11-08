import { EventLogType } from './../scripts/models/EventLog.model';
import NotificationService from '../scripts/services/NotificationService';

beforeEach(() => {
  document.body.innerHTML = `
    <div id="Notifications"></div>
    <template id="NotificationTemplate">
      <dialog>
        <details>
          <summary></summary>
          <div class="description"></div>
        </details>
        <button class="close">x</button>
      </dialog>
    </template>
  `;
});

describe('Notification service', () => {
  test('a notification is rendered', () => {
    NotificationService.showNotification({
      title: 'Test Notification.',
      description: 'This is a test notification.',
      type: EventLogType.INFO
    });

    const notifications = document.getElementById('Notifications')?.querySelectorAll('dialog');
    expect(notifications).toHaveLength(1);

    const dialog = notifications ? notifications[0] as HTMLDialogElement : null;
    expect(dialog?.open).toBe(true);
  });

  test('a notification is closed on click of close button', () => {
    NotificationService.showNotification({
      title: 'Test Notification.',
      description: 'This is a test notification.',
      type: EventLogType.INFO
    });

    const notifications = document.getElementById('Notifications')
      ?.querySelectorAll('dialog');
    expect(notifications).toHaveLength(1);

    const dialog = notifications ? notifications[0] as HTMLDialogElement : null;
    expect(dialog?.open).toBe(true);
    const closeButton = dialog?.querySelector('dialog button.close') as HTMLButtonElement;
    closeButton.click();

    expect(dialog?.open).toBe(false);
  });
});