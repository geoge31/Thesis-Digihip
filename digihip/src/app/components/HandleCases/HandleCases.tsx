/**
 * Custom Modal for handling general actions 
 * @path @/components/HandleCases
 * @file HandleCases.tsx
 */
import React, { useState, useEffect } from "react";
import styles from "@/components/HandleCases/HandleCases.module.css";
import { IoClose } from "react-icons/io5";

/**
 * 
 */
interface HandleCasesProps {
    message: string;
    option: "loading" | "success" | "fail";
    onClose: () => void;
    visibility: boolean;
}
/**
 * 
 * @param param0 
 * @returns 
 */
const HandleCases: React.FC<HandleCasesProps> = ({ message, option, onClose, visibility }) => {

    const [, setIsVisible] = useState(visibility);

    useEffect(() => {
        if (visibility) {
        setIsVisible(true);
        } else {
        // delay for the animation to finish before unmounting
        const timer = setTimeout(() => setIsVisible(false), 500);
        return () => clearTimeout(timer);
        }
    }, [visibility]);

    const colorOptions: { [key: string]: string } = {
        loading: styles.loadGrey,
        success: styles.succGreen, 
        fail: styles.failRed,
    };

    const containerClass = colorOptions[option] || styles.defaultStyle; // Fallback for unknown options  

    return (
        <div className={`${styles.item} ${containerClass}`}>
          <p>{message}</p>
          <IoClose className={styles.icon} size={17} onClick={onClose} />
        </div>
      );
  };

  export default HandleCases;
