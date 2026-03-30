/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { StatusBadge } from '../components/status-badge';
import { VehicleCard } from '../components/vehicle-card';
import { DriverCard } from '../components/driver-card';
import { DeliveryTracker } from '../components/delivery-tracker';
import { RouteMap } from '../components/route-map';
import { Skeleton } from '../components/ui/skeleton';

expect.extend(toHaveNoViolations);

const MOCK_VEHICLE = {
  id: '1',
  licensePlate: 'ABC-1234',
  make: 'Toyota',
  model: 'Camry',
  year: 2023,
  status: 'AVAILABLE',
  mileage: '45000',
  tenantId: 't1',
  createdAt: '2024-01-01T00:00:00Z',
};

const MOCK_DRIVER = {
  id: '2',
  name: 'Jane Doe',
  licenseNumber: 'DL-9876',
  phone: '+1-555-0100',
  available: true,
  vehicleId: null,
  tenantId: 't1',
  createdAt: '2024-01-01T00:00:00Z',
};

const MOCK_DELIVERY = {
  id: '3',
  trackingCode: 'TRK-001',
  status: 'IN_TRANSIT',
  recipientName: 'John Smith',
  address: '123 Main St',
  cost: '45.99',
  driverId: '2',
  vehicleId: '1',
  routeId: '4',
  tenantId: 't1',
  createdAt: '2024-01-01T00:00:00Z',
  driver: { ...MOCK_DRIVER },
  vehicle: { ...MOCK_VEHICLE },
};

const MOCK_ROUTE = {
  id: '4',
  name: 'Downtown Express',
  origin: 'Warehouse A',
  destination: 'Hub B',
  distanceKm: '25.5',
  estimatedMinutes: 35,
  tenantId: 't1',
  createdAt: '2024-01-01T00:00:00Z',
};

describe('Accessibility: UI primitives', () => {
  it('Button has no a11y violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Button disabled state has no a11y violations', async () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Badge has no a11y violations', async () => {
    const { container } = render(<Badge>Active</Badge>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Card with header and content has no a11y violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Input with label has no a11y violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="Enter email" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('StatusBadge has no a11y violations', async () => {
    const { container } = render(<StatusBadge status="AVAILABLE" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Skeleton has no a11y violations', async () => {
    const { container } = render(<Skeleton className="h-8 w-24" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Accessibility: domain components', () => {
  it('VehicleCard has no a11y violations', async () => {
    const { container } = render(<VehicleCard vehicle={MOCK_VEHICLE} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('DriverCard has no a11y violations', async () => {
    const { container } = render(<DriverCard driver={MOCK_DRIVER} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('DeliveryTracker (in-transit) has no a11y violations', async () => {
    const { container } = render(<DeliveryTracker delivery={MOCK_DELIVERY} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('DeliveryTracker (failed) has no a11y violations', async () => {
    const { container } = render(
      <DeliveryTracker delivery={{ ...MOCK_DELIVERY, status: 'FAILED' }} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('RouteMap has no a11y violations', async () => {
    const { container } = render(<RouteMap route={MOCK_ROUTE} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Accessibility: form patterns', () => {
  it('login form pattern has no a11y violations', async () => {
    const { container } = render(
      <form>
        <div>
          <Label htmlFor="login-email">Email</Label>
          <Input id="login-email" type="email" placeholder="you@example.com" />
        </div>
        <div>
          <Label htmlFor="login-password">Password</Label>
          <Input id="login-password" type="password" placeholder="Password" />
        </div>
        <Button type="submit">Sign In</Button>
      </form>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('search/filter pattern has no a11y violations', async () => {
    const { container } = render(
      <div role="search">
        <Label htmlFor="search-input">Search vehicles</Label>
        <Input id="search-input" type="search" placeholder="Search..." />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
