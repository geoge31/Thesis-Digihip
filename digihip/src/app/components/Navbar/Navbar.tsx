// src/app/components/Navbar.tsx
"use client";  // Add this line at the top

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDoctor } from "@/api/_context/Doctors/Context";
import { useUnreadMessages } from "@/api/_context/UnreadMessages/Context"; // Import the context
import styles from "./css/Navbar.module.css";
import { FaUser, FaChevronDown, FaChevronUp,FaRegUserCircle } from "react-icons/fa";
import { GrPowerForceShutdown } from "react-icons/gr";
import { IoClose } from "react-icons/io5";

export default function Navbar() {
  const { currentDoctorData, loading, logOut } = useDoctor();
  const { unreadCount } = useUnreadMessages(); // Access unreadCount from the context
  const router = useRouter();
  const username = currentDoctorData ? currentDoctorData.username : "null";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [activeItem, setActiveItem] = useState<string>("homepage");
  const toggleModal = () => setIsModalOpen((prev) => !prev);
  const closeModal = () => setIsModalOpen(false);

  const handleNavSectionClick = (path: string, item: string) => {
    setActiveItem(item); 
    router.push(`/digihip/${path}?doctor=${username}`);
  };

  useEffect(() => {
    if (!loading && !currentDoctorData) {
      router.push("/");
    }
  }, [currentDoctorData, loading, router]);

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <h1 className={styles.LoGo}>DiGiHip</h1>
          <div className={styles.navItems}>
            <div
              className={`${styles.item} ${activeItem === "homepage" ? styles.itemActive : ""}`}
              onClick={() => handleNavSectionClick("homepage", "homepage")}
            >
              Αρχική Σελίδα
            </div>

            <div
              className={`${styles.item} ${activeItem === "appointments" ? styles.itemActive : ""}`}
              onClick={() => handleNavSectionClick("appointments", "appointments")}
            >
              Τα Ραντεβού Μου
            </div>

            <div
              className={`${styles.item} ${activeItem === "messages" ? styles.itemActive : ""}`}
              onClick={() => handleNavSectionClick("messages", "messages")}
            >
              Μηνύματα
              {unreadCount > 0 && (
                <span className={styles.unreadBadge}>{unreadCount}</span>
              )}
            </div>

            <div
              className={styles.Actions}
              onClick={toggleModal}
              ref={actionsRef}
            >
              <FaUser />
              {isModalOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>
          </div>
        </div>
      </nav>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} ref={modalRef}>
            <div className={styles.closeModalButton}>
              <button className={styles.closeButton} onClick={closeModal}>
                <IoClose size={22} />
              </button>
            </div>
            <div
            className={styles.Profile}
             onClick={() => router.push(`/digihip/profile?doctor=${username}`)}
          >
          <div className={styles.menuIconRow}>
          <FaRegUserCircle size={18} />
           <span>Προφίλ</span>
           </div>
</div>
           
            <div
              className={styles.Logout}
              onClick={() => {
                setIsLoggingOut(true);
                closeModal();
                logOut();
              }}
            >
              <div className={styles.logoutIcon}>
                <GrPowerForceShutdown size={20} />
                Αποσύνδεση
              </div>
            </div>
          </div>
        </div>
      )}
      {isLoggingOut && (
        <>
          <div className={styles.backdrop} />
          <div className={styles.loadingModal}>
            <div className={styles.spinner}></div>
            <span>Έξοδος</span>
          </div>
        </>
      )}
    </>
  );
}
