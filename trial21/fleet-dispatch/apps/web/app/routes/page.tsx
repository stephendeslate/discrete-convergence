export default function RoutesPage() {
  return (
    <main>
      <h1>Route Optimizer</h1>
      <section aria-label="Route optimization">
        <h2>Optimize Routes</h2>
        <p>Select technician and work orders to optimize routing.</p>
        <form aria-label="Route optimization form">
          <label htmlFor="route-date">Date</label>
          <input id="route-date" type="date" name="date" />
          <button type="submit">Optimize</button>
        </form>
      </section>
    </main>
  );
}
