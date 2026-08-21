const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Format a YYYY-MM-DD string as e.g. "June 10, 2026".
 * Parses the parts directly to avoid timezone-related day shifts.
 */
export function formatPostDate(iso: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) {
        return iso;
    }
    const [, year, month, day] = match;
    const monthName = MONTHS[Number(month) - 1] ?? '';
    return `${monthName} ${Number(day)}, ${year}`;
}
