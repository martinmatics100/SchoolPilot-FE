// src/utils/dateTimeHelpers.ts

const NIGERIA_TIMEZONE = 'Africa/Lagos';

export const getGreeting = (date: Date): string => {
    const hour = date.getHours();

    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
};

export const formatNigeriaDateTime = (date: Date): string => {
  const parts = new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Lagos",
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return `${get("weekday")}, ${get("month")} ${get("day")}, ${get(
    "year"
  )} ${get("hour")}:${get("minute")} ${get("dayPeriod")} WAT`;
};


export const getNigeriaNow = (): Date => {
    // Convert current time to Nigeria time safely
    const now = new Date();
    const nigeriaTime = new Date(
        now.toLocaleString('en-US', { timeZone: NIGERIA_TIMEZONE })
    );
    return nigeriaTime;
};
