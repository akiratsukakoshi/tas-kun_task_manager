import { GoogleCalendarClient, CalendarEvent } from './googleCalendarClient.js';

export class CalendarService {
  private client: GoogleCalendarClient;

  constructor(apiKey: string, calendarId: string) {
    this.client = new GoogleCalendarClient(apiKey, calendarId);
  }

  async getEvents(start?: Date, end?: Date): Promise<CalendarEvent[]> {
    return this.client.listEvents(start, end);
  }

  async addEvent(event: CalendarEvent): Promise<string> {
    // TODO: 実装
    return this.client.addEvent(event);
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    // TODO: 実装
    return this.client.deleteEvent(eventId);
  }

  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<boolean> {
    // TODO: 実装
    return this.client.updateEvent(eventId, event);
  }
} 