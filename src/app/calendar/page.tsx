// src/app/calendar/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Show } from '../../types/types';

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Show | null>(null);

  useEffect(() => {
    fetch('/api/shows')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((show: Show) => ({
          id: show.id,
          title: show.artist,
          start: show.date,
          extendedProps: show,
        }));
        setEvents(formatted);
      });
  }, []);

  const getEventBg = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-500';
      case 'HOLD': return 'bg-yellow-500';
      case 'PENDING': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const handleEventClick = (arg: any) => {
    const show: Show = arg.event.extendedProps;
    setSelectedEvent(show);
    setIsOpen(true);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Calendar of Shows</h1>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: '',
        }}
        height="auto"
        events={events}
        eventContent={(arg) => {
          const status = arg.event.extendedProps.status;
          const bg = getEventBg(status);
          return (
            <div className={`text-xs text-white px-2 py-1 rounded ${bg}`}>
              {arg.event.title}
            </div>
          );
        }}
        eventClick={handleEventClick}
      />

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    {selectedEvent?.artist}
                  </Dialog.Title>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                    {selectedEvent?.description || 'No description'}
                  </p>
                  <p className="mt-1 text-sm">
                    <strong>Date:</strong> {new Date(selectedEvent?.date || '').toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm">
                    <strong>Venue:</strong> {selectedEvent?.venueId}
                  </p>
                  <p className="mt-1 text-sm">
                    <strong>Status:</strong> {selectedEvent?.status}
                  </p>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
