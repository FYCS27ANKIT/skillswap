/**
 * Calendar Utilities for SkillSwap
 * Generates Google Calendar URLs and downloadable RFC 5545 .ics calendar files
 */

export const generateGoogleCalendarUrl = ({
  title = 'Skill Swap Session',
  scheduledAt,
  duration = 60,
  notes = '',
  meetingLink = '',
}) => {
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + Number(duration) * 60 * 1000);

  const formatGoogleTime = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  const dates = `${formatGoogleTime(start)}/${formatGoogleTime(end)}`;
  const text = encodeURIComponent(`SkillSwap: ${title}`);
  const details = encodeURIComponent(
    `${notes ? `${notes}\n\n` : ''}Join Live Video Classroom: ${meetingLink}\n\nOrganized via SkillSwap`
  );
  const location = encodeURIComponent(meetingLink || 'Online (SkillSwap Video Room)');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
};

export const downloadIcsFile = ({
  title = 'Skill Swap Session',
  scheduledAt,
  duration = 60,
  notes = '',
  meetingLink = '',
}) => {
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + Number(duration) * 60 * 1000);

  const formatIcsTime = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  const now = formatIcsTime(new Date());

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SkillSwap//Peer Learning Exchange//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:skillswap-${Date.now()}@skillswap.app`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatIcsTime(start)}`,
    `DTEND:${formatIcsTime(end)}`,
    `SUMMARY:SkillSwap: ${title}`,
    `DESCRIPTION:${(notes ? `${notes} - ` : '')}Join Video Classroom: ${meetingLink}`,
    `LOCATION:${meetingLink || 'Online'}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${title.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
