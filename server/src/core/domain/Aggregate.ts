import { Event } from '../events/types.js';

export abstract class Aggregate {
  private _id: string;
  private _version: number;
  private _changes: Event[];

  constructor(id: string) {
    this._id = id;
    this._version = 0;
    this._changes = [];
  }

  get id(): string {
    return this._id;
  }

  get version(): number {
    return this._version;
  }

  get changes(): Event[] {
    return [...this._changes];
  }

  protected abstract apply(event: Event): void;

  protected addEvent(event: Event): void {
    this.apply(event);
    this._changes.push(event);
    this._version++;
  }

  loadFromHistory(events: Event[]): void {
    for (const event of events) {
      this.apply(event);
      // Get version from event metadata, defaulting to current version + 1 if not present
      this._version = event.metadata.version ?? this._version + 1;
    }
  }

  clearChanges(): void {
    this._changes = [];
  }
}
