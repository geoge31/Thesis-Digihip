/**
 * 
 */

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