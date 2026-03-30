/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

describe('Keyboard interaction', () => {
  it('Button is focusable and responds to Enter', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    const btn = screen.getByRole('button', { name: 'Submit' });
    btn.focus();
    expect(document.activeElement).toBe(btn);
    await userEvent.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('Button responds to Space key', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Action</Button>);
    const btn = screen.getByRole('button', { name: 'Action' });
    btn.focus();
    await userEvent.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled Button does not respond to clicks', async () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Disabled' });
    await userEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('Input receives focus and accepts typed text', async () => {
    render(<Input placeholder="Type here" />);
    const input = screen.getByPlaceholderText('Type here');
    await userEvent.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });

  it('Tabs switch content on click', async () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Tab A</TabsTrigger>
          <TabsTrigger value="b">Tab B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content A</TabsContent>
        <TabsContent value="b">Content B</TabsContent>
      </Tabs>,
    );

    expect(screen.getByText('Content A')).toBeInTheDocument();
    expect(screen.queryByText('Content B')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Tab B' }));

    expect(screen.queryByText('Content A')).not.toBeInTheDocument();
    expect(screen.getByText('Content B')).toBeInTheDocument();
  });

  it('active Tab has aria-selected=true', () => {
    render(
      <Tabs defaultValue="first">
        <TabsList>
          <TabsTrigger value="first">First</TabsTrigger>
          <TabsTrigger value="second">Second</TabsTrigger>
        </TabsList>
        <TabsContent value="first">First content</TabsContent>
        <TabsContent value="second">Second content</TabsContent>
      </Tabs>,
    );

    expect(screen.getByRole('tab', { name: 'First' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Second' })).toHaveAttribute('aria-selected', 'false');
  });

  it('error heading receives focus via ref', () => {
    function ErrorBoundary() {
      const ref = React.useRef<HTMLHeadingElement>(null);
      React.useEffect(() => { ref.current?.focus(); }, []);
      return (
        <div role="alert">
          <h2 ref={ref} tabIndex={-1}>Error occurred</h2>
        </div>
      );
    }
    render(<ErrorBoundary />);
    expect(document.activeElement).toBe(screen.getByText('Error occurred'));
  });
});
