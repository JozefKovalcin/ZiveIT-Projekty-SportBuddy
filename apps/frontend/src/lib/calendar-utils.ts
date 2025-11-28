// Calendar utility functions for generating calendar links

export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
}

/**
 * Format date for Google Calendar (YYYYMMDDTHHMMSSZ)
 */
function formatGoogleDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generate Google Calendar link
 */
export function generateGoogleCalendarLink(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${formatGoogleDate(event.startTime)}/${formatGoogleDate(event.endTime)}`
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook Calendar link (Office 365 & Outlook.com)
 */
export function generateOutlookCalendarLink(event: CalendarEvent): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    body: event.description,
    location: event.location,
    startdt: event.startTime.toISOString(),
    enddt: event.endTime.toISOString()
  });
  
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate Office 365 Calendar link
 */
export function generateOffice365CalendarLink(event: CalendarEvent): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    body: event.description,
    location: event.location,
    startdt: event.startTime.toISOString(),
    enddt: event.endTime.toISOString()
  });
  
  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate ICS download link for Apple Calendar and other clients
 */
export function generateICSDownloadLink(activityId: string): string {
  // Use window location in browser, fallback for SSR
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
  return `${baseUrl}/api/activities/${activityId}/calendar`;
}

/**
 * Download ICS file
 */
export async function downloadICSFile(activityId: string): Promise<void> {
  try {
    const link = generateICSDownloadLink(activityId);
    const response = await fetch(link);
    
    if (!response.ok) {
      throw new Error('Nepodarilo sa stiahnuť kalendár');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sportbuddy-${activityId}.ics`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Download ICS error:', error);
    throw error;
  }
}

/**
 * Open calendar link in new window
 */
export function openCalendarLink(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}
