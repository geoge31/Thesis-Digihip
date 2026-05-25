/** General Utilites */
/**
 * 
 * @param date 
 * @param locale 
 * @param options 
 * @returns 
 */
export const formatDate = (date: Date | null, locale = "el", options?: Intl.DateTimeFormatOptions): string => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString(locale, options);
};

/**
 * 
 * @param date 
 * @param locale 
 * @param options 
 * @returns 
 */
export const formatTime = (date: Date | null| undefined, locale = "el"): string => {
    if (!date) return "N/A";

    const formatter = new Intl.DateTimeFormat(locale, {
        hour: "2-digit", 
        minute: "2-digit", 
        hour12: false, 
    });

    return formatter.format(new Date(date));
};

/**
 * Calculate age from birthdate
 * @param birthdate - Date of birth (string or Date object)
 * @returns Age in years or "Δεν έχει ορισθεί" if birthdate is invalid/missing
 */
export const calculateAge = (birthdate: string | Date | undefined | null): number | string => {
    if (!birthdate) return "Δεν έχει ορισθεί";
    
    try {
        const birth = new Date(birthdate);
        const today = new Date();
        
        if (isNaN(birth.getTime())) {
            return "Δεν έχει ορισθεί";
        }
        
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        // Adjust age if birthday hasn't occurred yet this year
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age >= 0 ? age : "Δεν έχει ορισθεί";
    } catch (error) {
        return "Δεν έχει ορισθεί";
    }
};

/** Month Utilities */

/**
 * 
 * @param date 
 * @returns 
 */
export const getMonthYear = (date: Date) => {
    return date.toLocaleString('el', { month: 'long', year: 'numeric' });
};

/**
 * 
 * @param year 
 * @param month 
 * @returns 
 */
export const getFirstDayOfMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1); 
    const dayOfWeek = (firstDay.getDay() + 6) % 7;
    
    return dayOfWeek;
};

/**
 * 
 * @param year 
 * @param month 
 * @returns 
 */
export const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
};

/**
 * Move to the previous month based on a provided date.
 * @param setCurrentDate - The function to update the state with the previous month's start date
 */
export const prevMonth = (setCurrentDate: React.Dispatch<React.SetStateAction<Date>>) => {
    setCurrentDate((prevDate: Date) => {
    const prevMonth = new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1);
    
    return prevMonth;
    });
};

/**
 * Move to the next month based on a provided date.
 * @param setCurrentDate - The function to update the state with the previous month's start date
 */
export const nextMonth = (setCurrentDate: React.Dispatch<React.SetStateAction<Date>>) => {
    setCurrentDate((prevDate: Date) => {
    const nextMonth = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1);
    
    return nextMonth;
    });
};

/** Week Utilites */

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

/** Day Utilites */
/**
 * 
 * @param currentDate 
 * @returns 
 */
export const prevDay = (currentDate: Date) => {
    const previousDay = new Date(currentDate);
    previousDay.setDate(previousDay.getDate() - 1);
    return previousDay;
};


/**
 * 
 * @param currentDate 
 * @returns 
 */
export const nextDay = (currentDate: Date) => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
};

/**
 * 
 * @param value 
 * @returns 
 */
const safeDate = (value: string): Date | null => {
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
};
