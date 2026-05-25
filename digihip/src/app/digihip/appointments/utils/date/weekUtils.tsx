/**
 * Week utils
 */

/**
 * Get the start of the week (Monday) based on a given date.
 * @param date - The reference date
 * @returns The Date object set to the start of the week
*/
export const getStartOfWeek = (date: Date): Date => {
    const start = new Date(date);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    start.setHours(0, 0, 0, 0);
    
    return start;
};

/**
 * Get all dates for the current week starting from a specific week start date.
 * @param weekStartDate - The start date of the week
 * @returns An array of Date objects representing each day of the current week
 */
export const getCurrentWeekDates = (weekStartDate: Date): Date[] => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStartDate);
        date.setDate(weekStartDate.getDate() + i);
        dates.push(date);
    }
    return dates;
};

/**
 * Move to the previous week based on a provided date
 * @param weekStartDate - The reference date
 * @param updateWeek - The function to update the state with the next week's start date
 */
export const prevWeek = (weekStartDate: Date, updateWeek: (date: Date) => void) => {
    const nextWeek = new Date(weekStartDate);
    nextWeek.setDate(weekStartDate.getDate() - 7);
    updateWeek(nextWeek);
};

/**
 * Move to the next week based on a provided date
 * @param weekStartDate - The reference date
 * @param updateWeek - The function to update the state with the next week's start date
 */
export const nextWeek = (weekStartDate: Date, updateWeek: (date: Date) => void) => {
    const nextWeek = new Date(weekStartDate);
    nextWeek.setDate(weekStartDate.getDate() + 7);
    updateWeek(nextWeek);
};

/**
 * Handles the change of week when a new date is selected.
 * @param date - The selected date from the DatePicker
 * @param updateWeek - The function to update the state with the new week's start date
 */
export const handleWeekChange = (date: Date | null, updateWeek: (date: Date)=>void) => {
    if(date) updateWeek(date);
};