/**
 * @path @/src/app/digihip/recover
 * @file page.tsx
 *  Password recovery page
 */

"use client";

import React, { useState } from "react";
import NavbarLogin from "@/components/NavbarLogin/NavbarLogin";
import styles from "./css/RecoverPage.module.css";
import WrongCredentials from "@/customUtils/alerts/wrongCredentials";
import { FaChevronLeft } from "react-icons/fa6";

export default function RecoverPage() {

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecovered, setIsRecovered] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [modalState, setModalState] = useState<{
    message: string;
    option: "psw_usr" | "capskey" | "empty";
    visibility: boolean;
  }>({
    message: "",
    option: "empty",
    visibility: false,
  });

  const handleModal = (message: string, option: "psw_usr" | "capskey" | "empty", show: boolean) => {
    setModalState({ message, option, visibility: show });
  };

  const closeAlert = () => {
    setModalState((prevState) => ({ ...prevState, visibility: false }));
  };

  const handleRecover = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!usernameOrEmail) {
      handleModal("Παρακαλούμε συμπληρώστε το πεδίο", "empty", true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/doctors/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        handleModal(data.message || "Προέκυψε κάποιο σφάλμα :(", "psw_usr", true);
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Ο νέος κωδικός εστάλη στο email σας!");
      setIsRecovered(true);
      setIsLoading(false);

    } catch (error) {
      console.error("Recovery error:", error);
      handleModal("Προέκυψε κάποιο σφάλμα :(", "psw_usr", true);
      setIsLoading(false);
    }
  };

  const Alert = () => {
    if (modalState.visibility) {
      return (
        <WrongCredentials
          {...modalState}
          onClose={closeAlert}
        />
      );
    }
  };

  const Loading = () => {
    if (isLoading) {
      return (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Η διαδικασία βρίσκεται σε εξέλιξη. Παρακαλούμε περιμένετε.</span>
        </div>
      );
    }
  };

  return (
    <>
      <NavbarLogin />
      <main className={styles.main}>
        {Loading()}
        {Alert()}
        <div className={styles.page}>
          <div className={styles.container}>
            <div className={styles.backLink}>
              <a href="/digihip/log-in"><FaChevronLeft /> Επιστροφή στη σύνδεση</a>
            </div>
            <div className={styles.header}>
              <h2>Ανάκτηση Κωδικού</h2>
              <p>Εισάγετε το όνομα χρήστη ή το email σας για να ανακτήσετε τον λογαριασμό σας</p>
            </div>
            <div className={styles.form}>
              <form onSubmit={handleRecover}>
                <div className={styles.item}>
                  <label htmlFor="usernameOrEmail">Όνομα Χρήστη ή Email</label>
                  <input
                    type="text"
                    name="usernameOrEmail"
                    title="usernameOrEmail"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    disabled={isRecovered}
                  />
                </div>
                <div className={styles.buttons}>
                      <button
                        type="submit"
                        title="recover"
                        name="recover"
                        disabled={isRecovered}
                      >
                        Ανάκτηση
                      </button>
                </div>
                </form>
            </div>
          </div>
        </div>
        {successMessage && (
          <>
            <div className={styles.backdrop} />
            <div className={styles.successModal}>
              <div className={styles.successIcon}>✓</div>
              <span>{successMessage}</span>
              <a href="/digihip/log-in" className={styles.successLink}>Επιστροφή στη σύνδεση</a>
            </div>
          </>
        )}
      </main>
    </>
  );
}
