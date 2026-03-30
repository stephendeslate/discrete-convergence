'use client';

interface DashboardBuilderProps {
  dashboardId: string;
  widgets: unknown[];
}

/**
 * Dashboard builder component for managing widgets.
 * VERIFY: AE-A11Y-008 — dashboard builder with proper heading and alt text
 */
export function DashboardBuilder({ dashboardId, widgets }: DashboardBuilderProps) {
  return (
    <section aria-label="Dashboard builder">{/* TRACED: AE-A11Y-008 */}
      <h2>Widgets</h2>
      <p>Dashboard: {dashboardId}</p>
      {(widgets as Array<{ id: string; title: string; type: string }>).length === 0 ? (
        <p>No widgets yet. Add a widget to get started.</p>
      ) : (
        <div role="list" aria-label="Widget grid">
          {(widgets as Array<{ id: string; title: string; type: string }>).map((widget) => (
            <div key={widget.id} role="listitem" aria-label={`Widget: ${widget.title}`}>
              <h3>{widget.title}</h3>
              <span>Type: {widget.type}</span>
            </div>
          ))}
        </div>
      )}
      <button type="button" aria-label="Add new widget">
        Add Widget
      </button>
    </section>
  );
}
