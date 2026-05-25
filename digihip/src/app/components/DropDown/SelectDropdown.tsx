import React, { useState, useRef, useEffect } from "react";
import styles from "@/components/Appointments/SelectView/SelectView.module.css";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

/**
 * Option interface defines the structure of each option in the dropdown.
 * Each option has a unique key and a label to display.
 */
interface Option {
  key: number | string;
  label: string;
}

/**
 * SelectDropdown component allows users to select an option from a dropdown list.
 * It supports custom options, placeholder text, and can reset the selection when opened.
 */
interface SelectDropdownProps {
  options: Option[];
  onSelect: (key: number | string) => void;
  placeholder?: string;
  initialKey?: number | string;
  resetOnOpen?: boolean;
}

/**
 * SelectDropdown component implementation.
 * 
 * @param options - Array of options to display in the dropdown.
 * @param onSelect - Callback function to call when an option is selected.
 * @param placeholder - Placeholder text to display when no option is selected.
 * @param initialKey - Initial selected key, defaults to null.
 * @param resetOnOpen - If true, resets the selection when the dropdown is opened.
 * @returns JSX.Element - The rendered dropdown component.
 * @path digihip/src/app/components/DropDown/SelectDropdown.tsx
 * @description
 * SelectDropdown is a reusable component that provides a dropdown menu
 * for selecting options. It features:
 * - Customizable options
 * - Placeholder text
 * - Initial selection state
 * - Ability to reset selection when opened
 * It uses React hooks for state management and effects, and includes
 * click handling to manage dropdown visibility and selection.
 *    
 * @author Giorgos Geramoutsos 
 * @date 30/06/2025
 */
const SelectDropdown: React.FC<SelectDropdownProps> = ({
  options,
  onSelect,
  placeholder = "",
  initialKey = null,
  resetOnOpen = false,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [activeKey, setActiveKey] = useState<number | string | null>(initialKey);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClick = (key: number | string) => {
    setActiveKey(key);
    setIsActive(false);
    onSelect(key);
  };

  const selectedLabel = options.find((opt) => opt.key === activeKey)?.label;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsActive(false);
      }
    };

    if (isActive) {
      if (resetOnOpen) setActiveKey(null);
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isActive, resetOnOpen]);

  return (
    <div className={styles.selectView} ref={dropdownRef}>
      <button
        type="button"
        className={`${styles.toggleButton} ${isActive ? styles.isToggle : styles.notToggle}`}
        onClick={() => setIsActive((prev) => !prev)}
      >
        {isActive ? placeholder : selectedLabel || placeholder}
        {isActive ? <FaChevronDown /> : <FaChevronRight />}
      </button>

      {isActive && (
        <div className={styles.activeDiv}>
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => handleClick(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;
