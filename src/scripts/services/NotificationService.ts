import { NotificationModel } from '../models';

export default class NotificationService {
  static showNotification(notification: NotificationModel) {
    const template = document.getElementById(
      'NotificationTemplate'
    ) as HTMLTemplateElement;

    if (template && 'content' in document.createElement('template')) {
      const clone = template.content.cloneNode(true) as DocumentFragment;
      const dialog = clone.querySelector('dialog') as HTMLDialogElement;
      dialog.classList.add(notification.type);
      
      const title = clone.querySelector('summary');
      const description = clone.querySelector('.description');

      if (title && description) {
        title.textContent = notification.title;
        description.textContent = notification.description;
      }

      const notifications = document.getElementById('Notifications');
      notifications?.appendChild(clone);

      const closeButton = dialog.querySelector('button.close');
      closeButton?.addEventListener('click', () => {
        dialog.open = false
      });

      dialog.open = true;
    }
  }
}

