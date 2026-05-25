
/**
 * @path @/src/app/digihip/log-in
 * @file page.tsx
 *  This component provides for Digihip application: 
    * the log-in page content 
    * the log-in interaction 
    * @geoge31
 */

"use client";

import React, { useState } from "react";
import NavbarLogin from "@/components/NavbarLogin/NavbarLogin";
import styles from "@/digihip/log-in/css/LoginPage.module.css";
import { useRouter } from "next/navigation";
import { useDoctor } from "@/api/_context/Doctors/Context";
import { FaChevronRight } from "react-icons/fa6";

import WrongCredentials from "@/customUtils/alerts/wrongCredentials";

export default function LogInPage() {
  
  const {findDoctorByUsername} = useDoctor();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [] = useState(false);
  const [, setAlertErrMssg] = useState<string | null>(null);
  const [] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    setModalState({ message, option, visibility: show});
  };

  const errorTypes: { [key: number]: string } = {
    1: "Παρακαλούμε συμπληρώστε όλα τα πεδία",
    2: ` Δεν βρέθηκε γιατρός με username/email: ${usernameOrEmail}`,
    3: "Ο κωδικός πρόσβασης είναι λανθασμένος",
    4: "Το πλήκτρο caps lock είναι ενεργοποιημένο",
    5: "Προέκυψε κάποιο σφάλμα :(",
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!usernameOrEmail || !password) {
      setIsLoading(false);
      handleModal(errorTypes[1],"empty",true);
      return;
    }

    const result = await findDoctorByUsername(usernameOrEmail, password);

    if (result.success) {
      sessionStorage.setItem("firstTime","true");
      setIsLoading(false);
      router.push(`/digihip/homepage?doctor=${result.username}`);
    } else {  

      console.error("Login error: ", result.message);

      if (result.status === 401) {
        setAlertErrMssg(`${result.message}`);
        handleModal(errorTypes[3],"psw_usr",true);
        setIsLoading(false);
      } else if (result.status === 404) {
        // Doctor not found — try admin login
        try {
          const adminResponse = await fetch("/api/admins/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usernameOrEmail, password }),
          });

          const adminData = await adminResponse.json();

          if (adminResponse.ok) {
            localStorage.setItem("adminToken", adminData.token);
            setIsLoading(false);
            router.push("/digihip/admin-panel");
          } else if (adminResponse.status === 401) {
            setAlertErrMssg(`${adminData.message}`);
            handleModal(errorTypes[3],"psw_usr",true);
            setIsLoading(false);
          } else {
            handleModal(errorTypes[2],"psw_usr",true);
            setIsLoading(false);
          }
        } catch (adminErr) {
          console.error("Admin login error: ", adminErr);
          handleModal(errorTypes[2],"psw_usr",true);
          setIsLoading(false);
        }
      } else {
        handleModal(errorTypes[5],"psw_usr",true);
      }      
    }
  };

  const checkForCapitalLetters = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isCapsLockOn = e.getModifierState('CapsLock');
    if (isCapsLockOn) {
      handleModal(errorTypes[4], "capskey", true);
    } else {
      handleModal("", "empty", false);
    }
  };

  const closeAlert = () => {
    setModalState((prevState) => ({ ...prevState, visibility: false }));
  };
  
  const Alert = () => {
    if(modalState.visibility) {
      return (
          <WrongCredentials {...modalState}
          onClose={closeAlert}
          
          />
      );
    }
  };

  const LoginContent = () => {
    return (
      <>
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Σελίδα Εισόδου</h2>
                <p>Παρακαλούμε εισάγετε τα στοιχεία σας για να συνδεθείτε</p>
            </div>
            <div className={styles.form}>
                <form onSubmit={handleLogin}>
                    <div className={styles.item}>
                      <label htmlFor='usernameOrEmail'>Όνομα Χρήστη (ή email)</label>
                      <input 
                        type='text' 
                        title='username'
                        name='usernameOrEmail'
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                        onKeyUp={(e) => {checkForCapitalLetters(e)}}/>
                    </div>
                    <div className={styles.item}>
                      <label htmlFor='password'>Κωδικός Πρόσβασης</label>
                      <input 
                        type='password' 
                        name='password'
                        title='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyUp={(e) => {checkForCapitalLetters(e)}}/>
                    </div>
                    <div className={styles.buttons}>
                      <button
                        type='submit'
                        title='login'
                        name='login'>Είσοδος {<FaChevronRight/>}
                      </button>
                    </div>
                    <div className={styles.other}>
                          <p>Ξεχάσατε τον κωδικό πρόσβασης; <a href='/digihip/recover'>Ανάκτηση Κωδικού</a></p>
                    </div>
                </form>
            </div>
        </div>
      </>
    );
  };

  const Loading = () => {
    if(isLoading) {
      return (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Η διαδικασία βρίσκεται σε εξέλιξη. Παρακαλούμε περιμένετε.</span>
        </div>
        );
    }
  }

  return (
    <> 
      <NavbarLogin />
      <main className={styles.main}>
        {Loading()}
        {Alert()}
        <div className={styles.page}>
          {LoginContent()}
        </div>
      </main>
    </>
  );
};
