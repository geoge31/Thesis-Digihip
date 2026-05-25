/**
 * 
 */

import React, { useState, useRef, useEffect } from "react";
import styles from "@/components/Appointments/SelectView/SelectView.module.css"; 
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

interface SelectProps {
    selectionChange: (view: number) => void;
}

const SelectView: React.FC<SelectProps> = ({ selectionChange }) => {

    const [isActive, setIsActive] = useState<boolean>(false);
    const [activeView, setActiveView] = useState<number>(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const views: { [key: number]: string } = {
        0: "Επιλέξτε Προβολή",
        1: "Μήνας",
        2: "Εβδομάδα",
        3: "Ημέρα",
        // Add other sections as needed
    };

    const ChangeView = (key: number) => {
        setActiveView(key);
        setIsActive(false);
        selectionChange(key);
    };


  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsActive(false);
      }
    };

    if (isActive) {
        if(activeView !== 0) setActiveView(0);
        // selectionChange(0);
        document.addEventListener("mousedown", handleOutsideClick);
    } else {
        document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [activeView,isActive]);

  return (
    <div className={styles.selectView} ref={dropdownRef}>
      {/* Main button to toggle dropdown */}
        <button
            type="button"
            name="toggleView"
            className={`${styles.toggleButton} ${isActive ? styles.isToggle : styles.notToggle}`}
            onClick={() => setIsActive(!isActive)}
        >
            {isActive ? "Επιλέξτε Προβολή": views[activeView]}
            {isActive ? <FaChevronDown /> : <FaChevronRight />}
        </button>
        {/* Dropdown options */}
        {isActive && 
            (
                <div className={styles.activeDiv}>
                    <button
                        type="button"
                        name="monthly" 
                        title="Μήνας"
                        onClick={() => ChangeView(1)}
                    >
                        Μήνας
                    </button>
                    <button
                        type="button"
                        name="weekly" 
                        title="Εβδομάδα"
                        onClick={() => ChangeView(2)}
                    >
                        Εβδομάδα
                    </button>
                    <button
                        type="button"
                        name="daily" 
                        title="Ημέρα"
                        onClick={() => ChangeView(3)}
                    >
                        Ημέρα

                    </button>
                </div>
            )
        }
    </div>
  );
};

export default SelectView;