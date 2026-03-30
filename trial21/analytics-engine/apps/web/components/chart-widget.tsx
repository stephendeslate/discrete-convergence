'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartWidgetProps {
  title: string;
  data: Array<{ name: string; value: number }>;
}

/**
 * Chart widget component using Recharts.
 * VERIFY: AE-WIDGET-005 — Recharts integration for chart rendering
 */
export function ChartWidget({ title, data }: ChartWidgetProps) { // TRACED: AE-WIDGET-005
  return (
    <section aria-label={`Chart: ${title}`}>
      <h3>{title}</h3>
      <div role="img" aria-label={`Line chart showing ${title} data with ${data.length} data points`}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
