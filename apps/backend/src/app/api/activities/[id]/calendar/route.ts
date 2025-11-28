import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Generate ICS file content
function generateICS(activity: any): string {
  const startDate = new Date(activity.date);
  const endDate = new Date(startDate.getTime() + activity.duration * 60000);
  
  // Format dates to ICS format (YYYYMMDDTHHMMSSZ)
  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  // Calculate alarm time (1 hour before)
  const alarmDate = new Date(startDate.getTime() - 3600000);
  
  // Escape special characters for ICS format
  const escape = (str: string): string => {
    return str.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
  };
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SportBuddy//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:SportBuddy Activity',
    'X-WR-TIMEZONE:Europe/Bratislava',
    'BEGIN:VTIMEZONE',
    'TZID:Europe/Bratislava',
    'BEGIN:STANDARD',
    'DTSTART:19701025T030000',
    'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
    'TZOFFSETFROM:+0200',
    'TZOFFSETTO:+0100',
    'END:STANDARD',
    'BEGIN:DAYLIGHT',
    'DTSTART:19700329T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
    'TZOFFSETFROM:+0100',
    'TZOFFSETTO:+0200',
    'END:DAYLIGHT',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:activity-${activity.id}@sportbuddy.app`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART;TZID=Europe/Bratislava:${formatICSDate(startDate)}`,
    `DTEND;TZID=Europe/Bratislava:${formatICSDate(endDate)}`,
    `SUMMARY:${escape(activity.title)}`,
    `DESCRIPTION:${escape(activity.description || 'SportBuddy aktivita')}\\n\\nŠport: ${escape(activity.sportType)}\\nÚroveň: ${escape(activity.skillLevel)}\\nCena: ${activity.price ? `${activity.price}€` : 'Zdarma'}`,
    `LOCATION:${escape(activity.venue?.name || activity.location)}`,
    `STATUS:CONFIRMED`,
    `SEQUENCE:0`,
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Pripomienka: ${escape(activity.title)} o hodinu`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  
  return icsContent;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = params.id;
    
    // Fetch activity with venue details
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        venue: true,
        organizer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!activity) {
      return NextResponse.json(
        { error: 'Aktivita nenájdená' },
        { status: 404 }
      );
    }
    
    // Generate ICS file
    const icsContent = generateICS(activity);
    
    // Return ICS file with proper headers
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="sportbuddy-${activity.id}.ics"`,
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Calendar export error:', error);
    return NextResponse.json(
      { error: 'Chyba pri generovaní kalendára' },
      { status: 500 }
    );
  }
}
