import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ClientsSection } from './ClientsSection';
import type { Client } from './aboutData';

const testClients: Client[] = [
  {
    id: 'example-university',
    name: 'Example University',
    alt: 'Example University logo',
    category: 'academic',
    website: 'https://example.edu',
    logoMode: 'text',
  },
];

describe('ClientsSection', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 500,
    });
  });

  it('uses factual relationship copy and non-endorsement language', () => {
    render(
      <MemoryRouter>
        <ClientsSection clientList={testClients} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Selected work relationships')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Clients, publications, schools, and organizations.',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /A sample of organizations Caleb has photographed for, collaborated with, or been published by/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Logos are shown to identify work relationships, publications, or assignments/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Display does not imply sponsorship, endorsement, or official vendor status/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: /View related work or organization site for Example University/i,
      }),
    ).toBeInTheDocument();
  });
});
