import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import JournalismPortfolio from './JournalismPortfolio';

const manifestState = vi.hoisted(() => ({
  value: {
    status: 'success',
    error: null,
    data: {
      events: [
        {
          eventName: 'Election Night Watch',
          category: 'Politics',
          folderPath: 'Politics/Election',
          dateDisplay: 'November 2024',
          eventDate: { iso: '2024-11-05' },
          tags: ['Politics'],
          published: true,
          outlet: 'PublicSource',
          articleUrl: 'https://example.com/election-night',
          images: [{ filename: 'election.jpg', path: 'election.jpg', caption: 'Voters gather.' }],
        },
        {
          eventName: 'Community Feature',
          category: 'Features',
          folderPath: 'Features/Community',
          dateDisplay: 'April 2025',
          eventDate: { iso: '2025-04-03' },
          tags: ['Features'],
          images: [{ filename: 'feature.jpg', path: 'feature.jpg', caption: 'Neighbors meet.' }],
        },
      ],
    },
  },
}));

vi.mock('../portfolio/useManifest', () => ({
  useManifest: () => manifestState.value,
  imageUrl: {
    journalism: (folderPath: string, filename: string) =>
      `/src/images/Portfolios/Journalism/${folderPath}/${filename}`,
  },
}));

vi.mock('../portfolio/PortfolioGrid', () => ({
  default: ({ groups }: { groups: Array<{ id: string; title: string }> }) => (
    <div data-testid="journalism-grid">
      {groups.map((group) => (
        <span key={group.id}>{group.title}</span>
      ))}
    </div>
  ),
}));

afterEach(() => {
  manifestState.value = {
    status: 'success',
    error: null,
    data: {
      events: [
        {
          eventName: 'Election Night Watch',
          category: 'Politics',
          folderPath: 'Politics/Election',
          dateDisplay: 'November 2024',
          eventDate: { iso: '2024-11-05' },
          tags: ['Politics'],
          published: true,
          outlet: 'PublicSource',
          articleUrl: 'https://example.com/election-night',
          images: [{ filename: 'election.jpg', path: 'election.jpg', caption: 'Voters gather.' }],
        },
        {
          eventName: 'Community Feature',
          category: 'Features',
          folderPath: 'Features/Community',
          dateDisplay: 'April 2025',
          eventDate: { iso: '2025-04-03' },
          tags: ['Features'],
          images: [{ filename: 'feature.jpg', path: 'feature.jpg', caption: 'Neighbors meet.' }],
        },
      ],
    },
  };
});

describe('JournalismPortfolio', () => {
  it('keeps the grid path while adding compact editorial proof', () => {
    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <JournalismPortfolio />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Photojournalism' })).toBeInTheDocument();
    expect(screen.getByLabelText('Editorial proof points')).toHaveTextContent(
      'Same-day selects, AP-style captions, clean assignment handoff',
    );
    expect(screen.getByRole('heading', { name: 'Recent published work' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Published' })).toBeInTheDocument();

    const grid = screen.getByTestId('journalism-grid');
    expect(grid).toHaveTextContent('Election Night Watch');
    expect(grid).toHaveTextContent('Community Feature');

    const proof = screen.getByLabelText('Editorial proof points');
    expect(proof.compareDocumentPosition(grid) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('filters to published work without replacing the portfolio grid', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <JournalismPortfolio />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('tab', { name: 'Published' }));

    const grid = screen.getByTestId('journalism-grid');
    expect(grid).toHaveTextContent('Election Night Watch');
    expect(grid).not.toHaveTextContent('Community Feature');
  });
});
