// Service worker of the chat, registered only on a chat served with
// --socket, for push notifications (see server/pushNotify.js). It shows
// what the server sends and opens the chat when the notification is tapped.
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'New message', body: event.data ? event.data.text() : '' };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'New message', {
      body: data.body || '',
      icon: 'logo.png',
      tag: data.tag || undefined,
      data: { open: data.open || null },
    })
  );
});

// A tap opens the chat at the conversation the notification is about: an
// open window is told which one, a new one gets it in its address.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.open || null;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows.find((w) => w.url.startsWith(self.registration.scope));
      if (open) {
        if (target) open.postMessage({ type: 'open_conversation', target });
        return open.focus();
      }
      const url = target ? `${self.registration.scope}?open=${encodeURIComponent(JSON.stringify(target))}` : self.registration.scope;
      return self.clients.openWindow(url);
    })
  );
});
