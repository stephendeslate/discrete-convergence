/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';

expect.extend(toHaveNoViolations);

describe('Accessibility tests', () => {
  it('Button should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Button with disabled state should be accessible', async () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Input with label should have no violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="test-input">Test Label</label>
        <Input id="test-input" type="text" placeholder="Enter text" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Card component should have no violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card content with meaningful text</p>
        </CardContent>
      </Card>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Badge renders with correct text content', () => {
    const { getByText } = render(<Badge>Active</Badge>);
    const badge = getByText('Active');
    expect(badge).toBeTruthy();
    // Badge wraps content in a styled div — verify the computed text is passed through
    expect(badge.textContent).toBe('Active');
  });

  it('Skeleton renders with correct CSS class for animation', () => {
    const { container } = render(<Skeleton className="h-4 w-full" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.className).toContain('animate-pulse');
    expect(skeleton.className).toContain('h-4');
    expect(skeleton.className).toContain('w-full');
  });

  it('Button variants produce distinct class output', () => {
    const { container: defaultContainer } = render(<Button variant="default">Default</Button>);
    const { container: destructiveContainer } = render(<Button variant="destructive">Delete</Button>);
    const defaultClasses = (defaultContainer.firstChild as HTMLElement).className;
    const destructiveClasses = (destructiveContainer.firstChild as HTMLElement).className;
    // Each variant should produce a different class string, confirming CVA works
    expect(defaultClasses).not.toBe(destructiveClasses);
    expect(destructiveClasses).toContain('destructive');
  });

  it('Input forward refs correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} type="text" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.tagName).toBe('INPUT');
  });
});
