import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import momentPlugin from '@fullcalendar/moment'
import axios from 'axios'

const Calendar = () => {
  const [events, setEvents] = useState([])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/appointments')
        setEvents(response.data.map(event => ({
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end
        })))
      } catch (error) {
        console.error('Error fetching events:', error)
      }
    }
    
    fetchEvents()
  }, [])

  const handleDateClick = (arg) => {
    // Open modal to add new appointment
    console.log('Date clicked:', arg.dateStr)
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Calendar</h2>
      <div className="h-screen max-h-[800px]">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, momentPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          dateClick={handleDateClick}
          eventClick={(info) => console.log('Event clicked:', info.event.title)}
          height="100%"
        />
      </div>
    </div>
  )
}

export default Calendar