import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CalendarService } from '../services/calendar.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  eventForm: FormGroup;
  isFullDay: boolean = false;
  eventIdToUpdate: string | null = null; // Holds the event ID if updating
  calendars: any[] = []; // List of available calendars
  selectedCalendarId: string = 'primary'; // Default calendar

  recurrenceOptions = [
    { label: 'None', value: '' },
    { label: 'Daily', value: 'DAILY' },
    { label: 'Weekly', value: 'WEEKLY' },
    { label: 'Monthly', value: 'MONTHLY' }
  ];

  constructor(private fb: FormBuilder, private calendarService: CalendarService) {
    this.eventForm = this.fb.group({
      summary: [''],
      description: [''],
      start: [''],
      end: [''],
      isFullDay: [false],
      recurrence: [''],
      recurrenceCount: [1],
      attendees: ['']
    });
  }

  ngOnInit() {
    this.loadCalendars();
  }

  loadCalendars() {
    this.calendarService.getCalendars().subscribe(
      (response: any) => {
        this.calendars = response.items || [];
      },
      error => {
        console.error('Error fetching calendars:', error);
      }
    );
  }

  onFullDayToggle() {
    this.isFullDay = !this.isFullDay;
  }

  generateRecurrenceRule() {
    const formData = this.eventForm.value;
    return formData.recurrence ? `FREQ=${formData.recurrence};COUNT=${formData.recurrenceCount}` : '';
  }

  submitEvent() {
    const formData = this.eventForm.value;

    const eventData = {
      summary: formData.summary,
      description: formData.description,
      start: this.isFullDay ? formData.start : new Date(formData.start).toISOString(),
      end: this.isFullDay ? formData.end : new Date(formData.end).toISOString(),
      isFullDay: this.isFullDay,
      recurrence: this.generateRecurrenceRule(),
      attendees: formData.attendees ? formData.attendees.split(',').map(email => email.trim()) : []
    };

    if (this.eventIdToUpdate) {
      this.calendarService.updateEvent(this.selectedCalendarId, this.eventIdToUpdate, eventData).subscribe(
        response => {
          console.log('Event updated successfully:', response);
          this.eventForm.reset();
          this.eventIdToUpdate = null;
        },
        error => {
          console.error('Error updating event:', error);
        }
      );
    } else {
      this.calendarService.createEvent(this.selectedCalendarId, eventData).subscribe(
        response => {
          console.log('Event created successfully:', response);
          this.eventForm.reset();
        },
        error => {
          console.error('Error creating event:', error);
        }
      );
    }
  }
}
