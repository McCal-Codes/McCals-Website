import { useState, startTransition } from 'react';
import SectionCard from '@/components/SectionCard';
import StatusBadge from '@/components/StatusBadge';
import MetricCard from '@/components/MetricCard';
import { useBookings, useBooking } from '@/hooks/useBookings';
import type { BookingStatus, Booking } from '@/lib/bookings';

const STATUS_OPTIONS: { value: BookingStatus | ''; label: string; tone: 'confirmed' | 'cancelled' | 'completed' }[] = [
  { value: '', label: 'All Statuses', tone: 'confirmed' },
  { value: 'confirmed', label: 'Confirmed', tone: 'confirmed' },
  { value: 'cancelled', label: 'Cancelled', tone: 'cancelled' },
  { value: 'completed', label: 'Completed', tone: 'completed' },
];

const EVENT_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'grab-coffee', label: 'Grab a Coffee' },
  { value: 'book-podcast', label: 'Book a Podcast' },
];

function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const toneMap: Record<BookingStatus, 'confirmed' | 'cancelled' | 'completed'> = {
    confirmed: 'confirmed',
    cancelled: 'cancelled',
    completed: 'completed',
  };
  return <StatusBadge tone={toneMap[status]} label={status} />;
}

function BookingListItem({ 
  booking, 
  onClick,
  isSelected 
}: { 
  booking: Booking; 
  onClick: () => void;
  isSelected: boolean;
}) {
  const date = new Date(booking.date);
  const isPast = date < new Date();
  
  return (
    <div 
      className={`stack-list__item booking-item ${isSelected ? 'booking-item--selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="booking-item__main">
        <div className="booking-item__header">
          <h4 className="booking-item__name">{booking.requester.name}</h4>
          <BookingStatusBadge status={booking.status} />
        </div>
        <p className="booking-item__email">{booking.requester.email}</p>
        <div className="booking-item__meta">
          <span className={`booking-item__date ${isPast ? 'booking-item__date--past' : ''}`}>
            {date.toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
            {isPast && ' (past)'}
          </span>
          <span className="booking-item__time">{booking.time}</span>
          <span className="booking-item__duration">{booking.durationMinutes}min</span>
          <span className="booking-item__type">{booking.eventTypeId}</span>
        </div>
      </div>
    </div>
  );
}

function BookingDetail({ bookingId, onClose }: { bookingId: string; onClose: () => void }) {
  const { booking, related, isLoading, isError, error } = useBooking(bookingId);

  if (isLoading) {
    return (
      <div className="booking-detail booking-detail--loading">
        <p>Loading booking details...</p>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="booking-detail booking-detail--error">
        <p className="inline-error">{error?.message || 'Failed to load booking'}</p>
        <button onClick={onClose} className="btn btn--secondary">Close</button>
      </div>
    );
  }

  return (
    <div className="booking-detail">
      <div className="booking-detail__header">
        <h3>Booking Details</h3>
        <button onClick={onClose} className="btn btn--icon" aria-label="Close">
          ×
        </button>
      </div>

      <div className="booking-detail__section">
        <h4>Requester</h4>
        <p><strong>{booking.requester.name}</strong></p>
        <p>{booking.requester.email}</p>
        {booking.requester.notes && (
          <p className="booking-detail__notes">{booking.requester.notes}</p>
        )}
      </div>

      <div className="booking-detail__section">
        <h4>Appointment</h4>
        <p>{booking.derived.formattedDate}</p>
        <p>{booking.time} ({booking.durationMinutes} minutes)</p>
        <p>Timezone: {booking.ownerTimezone}</p>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="booking-detail__section">
        <h4>Metadata</h4>
        <p>ID: <code>{booking.id}</code></p>
        <p>Created: {new Date(booking.createdAt).toLocaleString()}</p>
        <p>Requester timezone: {booking.requesterTimezone}</p>
      </div>

      {related.sameRequester.length > 0 && (
        <div className="booking-detail__section">
          <h4>Other bookings from {booking.requester.name}</h4>
          <ul className="plain-list">
            {related.sameRequester.map(b => (
              <li key={b.id}>
                {b.date} - <BookingStatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {related.sameDate.length > 0 && (
        <div className="booking-detail__section">
          <h4>Other bookings on {booking.date}</h4>
          <ul className="plain-list">
            {related.sameDate.map(b => (
              <li key={b.id}>
                {b.time} - {b.requester.name} - <BookingStatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function BookingsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const { 
    bookings, 
    pagination, 
    summary, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useBookings({
    page,
    limit: 10,
    filters: {
      status: statusFilter || undefined,
      eventType: eventTypeFilter || undefined,
      email: emailFilter || undefined,
    },
  });

  const handleFilterChange = () => {
    startTransition(() => {
      setPage(1);
    });
  };

  const clearFilters = () => {
    setStatusFilter('');
    setEventTypeFilter('');
    setEmailFilter('');
    setPage(1);
  };

  const hasActiveFilters = statusFilter || eventTypeFilter || emailFilter;

  return (
    <div className="page-grid">
      <section className="hero-panel">
        <div>
          <p className="hero-panel__eyebrow">Scheduling</p>
          <h2 className="hero-panel__title">Bookings Console</h2>
          <p className="hero-panel__copy">
            View and manage all scheduling bookings from the public site. 
            Filter by date, status, event type, or requester email.
          </p>
        </div>
      </section>

      {summary && (
        <div className="metric-grid">
          <MetricCard
            label="Total bookings"
            value={summary.total}
            tone="success"
            detail="All time bookings in Supabase"
          />
          <MetricCard
            label="Confirmed"
            value={summary.confirmed}
            tone="success"
            detail="Active confirmed bookings"
          />
          <MetricCard
            label="Upcoming"
            value={summary.upcoming}
            tone="warning"
            detail="Confirmed bookings in the future"
          />
          <MetricCard
            label="Cancelled"
            value={summary.cancelled}
            tone="error"
            detail="Cancelled bookings"
          />
        </div>
      )}

      <SectionCard title="Filters" eyebrow="Search">
        <div className="filter-bar">
          <div className="filter-group">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as BookingStatus | '');
                handleFilterChange();
              }}
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="type-filter">Event Type</label>
            <select
              id="type-filter"
              value={eventTypeFilter}
              onChange={(e) => {
                setEventTypeFilter(e.target.value);
                handleFilterChange();
              }}
            >
              {EVENT_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group filter-group--grow">
            <label htmlFor="email-filter">Email search</label>
            <input
              id="email-filter"
              type="text"
              placeholder="Filter by email..."
              value={emailFilter}
              onChange={(e) => {
                setEmailFilter(e.target.value);
                handleFilterChange();
              }}
            />
          </div>

          {hasActiveFilters && (
            <button 
              className="btn btn--secondary" 
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}

          <button 
            className="btn btn--primary" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </SectionCard>

      <SectionCard 
        title={isLoading ? 'Loading bookings...' : `Bookings (${pagination?.total ?? 0})`} 
        eyebrow="Results"
      >
        {isError && (
          <p className="inline-error">
            {error?.message || 'Failed to load bookings'}
          </p>
        )}

        {!isLoading && !isError && bookings.length === 0 && (
          <p className="muted-copy">
            {hasActiveFilters 
              ? 'No bookings match your filters. Try adjusting or clearing filters.'
              : 'No bookings found. Bookings will appear here when people schedule through the public site.'}
          </p>
        )}

        <div className={`bookings-layout ${selectedBookingId ? 'bookings-layout--split' : ''}`}>
          <div className="bookings-list">
            {bookings.map(booking => (
              <BookingListItem
                key={booking.id}
                booking={booking}
                onClick={() => setSelectedBookingId(booking.id)}
                isSelected={selectedBookingId === booking.id}
              />
            ))}

            {pagination && pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn--secondary"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrev || isLoading}
                >
                  Previous
                </button>
                <span className="pagination__info">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  className="btn btn--secondary"
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={!pagination.hasNext || isLoading}
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {selectedBookingId && (
            <div className="bookings-detail-panel">
              <BookingDetail 
                bookingId={selectedBookingId} 
                onClose={() => setSelectedBookingId(null)} 
              />
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="API Reference" eyebrow="Endpoints">
        <div className="code-table">
          <div className="code-table__row">
            <code>GET /api/admin/bookings</code>
            <span>Paginated list with filters (status, eventType, email, date range)</span>
          </div>
          <div className="code-table__row">
            <code>GET /api/admin/bookings/:id</code>
            <span>Single booking with related bookings from same requester/date</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Safety notes" eyebrow="Read-only phase">
        <ul className="plain-list">
          <li>This console is read-only. Cancel/reschedule actions require additional audit logging.</li>
          <li>All API calls are authenticated and logged with operator identity.</li>
          <li>Booking mutations must go through explicit endpoints with server-side validation.</li>
        </ul>
      </SectionCard>
    </div>
  );
}
