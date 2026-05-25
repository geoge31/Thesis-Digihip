"use client";
/**
 * Patient Details
 * This component provides the page of a patient for Digihip application
 * @path @/src/app/dighip/patient-details/
 * @file page.tsx
 * @author: @geoge31
 */

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useDoctor } from "@/api/_context/Doctors/Context";
import { usePatientProvider } from "@/api/_context/Patients/Context";
import { useAppointmentProvider } from "@/api/_context/Appointments/Context";
import { useNotification } from '@/api/_context/Notifications/Context';
import HandleCases from "@/components/HandleCases/HandleCases";

import { PatientData } from "@/utils/interfaces/interfaceModules";

import FirstPage from "@/digihip/patient-details/modules/FirstPage/FirstPage";
import SecondPage from "@/digihip/patient-details/modules/SecondPage/SecondPage";

import PatientAppointmentModal from "@/components/PatientAppointmentModal/PatientAppointmentModal";
import PatientNotificationModal from '@/components/PatientNotificationModal/PatientNotificationModal';

import styles from "./css/PatientDetails.module.css";
import { FaChevronRight, FaTrash, FaPause, FaPlay } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import { GrNext, GrPrevious } from "react-icons/gr";
import { TiPlus } from "react-icons/ti";
import { CreateAppointment } from "@/services/appointments/createAppointment";

import { INotificationItem } from '/models/Notification';
import { formatDate, formatTime, calculateAge } from "@/utils/date/dateUtils";

const notificationCategories = {
  'Καθημερινή Υγεία': [
      'Να λαμβάνει τα φάρμακά του.',
      'Να κάνει την ένεση του.',
      'Να μετρήσει την πίεση του.',
      'Να μείνει ενυδατωμένος και να τρώει καλά.',
    ],
    'Αποκατάσταση και Φυσικοθεραπεία': [
      'Να κάνει τις διατάσεις του και να ακολουθεί τις οδηγίες του φυσικοθεραπευτή.',
      'Να μην καταπονεί το τραυματισμένο σημείο. Αν χρειάζεται να χρησιμοποιεί πατερίτσες.',
    ],
    'Γενικές Ειδοποιήσεις': [
      'Αν εμφανιστεί έντονος πόνος, πρήξιμο, πυρετός ή κάτι ασυνήθιστο, να επικοινωνήσει με τον γιατρό.',
      'Αν παρατηρήσει κάτι ασυνήθιστο, να επικοινωνήσει με τον γιατρό άμεσα.',
      'Εάν ο πόνος είναι μη διαχειρίσιμος, να λάβει παυσίπονα και χρήση πάγου.',
    ],
};

export default function PatientPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PatientPageContent />
    </Suspense>
  );
}

function PatientPageContent() {
  const { currentDoctorData, loading } = useDoctor();
  const { patientsList, isLoading, isError } = usePatientProvider();
  const { appointmentsList, refetchAppointments } = useAppointmentProvider();
  const { setNotificationsForPatient, getNotificationsForPatient, deleteNotificationItem, toggleNotificationActive } = useNotification();
  const [modalState, setModalState] = useState<{ message: string; option: "loading" | "success" | "fail"; visibility: boolean }>({
    message: "", option: "loading", visibility: false,
  });

  const router = useRouter();
  const query = useSearchParams();
  const pNid = query.get("id") as string;

  const [patient, setPatient] = useState<PatientData | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const [page, setPage] = useState<number>(1);

  const [currentSectionA, setCurrentSectionA] = useState<string>("demographics");
  const [currentHeaderB, setCurrentHeaderB] = useState<string>("preoperation");
  const [currentSectionB, setCurrentSectionB] = useState<string>("preInstr");
  const [currentSelectionB, setCurrentSelectionB] = useState(1);

  {/* added by Manos */}
  const [isΝModalVisible, setIsΝModalVisible] = useState(false);
  const [ currNotifications, setcurrNotifications ] = useState<INotificationItem[]>([]);

  const openΝModal = () => setIsΝModalVisible(true);
  const closeΝModal = () => setIsΝModalVisible(false);

  const groupedNotifications = currNotifications.reduce((acc, notification) => {
    if (!acc[notification.title]) {
      acc[notification.title] = [];
    }
    acc[notification.title].push(notification);
    return acc;
  }, {} as Record<string, INotificationItem[]>);

  const sectionADisplayNames: { [key: string]: string } = {
    demographics: "Δημογραφικά Στοιχεία",
    medical: "Ιατρικό Αναμνηστικό",
    operation: "Πληροφορίες Επέμβασης",
    other: "Άλλα",
    // Add other sections as needed
  };

  const headersBDisplayNames: { [key: string]: string } = {
    preoperation: `Προεγχειρητικό Στάδιο`,
    postoperation: "Μετεγχειρητικό Στάδιο",
    //
  };

  const sectionBDisplayNames: { [key: string]: string } = {
    preInstr: "Οδηγίες",
    preExcs: "Ασκήσεις",
    preStats: "Στατιστικά",
    postInstr: "Οδηγίες",
    postExcs: "Ασκήσεις",
    postStats: "Στατιστικά",
    // Add other sections as needed
  };

  const [currentAppointments, setCurrentAppointments] = useState("upcoming");

  // const username = currentDoctorData?.username;

  const patientData = {
    psId: patient?._id ?? "",
    pfname: patient?.firstname ?? "",
    plname: patient?.lastname ?? "",
    pname:
      patient?.firstname && patient?.lastname
        ? `${patient.firstname} ${patient.lastname}`
        : "",
    pbdate: patient?.birthdate
      ? new Date(patient?.birthdate).toLocaleDateString()
      : "Δεν βρέθηκε ημερομηνία γέννησης",
    pamka: patient?.amka ? patient?.amka : "Δεν βρέθηκε ΑΜΚΑ ασθενή",
    pamedcode: patient?.amedcode
      ? patient?.amedcode
      : "Δεν βρέθηκε κωδικός amed ασθενή",
    pemail: patient?.email ? patient?.email : "Δεν βρέθηκε email ασθενή",
    pphone: patient?.mobilephone
      ? patient?.mobilephone
      : "Δεν βρέθηκε τηλέφωνο επικοινωνίας ασθενή",
    paddress:
      patient?.address === ""
        ? "Δεν ορίστηκε διεύθυνση κατοικίας"
        : !patient?.address
        ? "Δεν βρέθηκε διεύθυνση κατοικίας ασθενή"
        : patient?.address,
    pheight: patient?.height ? patient?.height : "Δεν βρέθηκε ύψος ασθενή",
    pweight: patient?.weight ? patient?.weight : "Δεν βρέθηκε βάρος ασθενή",
    pbloodtype: patient?.bloodtype
      ? patient?.bloodtype
      : "Δεν βρέθηκε ομάδα αίματος ασθενή",
    pchrondis: patient?.chronicDiseases ? patient?.chronicDiseases : "Οχι",
    ppastop: patient?.pastOperations ? patient?.pastOperations : "Οχι",
    pallergies: patient?.allergies ? patient?.allergies : "Οχι",
    psmokin: patient?.smoking ? "Ναι" : "Οχι",
    palcohol: patient?.alcohol ? "Ναι" : "Οχι",
    psupervisor: patient?.supervisorDoctor
      ? patient?.supervisorDoctor
      : "Δεν ορίστηκε επιβλέπων ιατρός",
    pstage: patient?.currentStage
      ? patient?.currentStage
      : "Δεν βρέθηκε τρέχον στάδιο ασθενή",
    popleg:
      patient?.legOperation === "RIGHT"
        ? "Δεξί"
        : patient?.legOperation === "LEFT"
        ? "Αριστερό"
        : "Δεν ορίστηκε σκέλος επέμβασης",
    pitsadmin: patient?.admin
      ? `${patient?.admin.firstName} ${patient?.admin.lastName}`
      : "Δεν βρέθηκε διαχειριστής",
    patientEntryDate: patient?.entryDate
      ? new Date(patient?.entryDate).toLocaleDateString()
      : "Δεν ορίστηκε ημερομηνία εισαγωγής",
    patientOperationDate: patient?.operationDate
      ? new Date(patient?.operationDate).toLocaleDateString()
      : "Δεν ορίστηκε ημερομηνία επέμβασης",
    patientExitDate: patient?.exitDate
      ? new Date(patient?.exitDate).toLocaleDateString()
      : "Δεν ορίστηκε ημερομηνία εξόδου",
    pcreated: patient?.createdAt
      ? new Date(patient?.createdAt).toLocaleDateString()
      : "Δεν ορίστηκε ημερομηνία",
    pupdated: patient?.updatedAt
      ? new Date(patient?.updatedAt).toLocaleDateString()
      : "Δεν ορίστηκε ημερομηνία",
  };

  const appointments = Array.isArray(appointmentsList)
    ? appointmentsList.filter(
        (appointment) => appointment.patient?._id === patient?._id
      )
    : [];

  const handleBackButton = () => {
    router.back();
  };

  const previewAppointments = () => {
    const isToday = new Date();

    const upcomingAppointments = appointments
      .filter(
        (appointment) =>
          appointment.datetime &&
          new Date(appointment.datetime) > isToday
      )
      .sort(
        (a, b) =>
          new Date(a.datetime ?? "1970-01-01T00:00:00Z").getTime() -
          new Date(b.datetime ?? "1970-01-01T00:00:00Z").getTime()
      );

    const completedAppointments = appointments.filter(
      (appointment) =>
        appointment.datetime &&
        new Date(appointment.datetime) <= isToday
    );

    switch (currentAppointments) {
      case "upcoming":
        return (
          <>
            <div className={styles.upcomingAppts}>
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                    <div key={appointment._id} className={styles.appointmentItem}
                        title={`Ημερομηνία : ${formatDate(appointment.datetime)}\nΏρα : ${formatTime(appointment.datetime)}\nΑσθενής : ${appointment.patient?.firstname} ${appointment.patient?.lastname}\nΑιτιολογία: ${appointment.reason}\nΣημείωση: ${appointment.note || "Δεν υπάρχει σημείωση"}\nΓιατρός: ${appointment.doctor}\n`}
                    >
                    <p className={styles.ellipsis}>
                      {new Date(
                        appointment.datetime ?? "1970-01-01T00:00:00Z"
                      ).toLocaleString("el", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <p>Δεν βρέθηκαν Ολοκληρωμένα Ραντεβού</p>
              )}
            </div>
          </>
        );
      case "completed":
        return (
          <>
            <div className={styles.completedAppointments}>
              {completedAppointments.length > 0 ? (
                completedAppointments.map((appointment) => (
                    <div key={appointment._id} className={styles.appointmentItem}
                        title={`Ημερομηνία : ${formatDate(appointment.datetime)}\nΏρα : ${formatTime(appointment.datetime)}\nΑσθενής : ${appointment.patient?.firstname} ${appointment.patient?.lastname}\nΑιτιολογία: ${appointment.reason}\nΣημείωση: ${appointment.note || "Δεν υπάρχει σημείωση"}\nΓιατρός: ${appointment.doctor}\n`}
                    >
                    <p className={styles.ellipsis}>
                      {new Date(
                        appointment.datetime ?? "1970-01-01T00:00:00Z"
                      ).toLocaleString("el", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <p>Δεν βρέθηκαν Ολοκληρωμένα Ραντεβού</p>
              )}
            </div>
          </>
        );
      default:
        return;
    }
  };

  const displayHeader = () => {
    if (page === 1) {
      return (
        <div className={styles.header}>
          <p>Καρτέλα Ασθενή </p>
          <FaChevronRight />
          <p> Σελίδα 1η</p>
          <FaChevronRight />
          <p>{sectionADisplayNames[currentSectionA]}</p>
        </div>
      );
    } else if (page === 2) {
      return (
        <div className={styles.header}>
          <p>Καρτέλα Ασθενή </p>
          <FaChevronRight />
          <p> Σελίδα 2η</p>
          <FaChevronRight />
          <p>{headersBDisplayNames[currentHeaderB]}</p>
          <FaChevronRight />
          <p>{sectionBDisplayNames[currentSectionB]}</p>
        </div>
      );
    } else {
      return;
    }
  };

  const handleClickSectionA = (option: string) => {
    setCurrentSectionA(option);
  };

  const handleClickHeaderB = (
    header: string,
    selection: React.SetStateAction<number>
  ) => {
    setCurrentHeaderB(header);
    setCurrentSelectionB(selection);
  };

  const handleClickSectionB = (option: string) => {
    setCurrentSectionB(option);
  };

  const handleSelectAppointments = (value: string) => {
    setCurrentAppointments(value);
  };

  const handleSwitchPage = () => {
    if (page === 1) {
      setPage(2);
    } else {
      setPage(1);
    }
  };

  const handleTogglePause = async (notification) => {
    try {
      const res = await fetch('/api/agenda/handleJob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            refID: notification.refID, 
            isActive: notification.isActive 
        }),
      });
  
      const data = await res.json();
      if (data.success) {
        // changes the isActive 
        try {
          const updateResponse  = await fetch(`/api/notifications`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            } ,
            body: JSON.stringify({
              action: "toggleActive", // PATCH method has 2 actions
              patientId: patientData.psId,
              notificationId: notification._id,
              isActive: notification.isActive,
            }),
          });

          if (!updateResponse .ok) throw new Error('HTTP error: update notification');
      
          const updateResult = await updateResponse.json();
          
          if(!updateResult.success) throw new Error('Failed to update notification');
          
        } 
        catch(error) {
          console.error(`Error processing ${notification.message}:`, error);
        }
        toggleNotificationActive(patientData.psId, notification._id); // update context
        setcurrNotifications((prev) => // update local
            prev.map((n) =>
                n._id === notification._id
                    ? { ...n, isActive: !n.isActive }
                    : n
            )
        );
      }
    } catch (err) {
      console.error('Error toggling job pause:', err);
    }       
  };
  
  const handleDeleteNotification = async (notification) => {
    try {
      const response  = await fetch(`/api/notifications`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        } ,
        body: JSON.stringify({
          patientId: patientData.psId,
          notificationId: notification._id,
        }),
      });

      if (!response .ok) throw new Error('HTTP error: DELETE notification');
  
      const result = await response.json();
      if(!result.success) throw new Error('Failed to DELETE notification');
      deleteNotificationItem(patientData.psId, notification._id);     // update context
      setcurrNotifications(prev =>    // update local
        prev.filter(n => n._id !== notification._id)
      );   
    } catch(error) {
      console.error(`Error processing ${notification.message}:`, error);
    }   
  };

  const reverseMessageMap: Record<string, string> = {
    'Να λαμβάνετε τα φάρμακά σας.': 'Να λαμβάνει τα φάρμακά του.',
    'Να κάνετε την ένεσή σας.': 'Να κάνει την ένεση του.',
    'Να μένετε ενυδατωμένος/η και να τρέφεστε σωστά.': 'Να μείνει ενυδατωμένος και να τρώει καλά.',
    'Να μετράτε την πίεσή σας.': 'Να μετρήσει την πίεση του.',
    'Να κάνετε τις διατάσεις σας και να ακολουθείτε τις οδηγίες του φυσικοθεραπευτή σας.':
    'Να κάνει τις διατάσεις του και να ακολουθεί τις οδηγίες του φυσικοθεραπευτή.',
    'Μην καταπονείτε το τραυματισμένο σημείο. Αν χρειάζεται, χρησιμοποιήστε πατερίτσες.':
    'Να μην καταπονεί το τραυματισμένο σημείο. Αν χρειάζεται να χρησιμοποιεί πατερίτσες.',
    'Αν εμφανιστεί έντονος πόνος, πρήξιμο, πυρετός ή κάτι ασυνήθιστο, επικοινωνήστε με τον γιατρό σας.':
    'Αν εμφανιστεί έντονος πόνος, πρήξιμο, πυρετός ή κάτι ασυνήθιστο, να επικοινωνήσει με τον γιατρό.',
    'Αν παρατηρήσετε κάτι ασυνήθιστο, επικοινωνήστε άμεσα με τον γιατρό.':
    'Αν παρατηρήσει κάτι ασυνήθιστο, να επικοινωνήσει με τον γιατρό άμεσα.',
    'Αν ο πόνος δεν είναι διαχειρίσιμος, πάρτε παυσίπονα και εφαρμόστε πάγο.':
    'Εάν ο πόνος είναι μη διαχειρίσιμος, να λάβει παυσίπονα και χρήση πάγου.',
  };


  useEffect(() => {
    if (!currentDoctorData && !loading) router.push(`/`);
  }, [currentDoctorData, loading, router]);

  useEffect(() => {
    if (pNid && patientsList) {
      const foundPt = patientsList.find((p) => p.id === Number(pNid)) ?? null;
      console.log("Found patient:", foundPt);
      setPatient(foundPt);
    }
  }, [pNid, patientsList]);

  useEffect(() => {
    if (!appointmentsList) refetchAppointments();
  }, [appointmentsList, refetchAppointments]);

  useEffect(() => {
    if(patientData.psId) setcurrNotifications(getNotificationsForPatient(patientData.psId));
  }, [patientData.psId]);

  useEffect(() => {
    if(patient) {
      console.log("Patient keys & values:");
      Object.entries(patient).forEach(([key, value]) => {
        console.log(key, value);
      });
    }
  }, [patient]);

  if (isError)
    return <div>Προέκυψε κάποιο σφάλμα με τα δεδομένα τ@ ασθενή.</div>;
  if (!isLoading && !patient) return <div>Δεν βρέθηκε ο ασθενής.</div>;

  return (
    <main className={styles.main}>
      {(isLoading || !patient) && (
        <>
          <div className={styles.backdrop} data-app-loading="true" />
          <div className={styles.loadingModal}>
            <div className={styles.spinner}></div>
            <span>Φόρτωση λεπτομερειών ασθενή. Παρακαλούμε περιμένετε.</span>
          </div>
        </>
      )}
      {patient && (<>
      <div className={styles.page}>
        <div className={styles.header}>
          <button type="button" title="back" name='bck-btn' onClick={handleBackButton}>
            {<IoMdArrowRoundBack />}
          </button>
          {displayHeader()}
        </div>
        <div className={styles.container}>
          <div className={styles.info}>
            <div className={styles.card}>
              <div className={styles.cardName}>
                <h4>{patientData.pname}</h4>
              </div>
              <div className={styles.cardItem}>
                <p>Ημερομηνία Γέννησης</p>
                <p>
                  <b>{patientData.pbdate}</b>
                </p>
              </div>
              <div className={styles.cardItem}>
                <p>Ηλικία</p>
                <p><b>{calculateAge(patient?.birthdate)}</b></p>
              </div>
              <div className={styles.cardItem}>
                <p>Τηλέφωνο Επικοινωνίας</p>
                <p>
                  <b>{patientData.pphone}</b>
                </p>
              </div>
              <div className={styles.cardItem}>
                <p>Email</p>
                <p>
                  <b>{patientData.pemail}</b>
                </p>
              </div>
              <div className={styles.cardItem}>
                <p>Διεύθυνση Κατοικίας</p>
                <p>
                  <b>{patientData.paddress}</b>
                </p>
              </div>
              <div className={styles.cardItem}>
                <p>Στάδιο</p>
                <p>
                  <b>{patientData.pstage}</b>
                </p>
              </div>
            </div>
            <div className={styles.appointments}>
              <div className={styles.appointmentScroll}>
                <div className={styles.apptsHeader}>
                    <div className={styles.apptsHeaderTitle}>
                        <h3>Ραντεβού</h3>
                        <button onClick={openModal} title="Προσθήκη Ραντεβού">{<TiPlus />}</button>
                    </div>
                    <select
                        name="displayappointments"
                        title="select-view"
                        onChange={(e) => handleSelectAppointments(e.target.value)}
                    >
                        <option value="upcoming">Επόμενα Ραντεβού</option>
                        <option value="completed">Ολοκληρωμένα Ραντεβού</option>
                    </select>
                </div>
                {previewAppointments()}
              </div>
            </div>

              {/* Send Notification by Manos */}
              <div className={styles.NotificationCard}>
                <div className={styles.NotificationHeader}>
                  <h3 style={{display:'flex', justifyContent:'center'}}>Ειδοποιήσεις</h3>
                  <button 
                    type="button"
                    title="Προσθήκη Ειδοποίησης"                   
                    onClick={openΝModal}
                  >
                    {<TiPlus />}
                  </button>
                </div>
                <div style={{maxHeight: '400px', overflowY: 'auto', paddingRight: '4px'}}>    
                    {Object.keys(groupedNotifications).length > 0 ? (
                      <ul style={{ marginTop: '0.5rem', padding: 0, listStyle: 'none' }}>
                          {Object.entries(groupedNotifications).map(([title, notifications]) => (
                              <li key={title} style={{ marginBottom: '1rem' }}>
                              <h4 style={{ fontWeight: 'bold', color: '#000' }}>{title}</h4>
                              <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '4px' }}>
                                  {notifications.map((n, i) => (
                                      <div key={i} className={styles.notification}>
                                          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                              <h4 style={{ color: '#000', fontWeight: 'normal', justifyContent: 'flex-start', flex: 1}}>{n.message}</h4>
                                              <h5 style={{ color: 'rgba(0, 0, 0, 0.5)', fontWeight: 'bold', justifyContent: 'flex-start', flex: 1}}> {formatDate(n?.createAt ?? new Date())}{" "}</h5>
                                          </div>
                                          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: '4px'}}>
                                              {/* Pause/Resume Button */}
                                              <button
                                                  onClick={() => handleTogglePause(n)}
                                                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: n.isActive ? '#4CAF50' : '#666'}}                           
                                                  aria-label={n.isActive ? "Pause notification" : "Resume notification"}
                                                  title={n.isActive ? "Pause Notification" : "Resume Notification"}
                                              >{n.isActive ? <FaPause/> : <FaPlay/>}</button>
                                          
                                              {/* Delete Button */}
                                              <button
                                                  onClick={() => handleDeleteNotification(n)} 
                                                  style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem',color: '#ff4444'}}
                                                  aria-label="Delete notification"
                                                  title="Delete Notification"
                                              ><FaTrash/></button>        
                                          </div>
                                      </div>
                                  ))}
                              </div>
                              </li>
                          ))}
                      </ul>
                  ) : (
                      <p style={{ marginTop: '0.5rem', fontSize: '14px' }}>Δεν βρέθηκαν ειδοποιήσεις.</p>
                  )} 
              </div>       
            </div>
          </div>
          <div className={styles.main}>
            <div className={styles.aside}>
              <button
                type="button"
                title="previous-page"
                onClick={handleSwitchPage}
              >
                {<GrPrevious />}
              </button>
            </div>
            <div className={styles.center}>
              {page === 1 && (
                <FirstPage
                  currentSectionA={currentSectionA}
                  handleClickSection={handleClickSectionA}
                  sectionADisplayNames={sectionADisplayNames}
                  patient={patient}
                  onPatientUpdate={(updated) => setPatient(updated as PatientData)}
                />
              )}
              {page === 2 && (
                <SecondPage
                  pStringId={patientData.psId}
                  headersSectionB={currentHeaderB}
                  currentSelectionB={currentSelectionB}
                  currentSectionB={currentSectionB}
                  handleClickHeaderB={handleClickHeaderB}
                  handleClickSectionB={handleClickSectionB}
                  sectionBDisplayNames={sectionBDisplayNames}
                  patient={patient}
                />
              )}
            </div>
            <div className={styles.aside}>
              <button
                type="button"
                title="next-page"
                onClick={handleSwitchPage}
              >
                {<GrNext />}
              </button>
            </div>
          </div>
        </div>
      </div>
      <PatientAppointmentModal
        isVisible={isModalVisible}
        onClose={closeModal}
        patientName={patientData.pname}
        onSubmit={async (appointmentData) => {
          if (!currentDoctorData) return;
          try {
            const datetime = new Date(`${appointmentData.date}T${appointmentData.time}`);
            const newAppointment = {
              datetime,
              doctor: appointmentData.doctor,
              reason: appointmentData.reason,
              patient: {
                _id: patient?._id,
                id: patient?.id,
                firstname: patient?.firstname ?? "",
                lastname: patient?.lastname ?? "",
              },
              updatedBy: currentDoctorData._id,
            };

            const response = await CreateAppointment(currentDoctorData._id, newAppointment);
            if (response?.status === 200) {
                setModalState({ message: "Το ραντεβού αποθηκεύτηκε επιτυχώς.", option: "success", visibility: true });
            } else {
                setModalState({ message: "Αποτυχία αποθήκευσης ραντεβού!", option: "fail", visibility: true });
            }

            await refetchAppointments();

            closeModal();
          } catch (error) {
            console.error("Appointment creation failed:", error);
            window.alert("Προέκυψε σφάλμα κατά τον προγραμματισμό του ραντεβού.");
          }
        }}
      />
      {modalState.visibility && (
        <HandleCases
          {...modalState}
          onClose={() => setModalState(prev => ({ ...prev, visibility: false }))}
        />
      )}
      <PatientNotificationModal isVisible={isΝModalVisible} onClose={closeΝModal} patientName={patientData.pname} currentNotif={currNotifications}
        onSubmit={ async (NotificationData) => { 
          // POST Notifications
          try {
            const res = await fetch('/api/notifications', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              } ,
              body: JSON.stringify({
                patientId: patientData.psId, 
                notifications: NotificationData,
                doctorId: currentDoctorData._id,
              }),
            });

            if (!res.ok) {
              throw new Error('Failed to save notifications');
            }
      
            const result = await res.json();
            if(result.success) {
              setNotificationsForPatient(patientData.psId, result.notifications.map((notif) => ({ //update context
                ...notif,
                message: reverseMessageMap[notif.message] || notif.message,
              })));

              setcurrNotifications((prevNotifications) => [ // update local 
                ...prevNotifications,
                ...result.notifications.map((notif) => ({
                  ...notif,
                  message: reverseMessageMap[notif.message] || notif.message, 
                })),
              ]);
            }
          } catch (err) {
            console.error('Error saving notifications:', err);
          }
        }} 
      />
      </>)}
      {(isLoading || !patient) && (
        <>
          <div className={styles.backdrop} data-app-loading="true" />
          <div className={styles.loadingModal}>
            <div className={styles.spinner}></div>
            <span>Φόρτωση λεπτομερειών ασθενή. Παρακαλούμε περιμένετε.</span>
          </div>
        </>
      )}
    </main>
  )
};
