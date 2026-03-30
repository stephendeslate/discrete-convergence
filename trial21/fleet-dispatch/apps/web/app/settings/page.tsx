export default function SettingsPage() {
  return (
    <main>
      <h1>Admin Settings</h1>
      <section aria-label="Company settings">
        <h2>Company Profile</h2>
        <form aria-label="Company settings form">
          <div>
            <label htmlFor="company-name">Company Name</label>
            <input id="company-name" type="text" name="name" />
          </div>
          <div>
            <label htmlFor="company-email">Email</label>
            <input id="company-email" type="email" name="email" />
          </div>
          <div>
            <label htmlFor="company-phone">Phone</label>
            <input id="company-phone" type="tel" name="phone" />
          </div>
          <button type="submit">Save Changes</button>
        </form>
      </section>
    </main>
  );
}
