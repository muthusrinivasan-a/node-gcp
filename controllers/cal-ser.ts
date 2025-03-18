import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiUrl = 'http://localhost:3000/calendar';

  constructor(private http: HttpClient) {}

  getCalendars() {
    return this.http.get(`${this.apiUrl}/list-calendars`);
  }

  createEvent(calendarId: string, eventData: any) {
    return this.http.post(`${this.apiUrl}/event`, { calendarId, ...eventData });
  }

  updateEvent(calendarId: string, eventId: string, eventData: any) {
    return this.http.put(`${this.apiUrl}/event`, { calendarId, eventId, ...eventData });
  }
}
