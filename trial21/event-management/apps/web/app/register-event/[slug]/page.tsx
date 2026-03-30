/** TRACED:EM-FE-013 — Registration form page */
export default async function RegisterEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <section>
      <h1>Register for Event</h1>
      <h2>Event: {slug}</h2>
      <form>
        <label htmlFor="ticketType">Ticket Type</label>
        <select id="ticketType" name="ticketType">
          <option value="">Select a ticket type</option>
        </select>

        <button type="submit">Complete Registration</button>
      </form>
    </section>
  );
}
