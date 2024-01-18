const notifHolder = document.getElementById("notifs");

export function showNotification(message) {
  const notification = document.createElement("div");
  notification.classList.add("notif");
  notification.textContent = message;

  const dismissButton = document.createElement("button");
  dismissButton.textContent = "Dismiss";
  dismissButton.addEventListener("click", () => {
    notification.remove();
  });

  notification.appendChild(dismissButton);

  notifHolder.appendChild(notification);

  setTimeout(() => {
    notification?.remove();
  }, 5000);
}
