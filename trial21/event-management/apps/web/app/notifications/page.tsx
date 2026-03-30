/** TRACED:EM-FE-011 — Notification composer */
export default function NotificationsPage() {
  return (
    <section>
      <h1>Notifications</h1>
      <h2>Compose Notification</h2>
      <form>
        <label htmlFor="subject">Subject</label>
        <input id="subject" type="text" name="subject" />

        <label htmlFor="body">Message</label>
        <textarea id="body" name="body" />

        <button type="submit">Send Notification</button>
      </form>
    </section>
  );
}
