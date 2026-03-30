export default function SettingsPage() {
  return (
    <main>
      <h1>Settings</h1>
      <section aria-label="Application settings">
        <form>
          <fieldset>
            <legend>Profile Settings</legend>
            <label htmlFor="name">Name</label>
            <input id="name" type="text" name="name" />
            <label htmlFor="email">Email</label>
            <input id="email" type="email" name="email" />
          </fieldset>
          <button type="submit">Save</button>
        </form>
      </section>
    </main>
  );
}
