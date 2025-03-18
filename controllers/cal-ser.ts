import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiUrl = 'http://localhost:3000/calendar';

  constructor(private http: HttpClient) {}

  createEvent(eventData: any) {
    return this.http.post(`${this.apiUrl}/create-event`, eventData);
  }

  updateEvent(eventId: string, eventData: any) {
    return this.http.put(`${this.apiUrl}/update-event`, { eventId, ...eventData });
  }
}
