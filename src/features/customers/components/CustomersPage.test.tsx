import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/tests/test-utils';
import { CustomersPage } from './CustomersPage';

describe('CustomersPage (integration)', () => {
  it('renders seed customers from the mocked API', async () => {
    renderWithProviders(<CustomersPage />);

    expect(await screen.findByText('ACME Distribution')).toBeInTheDocument();
    expect(screen.getByText('Globex Retail')).toBeInTheDocument();
    expect(screen.getByText('Initech Foods')).toBeInTheDocument();
  });

  it('creates a new customer through the form and shows it in the list', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CustomersPage />);

    await screen.findByText('ACME Distribution');

    await user.click(screen.getByRole('button', { name: /novo cliente/i }));

    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText(/nome/i), 'Wayne Industries');
    await user.type(within(dialog).getByLabelText(/documento/i), '11222333000144');
    await user.type(within(dialog).getByLabelText(/e-mail/i), 'supply@wayne.example');
    await user.click(await within(dialog).findByLabelText(/Caminhão \(TRUCK\)/i));

    await user.click(within(dialog).getByRole('button', { name: /criar cliente/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByText('Wayne Industries')).toBeInTheDocument();
  });

  it('validates required fields before submitting', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CustomersPage />);

    await screen.findByText('ACME Distribution');
    await user.click(screen.getByRole('button', { name: /novo cliente/i }));

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /criar cliente/i }));

    expect(
      await within(dialog).findByText(/o nome deve ter pelo menos 2 caracteres/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
