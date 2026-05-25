/**
 * Doctor's Profile page
 * This component provides the doctor's profile page for the DiGihip Application
 * @path @/src/app/digihip/profile
 * @geoge31
 */

'use client';

import styles from '@/digihip/profile/css/DoctorProfile.module.css'
import React, { useState, useEffect } from 'react';
import { useDoctor } from '@/api/_context/Doctors/Context';
import { updateDoctor } from '@/digihip/profile/methods/update/updateDoctor';
import CustomAlert from '@/digihip/profile/alert/customAlert';
import HandleCases from "@/components/HandleCases/HandleCases";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function DoctorProfile () {

    const {currentDoctorData} = useDoctor();
    const [editMode,setEditMode] = useState(false);
    const [showAlert,setShowAlert] = useState(false);
    const [alertMssg,setAlertErrMssg] = useState<string | null>(null);
    const [alertOption,setAlertOption] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordError, setPasswordError] = useState("");
    const [showPassword, setShowPassword] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });
    const [modalState, setModalState] = useState<{
        message: string;
        option: "loading" | "success" | "fail";
        visibility: boolean;
    }>({
        message: "",
        option: "success",
        visibility: false,
    });

    const handleModal = (message: string, option: "loading" | "success" | "fail", show: boolean) => {
        setModalState({ message, option, visibility: show});
    };

    const currentID = currentDoctorData?._id || '';

    const doctorCredentials = currentDoctorData ? 
       {
        usrnm: currentDoctorData.username,
        email: currentDoctorData.email,
        fname: currentDoctorData.firstname,
        lname: currentDoctorData.lastname,
       } : {};

    const [doctorData, setDoctorData] = useState({
        usrnm: currentDoctorData?.username || '',
        email: currentDoctorData?.email || '',
        fname: currentDoctorData?.firstname || '',
        lname: currentDoctorData?.lastname || '',
    });

    const [oldDoctorData, setOldDoctorData] = useState(doctorData);

    useEffect(() => {
        if (currentDoctorData) {
            const initialData = {
                usrnm: currentDoctorData.username,
                email: currentDoctorData.email,
                fname: currentDoctorData.firstname,
                lname: currentDoctorData.lastname,
            };
            setDoctorData(initialData);
            setOldDoctorData(initialData);
        }
    }, [currentDoctorData]);

    const handleEditToggle = () => {
        if (editMode) {
            setDoctorData(oldDoctorData); 
        }
        setEditMode(!editMode); 
    };

    const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        
        const { name, value } = e.target;

        if(name === "fname" || name === "lname") {
            const valueToUpperCase = value.toUpperCase();
            setDoctorData({ ... doctorData, [name]: valueToUpperCase });

        } else {
            setDoctorData({ ...doctorData, [name]: value });
        }
    };

    const handleUpdate = async () => {
        setIsLoading(true);
        handleModal("Η ενημέρωση δεδομένων βρίσκεται σε εξέλιξη. Παρακαλούμε περιμένετε.", "loading", true);
        
        const updates = {
            username: doctorData.usrnm,
            email: doctorData.email,
            firstName: doctorData.fname,
            lastName: doctorData.lname,
        }

        const result = await updateDoctor(currentID,updates);

        if(!result) {
            console.error("doctor did not update.", result.doctor);
            setIsLoading(false);
            handleModal("Προέκυψε κάποιο σφάλμα κατά την ενημέρωση των στοιχείων.", "fail", true);
            setEditMode(false);
            return;
        }

        console.log("doctor updated successfully", result.doctor);
        setOldDoctorData(doctorData);
        setEditMode(false);
        setIsLoading(false);
        handleModal("Η ενημέρωση των στοιχείων ολοκληρώθηκε με επιτυχία", "success", true);
    };

    const handlePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordForm({ ...passwordForm, [name]: value });
        setPasswordError("");
    };

    const handleChangePassword = async () => {
        const { currentPassword, newPassword, confirmPassword } = passwordForm;

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("Παρακαλούμε συμπληρώστε όλα τα πεδία.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Οι νέοι κωδικοί δεν ταιριάζουν.");
            return;
        }

        setIsLoading(true);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch("/api/doctors/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                setPasswordError(data.message || "Προέκυψε κάποιο σφάλμα.");
                setIsLoading(false);
                return;
            }

            setShowPasswordModal(false);
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setPasswordError("");
            setIsLoading(false);
            handleModal("Ο κωδικός πρόσβασης άλλαξε με επιτυχία!", "success", true);
        } catch (error) {
            console.error("Error changing password:", error);
            setPasswordError("Προέκυψε κάποιο σφάλμα.");
            setIsLoading(false);
        }
    };

    return (
        <>
            <main className={styles.main}>
                <div className={styles.doctorProfilePage}>
                    <h3>Προσωπικά Στοιχεία</h3>
                    <div className={styles.doctorCredentials}>
                        <div className={styles.rowContainer}>
                            <div className={styles.itemA}>
                                Όνομα Χρήστη
                            </div>
                            <div className={styles.itemB}>
                                <input 
                                    type="text" 
                                    name="usrnm"
                                    value={doctorData.usrnm} 
                                    onChange={handleDataChange}
                                    disabled={!editMode}/>
                            </div>
                        </div>
                        <div className={styles.rowContainer}>
                            <div className={styles.itemA}>
                                Email
                            </div>
                            <div className={styles.itemB}>
                                <input 
                                    type="text"
                                    name="email" 
                                    value={doctorData.email}
                                    onChange={handleDataChange} 
                                    disabled={!editMode}/>
                            </div>
                        </div>
                        <div className={styles.rowContainer}>
                            <div className={styles.itemA}>
                                Όνομα
                            </div>
                            <div className={styles.itemB}>
                                <input 
                                    type="text"
                                    name="fname" 
                                    value={doctorData.fname}
                                    onChange={handleDataChange}
                                    disabled={!editMode}/>
                            </div>
                        </div>
                        <div className={styles.rowContainer}>
                            <div className={styles.itemA}>
                                Επίθετο
                            </div>
                            <div className={styles.itemB}>
                                <input 
                                    type="text" 
                                    name="lname"
                                    value={doctorCredentials.lname} 
                                    onChange={handleDataChange}
                                    disabled={!editMode}/>
                            </div>
                        </div>
                        <div className={styles.rowContainer}>
                            <div className={styles.itemA}>
                                Κωδικός Πρόσβασης
                            </div>
                            <div className={styles.itemB}>
                                <button onClick={() => setShowPasswordModal(true)}>Αλλαγή Κωδικού Πρόσβασης</button>
                            </div>
                        </div>

                    </div>
                    <div className={styles.buttonsSection}>
                        { editMode ? (
                            <div className={styles.editMode}>
                                <button 
                                    className={styles.cancelButton}
                                    onClick={handleEditToggle}>
                                        Ακύρωση
                                </button>
                                <button 
                                    className={styles.saveButton}
                                    onClick={handleUpdate}>
                                        Αποθήκευση
                                </button>
                            </div>
                        ) : (
                            <div>
                                <button 
                                    className={styles.editButton}
                                    onClick={handleEditToggle}>
                                        Eπεξεργασία
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {modalState.visibility && (<HandleCases 
                {...modalState}
                onClose={() => setModalState((prev) => ({ ...prev, visibility: false }))}
                />
                )}
                { showAlert && (
                    <CustomAlert
                        message={alertMssg}
                        option={alertOption}
                        onClose={() => setShowAlert(false)}
                    />
                )}
                {showPasswordModal && (
                    <div className={styles.passwordModalOverlay}>
                        <div className={styles.passwordModal}>
                            <h3>Αλλαγή Κωδικού Πρόσβασης</h3>
                            <div className={styles.passwordFormGroup}>
                                <label>Τρέχων Κωδικός</label>
                                <div className={styles.passwordInputWrapper}>
                                    <input
                                        type={showPassword.currentPassword ? "text" : "password"}
                                        name="currentPassword"
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordFormChange}
                                    />
                                    <button
                                        type="button"
                                        className={styles.eyeButton}
                                        onClick={() => setShowPassword(prev => ({ ...prev, currentPassword: !prev.currentPassword }))}
                                    >
                                        {showPassword.currentPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                            <div className={styles.passwordFormGroup}>
                                <label>Νέος Κωδικός</label>
                                <div className={styles.passwordInputWrapper}>
                                    <input
                                        type={showPassword.newPassword ? "text" : "password"}
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordFormChange}
                                    />
                                    <button
                                        type="button"
                                        className={styles.eyeButton}
                                        onClick={() => setShowPassword(prev => ({ ...prev, newPassword: !prev.newPassword }))}
                                    >
                                        {showPassword.newPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                            <div className={styles.passwordFormGroup}>
                                <label>Επιβεβαίωση Νέου Κωδικού</label>
                                <div className={styles.passwordInputWrapper}>
                                    <input
                                        type={showPassword.confirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordFormChange}
                                    />
                                    <button
                                        type="button"
                                        className={styles.eyeButton}
                                        onClick={() => setShowPassword(prev => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                                    >
                                        {showPassword.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                            {passwordError && (
                                <div className={styles.passwordError}>
                                    <p>{passwordError}</p>
                                </div>
                            )}
                            <div className={styles.passwordModalButtons}>
                                <button
                                    className={styles.cancelButton}
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                                        setPasswordError("");
                                    }}
                                >
                                    Ακύρωση
                                </button>
                                <button
                                    className={styles.saveButton}
                                    onClick={handleChangePassword}
                                >
                                    Αλλαγή
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
};