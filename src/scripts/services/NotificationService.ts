import { NotificationModel } from '../models';

export default class NotificationService {
  static showNotification(notification: NotificationModel): HTMLDialogElement | undefined {
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
        this.closeNotification(dialog);
      });

      dialog.open = true;

      if (notification.autoClose) {
        setTimeout(() => this.closeNotification(dialog), 5000);
      }

      return dialog;
    }
  }

  static closeNotification(dialog: HTMLDialogElement) {
    dialog.classList.add('closing');
    setTimeout(() => dialog.open = false, 500);
  }
}

