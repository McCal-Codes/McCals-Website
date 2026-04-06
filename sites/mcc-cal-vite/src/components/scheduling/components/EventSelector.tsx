import type { EventType } from '../types/booking';

interface EventSelectorProps {
  events: EventType[];
  selectedId: string | null;
  onSelect: (event: EventType) => void;
}

export function EventSelector({ events, selectedId, onSelect }: EventSelectorProps) {
  return (
    <div className="scheduling-event-selector">
      <h2 className="scheduling-step-title">Select a meeting type</h2>
      <p className="scheduling-step-description">
        Choose the type of conversation that works best for you.
      </p>
      
      <div className="scheduling-events-grid">
        {events.map((event) => (
          <button
            key={event.id}
            className={`scheduling-event-card ${selectedId === event.id ? 'selected' : ''}`}
            onClick={() => onSelect(event)}
            style={{ '--event-color': event.color } as React.CSSProperties}
            aria-pressed={selectedId === event.id}
          >
            <div className="scheduling-event-header">
              <span 
                className="scheduling-event-indicator" 
                aria-hidden="true"
              />
              <h3 className="scheduling-event-name">{event.name}</h3>
            </div>
            
            <p className="scheduling-event-description">{event.description}</p>
            
            <div className="scheduling-event-meta">
              <span className="scheduling-event-duration">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                </svg>
                {event.durationMinutes} minutes
              </span>
              <span className="scheduling-event-location">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {event.location}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
