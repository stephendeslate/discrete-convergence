/** TRACED:EM-FE-015 — Admin settings page */
export default function SettingsPage() {
  return (
    <section>
      <h1>Settings</h1>
      <h2>Organization Settings</h2>
      <form>
        <label htmlFor="orgName">Organization Name</label>
        <input id="orgName" type="text" name="orgName" />

        <label htmlFor="tier">Plan Tier</label>
        <select id="tier" name="tier">
          <option value="FREE">Free (5 events/month)</option>
          <option value="PRO">Pro (50 events/month)</option>
          <option value="ENTERPRISE">Enterprise (Unlimited)</option>
        </select>

        <button type="submit">Save Settings</button>
      </form>
    </section>
  );
}
