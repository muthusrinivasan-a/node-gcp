import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CalendarService } from '../services/calendar.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
  eventForm: FormGroup;
  isFullDay: boolean = false;
  eventIdToUpdate: string | null = null; // Holds the event ID if updating
  recurrenceOptions = [
    { label: 'None', value: '' },
    { label: 'Daily', value: 'FREQ=DAILY' },
    { label: 'Weekly', value: 'FREQ=WEEKLY' },
    { label: 'Monthly', value: 'FREQ=MONTHLY' }
  ];

  constructor(private fb: FormBuilder, private calendarService: CalendarService) {
    this.eventForm = this.fb.group({
      summary: [''],
      description: [''],
      start: [''],
      end: [''],
      isFullDay: [false],
      recurrence: [''],
      attendees: [''] // Comma-separated emails
    });
  }

  // Toggle between full-day event and timed event
  onFullDayToggle() {
    this.isFullDay = !this.isFullDay;
  }

  // Submit the form for either creating or updating an event
  submitEvent() {
    const formData = this.eventForm.value;

    const eventData = {
      summary: formData.summary,
      description: formData.description,
      start: this.isFullDay ? formData.start : new Date(formData.start).toISOString(),
      end: this.isFullDay ? formData.end : new Date(formData.end).toISOString(),
      isFullDay: this.isFullDay,
      recurrence: formData.recurrence,
      attendees: formData.attendees ? formData.attendees.split(',').map(email => email.trim()) : []
    };

    if (this.eventIdToUpdate) {
      // Update event
      this.calendarService.updateEvent(this.eventIdToUpdate, eventData).subscribe(
        (response) => {
          console.log('Event updated successfully:', response);
          this.eventForm.reset();
          this.eventIdToUpdate = null; // Reset update mode
        },
        (error) => {
          console.error('Error updating event:', error);
        }
      );
    } else {
      // Create new event
      this.calendarService.createEvent(eventData).subscribe(
        (response) => {
          console.log('Event created successfully:', response);
          this.eventForm.reset();
        },
        (error) => {
          console.error('Error creating event:', error);
        }
      );
    }
  }

  // Load event details into form for editing
  editEvent(eventId: string, eventData: any) {
    this.eventForm.patchValue({
      summary: eventData.summary,
      description: eventData.description,
      start: eventData.start.date || eventData.start.dateTime,
      end: eventData.end.date || eventData.end.dateTime,
      isFullDay: !!eventData.start.date, // Check if it's a full-day event
      recurrence: eventData.recurrence ? eventData.recurrence[0].replace('RRULE:', '') : '',
      attendees: eventData.attendees ? eventData.attendees.map(a => a.email).join(', ') : ''
    });

    this.eventIdToUpdate = eventId;
  }
}
