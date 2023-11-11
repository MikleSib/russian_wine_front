import { observer } from "mobx-react-lite";
import { FC } from "react";
import { notificationsStore } from "views";
import "./Notifications.styles.scss";
import { ReactComponent as CheckMark } from "assets/icons/check-mark.svg";
import { ReactComponent as Warning } from "assets/icons/warning.svg";
import { ReactComponent as RedCross } from "assets/icons/red-cross.svg";
import { ReactComponent as LinkIcon } from "assets/icons/link-icon.svg";
import { BaseLink } from "components/common";
import { useMediaQuery } from "hooks";

enum NotificationType {
  success = "success",
  warning = "warning",
  fail = "fail",
}

const NotificationsMenu: FC = () => {
  // const notificationsCount = notificationsData.filter((n) => !n.read).length;
  // const handleClose = (id: number) => {
  //   notificationsStore.removeNotification(id);
  // };
  const isMobile = useMediaQuery("(max-width: 767px)");
  function renderIcon(type: string) {
    if (type === NotificationType.success) {
      return <CheckMark />;
    } else if (type === NotificationType.warning) {
      return <Warning />;
    } else if (type === NotificationType.fail) {
      return <RedCross />;
    }
  }

  function timeConverter(UNIX_timestamp: number) {
    const a = new Date(UNIX_timestamp);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const year = a.getFullYear();
    const month = months[a.getMonth()];
    const date = a.getDate();
    const hour = a.getHours();
    const min = a.getMinutes().toString().padStart(2, "0");
    // const sec = a.getSeconds().toString().padStart(2, "0");
    const time = date + " " + month + " " + year + " " + hour + ":" + min;
    return time;
  }

  return (
    <>
      {notificationsStore.notifications.length === 0 ? (
        <p className="text-center">notification list is empty</p>
      ) : (
        notificationsStore.notifications &&
        notificationsStore.notifications.map((notification, index) => (
          <div key={notification.id} className="notification">
            <div className="notification__row">
              <div className="notification__icon">{renderIcon(notification.type)}</div>
              <div>
                <div className="notification__message">{notification.message}</div>
                <span className="notification__time">{timeConverter(notification.TxTime)}</span>
              </div>
              {/* <button onClick={() => handleClose(notification.id)}>Закрыть</button> */}
              {!isMobile && notification.TxLink && (
                <BaseLink
                  className="notification__link"
                  path={"https://bscscan.com/tx/" + notification.TxLink}
                  external
                >
                  <LinkIcon />
                </BaseLink>
              )}
            </div>
            {index !== notificationsStore.notifications.length - 1 && (
              <hr className="notification__separator" />
            )}
          </div>
        ))
      )}
    </>
  );
};

export default observer(NotificationsMenu);
