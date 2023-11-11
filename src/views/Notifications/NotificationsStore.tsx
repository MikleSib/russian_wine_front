import { makeObservable, observable, action } from "mobx";

class NotificationsStore {
  // TODO: add param read to notifications for initialize red marker near nofication icon
  notifications: { id: number; type: string; message: string; TxTime: number; TxLink?: string }[] =
    JSON.parse(localStorage.getItem("notifications") as string) ?? [];
  // [
  // {
  //   id: 1679318909,
  //   type: "success",
  //   message: "NFT was successfully minted",
  //   TxTime: 1679318909,
  //   TxLink: "0x79276c9975318c7a3d42362e37363f8337159224106d5a7328b83095097f8058",
  // },
  // {
  //   id: 1679334620,
  //   type: "warning",
  //   message: "Your offer within the User Sales has been cancelled",
  //   TxTime: 1679334620,
  //   TxLink: "0x66c8dfde95d7d4dca5b860967b16af80225d054df8164bd792255550bad902c1",
  // },
  // {
  //   id: 1679344634,
  //   type: "fail",
  //   message: "Low USDT balance to proceed the purchase",
  //   TxTime: 1679344634,
  //   TxLink: "0x52bf13a47a460815ed2323b7f989594b2f756e9f18b4eb344779796421676160",
  // },
  // {
  //   id: 1679318909,
  //   type: "success",
  //   message: "NFT was successfully minted",
  //   TxTime: 1679318909,
  //   TxLink: "0x79276c9975318c7a3d42362e37363f8337159224106d5a7328b83095097f8058",
  // },
  // {
  //   id: 1679334620,
  //   type: "warning",
  //   message: "Your offer within the User Sales has been cancelled",
  //   TxTime: 1679334620,
  //   TxLink: "0x66c8dfde95d7d4dca5b860967b16af80225d054df8164bd792255550bad902c1",
  // },
  // {
  //   id: 1679344634,
  //   type: "fail",
  //   message: "Low USDT balance to proceed the purchase",
  //   TxTime: 1679344634,
  //   TxLink: "0x52bf13a47a460815ed2323b7f989594b2f756e9f18b4eb344779796421676160",
  // },
  // ];

  notificationsRead = true;

  addNotification(notification: {
    id: number;
    type: string;
    message: string;
    TxTime: number;
    TxLink?: string;
  }) {
    this.notifications.unshift(notification);
    this.saveNotificationsToLocalStorage();
    this.setNotificationsRead(false);
  }

  removeNotification(id: number) {
    this.notifications = this.notifications.filter((notification) => notification.id !== id);
    this.saveNotificationsToLocalStorage();
  }

  saveNotificationsToLocalStorage() {
    localStorage.setItem("notifications", JSON.stringify(this.notifications));
  }

  setNotificationsRead(value: boolean) {
    this.notificationsRead = value;
  }

  constructor() {
    makeObservable(this, {
      notifications: observable,
      notificationsRead: observable,
      addNotification: action,
      removeNotification: action,
      setNotificationsRead: action,
    });
  }
}

export default new NotificationsStore();
