/**
 * Month utils
 */

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