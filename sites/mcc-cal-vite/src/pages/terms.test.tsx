import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import TermsPage from './terms';

describe('TermsPage', () => {
  it('includes graduation event and third-party mark notices in legal terms', () => {
    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <TermsPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', {
        name: /School & University Graduation Event Use/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/GradImages/i)).toBeInTheDocument();
    expect(screen.getByText(/displayed with permission/i)).toBeInTheDocument();
    expect(screen.getByText(/does not sell or license these images/i)).toBeInTheDocument();
    expect(screen.getByText(/does not provide prints or downloads/i)).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: /Client Logos & Third-Party Marks/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/does not imply sponsorship, endorsement/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: 'School & University Graduation Event Use',
      }),
    ).toHaveAttribute('href', '#graduation-event-use');
    expect(
      screen.getByRole('link', {
        name: 'Client Logos & Third-Party Marks',
      }),
    ).toHaveAttribute('href', '#client-logos');
  });
});
