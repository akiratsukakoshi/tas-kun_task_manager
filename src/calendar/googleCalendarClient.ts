import { google, calendar_v3 } from 'googleapis';

export interface CalendarEvent {
  id?: string;
  summary: string;
  start: string; // ISO8601
  end: string;   // ISO8601
  description?: string;
}

function getOAuth2Client() {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_ACCESS_TOKEN,
    GOOGLE_REFRESH_TOKEN,
  } = process.env;
  const oAuth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET
  );
  oAuth2Client.setCredentials({
    access_token: GOOGLE_ACCESS_TOKEN,
    refresh_token: GOOGLE_REFRESH_TOKEN,
  });
  return oAuth2Client;
}

export class GoogleCalendarClient {
  private calendar: calendar_v3.Calendar;
  private calendarId: string;

  constructor(apiKey: string, calendarId: string) {
    this.calendar = google.calendar({ version: 'v3', auth: getOAuth2Client() });
    this.calendarId = calendarId;
  }

  async listEvents(start?: Date, end?: Date): Promise<CalendarEvent[]> {
    const params: any = {
      calendarId: this.calendarId,
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    };
    if (start) params.timeMin = start.toISOString();
    if (end) params.timeMax = end.toISOString();
    const res = await this.calendar.events.list(params);
    return (res.data.items || []).map(e => ({
      id: e.id ?? undefined,
      summary: e.summary || '',
      start: e.start?.dateTime || e.start?.date || '',
      end: e.end?.dateTime || e.end?.date || '',
      description: e.description || '',
    }));
  }

  async addEvent(event: CalendarEvent): Promise<string> {
    const res = await this.calendar.events.insert({
      calendarId: this.calendarId,
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.start },
        end: { dateTime: event.end },
      },
    });
    return res.data.id || '';
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    await this.calendar.events.delete({
      calendarId: this.calendarId,
      eventId,
    });
    return true;
  }

  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<boolean> {
    await this.calendar.events.patch({
      calendarId: this.calendarId,
      eventId,
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: event.start ? { dateTime: event.start } : undefined,
        end: event.end ? { dateTime: event.end } : undefined,
      },
    });
    return true;
  }
} 