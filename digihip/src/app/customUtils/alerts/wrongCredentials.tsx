/**
 * Custom Modal for handling errors in login and signup
 */
import React, { useState, useEffect } from "react";
import styles from "@/customUtils/alerts/css/wrongPassword.module.css";
import { IoClose } from "react-icons/io5";

interface WrongCredentialsProps {
    message: string;
    option: "psw_usr" | "capskey" | "empty" | "non_matching_passwords" | "already_registered";
    onClose: () => void;
    visibility: boolean;
}
const WrongCredentials: React.FC<WrongCredentialsProps> = ({ message, option, onClose, visibility }) => {

    const [, setIsVisible] = useState(visibility);

    useEffect(() => {
        if (visibility) {
        setIsVisible(true);
        const autoClose = setTimeout(() => onClose(), 4000);
        return () => clearTimeout(autoClose);
        } else {
        const timer = setTimeout(() => setIsVisible(false), 500);
        return () => clearTimeout(timer);
        }
    }, [visibility]);

    const colorOptions: { [key: string]: string } = {
        psw_usr: styles.errorRed, 
        capskey: styles.warningOrange,
        empty: styles.infoBlue,
        non_matching_password: styles.errorRed,
        already_registered: styles.warningOrange,
    };

    const containerClass = colorOptions[option] || styles.defaultStyle;

    return (
        <div className={`${styles.item} ${containerClass}`}>
          <p>{message}</p>
          <IoClose className={styles.icon} size={17} onClick={onClose} />
        </div>
      );
  };
  
  export default WrongCredentials;