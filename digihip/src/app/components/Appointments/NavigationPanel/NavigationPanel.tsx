/**
 * NavigationPanel Component
 * 
 * @file NavigationPanel.tsx
 * @path digihip/src/app/components/Appointments/NavigationPanel/NavigationPanel.tsx
 * @author Giorgos Geramoutsos
 * @description A React component for navigating through appointment views (day, week, month).
 *              It provides buttons to navigate to the previous and next views, as well as a button to
 *              jump to today's date and a calendar view.
 *  
 */

import React, {
    useState,
    useEffect,
    useRef,
} from "react";
import styles from "@/components/Appointments/NavigationPanel/navigationPanel.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import el from "date-fns/locale/el";
import { 
    MdNavigateNext, 
    MdNavigateBefore, 
    MdCalendarMonth
} from "react-icons/md";


/**
 * @interface NavigationPanelProps
 * @property {string} view - The current view type (month, week, day).
 * @property {string} displayLabel - The label to display for the current date.
 * @property {function} onPrev - Callback function for navigating to the previous view.
 * @property {function} onNext - Callback function for navigating to the next view.
 * @property {function} onToday - Callback function for jumping to today's date.
 * @property {function} onDateChange - Callback function for changing the date.
 *
 */
interface NavigationPanelProps {
    view: "month" | "week" | "day";
    displayLabel: string;
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void;
    onToggleCalendar: () => void;
}

/**
 * 
 * @param param0 - The props for the NavigationPanel component.
 * @param {string} view - The current view type (month, week, day).
 * @param {string} displayLabel - The label to display for the current date.
 * @param {function} onPrev - Callback function for navigating to the previous view.
 * @param {function} onNext - Callback function for navigating to the next view.
 * @param {function} onToday - Callback function for jumping to today's date.
 * @param {function} onDateChange - Callback function for opening the calendar view.
 * @returns {JSX.Element} - The rendered NavigationPanel component.
 * @description The NavigationPanel component provides a user interface for navigating through different appointment views.
 *              It includes buttons for navigating to the previous and next views, a button to jump to today's date,
 *              and a button to open a calendar view for selecting a specific date.
 */
const NavigationPanel: React.FC<NavigationPanelProps> = ({
    view,
    displayLabel,
    onPrev,
    onNext,
    onToday,
    onToggleCalendar,
}) => { 

  return (
    <div className={styles.navigationPanel}>
      {/*  */}
      <div className={styles.dayDisplay}>
        <button onClick={onPrev}><MdNavigateBefore/></button>
        <span>{displayLabel}</span>
        <button onClick={onNext}><MdNavigateNext/></button>
      </div>
      {/*  */}
      <div className={styles.controlButtons}>
        <button onClick={onToggleCalendar}> <MdCalendarMonth /> </button>
        <button onClick={onToday}>Σήμερα</button>
      </div>
      {/* Calendar DatePicker */}
    </div>
  );

};

export default NavigationPanel;