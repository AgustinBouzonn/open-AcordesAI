import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from '../../components/Toast';

const Trigger: React.FC = () => {
  const { showToast } = useToast();
  return (
    <>
      <button onClick={() => showToast('Saved!', 'success')}>success</button>
      <button onClick={() => showToast('Boom', 'error')}>error</button>
    </>
  );
};

describe('Toast', () => {
  it('shows a success message and lets the user dismiss it', async () => {
    const user = userEvent.setup();
    render(<ToastProvider><Trigger /></ToastProvider>);
    await user.click(screen.getByText('success'));
    expect(screen.getByText('Saved!')).toBeInTheDocument();
    await user.click(screen.getByLabelText('Cerrar'));
    expect(screen.queryByText('Saved!')).not.toBeInTheDocument();
  });

  it('stacks multiple toasts', async () => {
    const user = userEvent.setup();
    render(<ToastProvider><Trigger /></ToastProvider>);
    await user.click(screen.getByText('success'));
    await user.click(screen.getByText('error'));
    expect(screen.getByText('Saved!')).toBeInTheDocument();
    expect(screen.getByText('Boom')).toBeInTheDocument();
  });

  it('useToast returns a no-op when used outside the provider', () => {
    const Probe: React.FC = () => {
      const { showToast } = useToast();
      // Calling showToast should not throw outside the provider.
      showToast('orphan');
      return <span>ok</span>;
    };
    expect(() => render(<Probe />)).not.toThrow();
  });
});
