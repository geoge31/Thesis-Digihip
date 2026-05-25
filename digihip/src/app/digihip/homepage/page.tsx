/**
 * @path @/src/app/digihip/homepage
 * @file page.tsx
 * This component provides the home page of the digihip application.
 * Functions: 
  * search in patients 
  * sort
  * register patient
  * preview of all registered patients
  * delete a patient
 * @geoge31
 */
 
"use client";

import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import styles from "@/digihip/homepage/css/HomePage.module.css";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDoctor } from "@/api/_context/Doctors/Context";
import { usePatientProvider } from "@/api/_context/Patients/Context";
import { useAppointmentProvider } from "@/api/_context/Appointments/Context";
import { deletePatientById } from "@/digihip/homepage/methods/delete/deletePatient";
import AddButton from "@/components/Buttons/Register/addButton";
import DeleteStatusAlert from "./alerts/dltPatientStatus";
import DeleteReasonAlert from "@/digihip/homepage/alerts/DeleteReasonAlert";
import RestorePatientAlert from "@/digihip/homepage/alerts/RestorePatientAlert";
import SearchInput from "@/components/Inputs/Search/SearchInput";
import { IoFilter } from "react-icons/io5";
import { RiDeleteBinLine } from "react-icons/ri";
import { PatientInterface } from "@/utils/interfaces/patient";
import { DeletedPatientInterface } from "@/utils/interfaces/deletedPatient";
import HandleCases from "@/components/HandleCases/HandleCases";

/**
 * 
 * @returns 
 */

const Homepage = () => {

  const {currentDoctorData, loading} = useDoctor();
  const { patientsList, setCurrPatientId, refetchPatients, isLoading } = usePatientProvider();
  const { appointmentsList } = useAppointmentProvider();

  console.log("patients-list:", patientsList);
  console.log("appointments-list: ", appointmentsList);

  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<"newest" | "oldest" | "alphabetical" | "">("");

  const [deleteAlertVisibility, setDeleteAlertVisibility] = useState(false);
  const [patientToDelete,setPatientToDelete] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string | null>(null);

  const [statusAlertVisbility, setStatusAlertVisibility] = useState(false);
  const [statusAlertMssg, setStatusAlertMssg] = useState<string | null>(null);
  const [statusAlertType, setStatusAlertType] = useState<"success" | "error" | "default" >("default");

  const [deletedPatients, setDeletedPatients] = useState<DeletedPatientInterface[]>([]);
  const [deletedSearchTerm, setDeletedSearchTerm] = useState("");
  const [isLoadingDeleted, setIsLoadingDeleted] = useState(false);
  const [restoreAlertVisibility, setRestoreAlertVisibility] = useState(false);
  const [selectedDeletedPatient, setSelectedDeletedPatient] = useState<DeletedPatientInterface | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const [modalState, setModalState] = useState<{
    message: string;
    option: "loading" | "success" | "fail";
    visibility: boolean;
  }>({
    message: "",
    option: "empty",
    visibility: false,
  });

  const handleModal = (message: string, option: "loading" | "success" | "fail", show: boolean) => {
    setModalState({ message, option, visibility: show});
  };


  /**
   * 
   */
  const sortedFilteredPatients = useMemo(() => {
    if (!patientsList) return [];
    
    // Filter based on search term
    const filteredPatients = patientsList.filter((patient) => {
    const fullname = `${patient.firstname ?? ""} ${patient.lastname ?? ""}`.toLowerCase();
    const createdAt = new Date(patient.createdAt ?? "").toLocaleDateString().toLowerCase();

    return (
      fullname.includes(searchTerm.toLowerCase()) ||
      (patient.amka ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.email ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.currentStage ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.mobilephone ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.supervisorDoctor ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      createdAt.includes(searchTerm.toLowerCase())
    );
  });
    // Sort based on selected sort option
    return sortPatients(filteredPatients, sortOption);
  }, [patientsList, searchTerm, sortOption]);


  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value as 'newest' | 'oldest' | 'alphabetical' | '');
  }

  /**
   * 
   * @param pId 
   * @param pnumId 
  */
 const handleNavigateToPatient = async (pId: string, pnumId: number) => {
   if(pId) {
     setIsNavigating(true);
     setCurrPatientId(pId);
     router.push(`/digihip/patient-details?id=${pnumId}`);
    }

    return;
  };
  
  /**
   * 
   * @returns 
   */
  const navigateToRegisterPantPg = async () => {
    if(currentDoctorData) {
      router.push(`/digihip/register-patient?doctor=${currentDoctorData.username}`);
    } 

    return (
      <>
        <Navbar/>
        <main>
            <div>
              <p>Προέκυψε κάποιο σφάλμα</p>
            </div>
        </main>
        <Footer/>
      </>
    )
    
  };

  const SetStatusAlert = (message: string | null, type: "success" |  "error" | "default" ) => {
    setStatusAlertMssg(message);
    setStatusAlertType(type);
    setStatusAlertVisibility(true);
  };


  const handleCloseStatusAlert = () => {
    setStatusAlertVisibility(false);
    refetchPatients();
  };

  /**
   * 
   * @param id 
   * @param fname 
   * @param lname 
  */
 const handleDeleteAction = (id: string, fname: string, lname: string) => {
    setPatientName(`${fname} ${lname}`);
    setPatientToDelete(id);
    setDeleteAlertVisibility(true);
};


/**
 * 
 * @returns 
 */
  const displayDeleteAlert = () => {
    if(deleteAlertVisibility) {
      return (
        <>
          <DeleteReasonAlert
              patient={patientName}
              onCancel={closeDeletionAlert}
              onConfirm={proceedDelete}
            />
        </>
      );
    }
  };

  /**
   * 
   * @returns 
   */
  const displayStatusAlert = () => {
    if(statusAlertVisbility) {
      return (
        <>
          <DeleteStatusAlert
            message={statusAlertMssg}
            type={statusAlertType}
            onClose={handleCloseStatusAlert}
          />
        </>
      );
    }
  };


  const closeDeletionAlert = () => {
    setDeleteAlertVisibility(false);
  };

  /**
   * 
   */
  const proceedDelete = async (reason: string) => {
    setDeleteAlertVisibility(false);
    handleModal("Η διαδικασία βρίσκεται σε εξέλιξη", "loading", true);
    if(patientToDelete && currentDoctorData) {
      const doctorName = `${currentDoctorData.firstname} ${currentDoctorData.lastname}`;
      const result = await deletePatientById(patientToDelete, reason, doctorName);
      if(result) {
        handleModal("Η διαδικασία διαγραφής ολοκληρώθηκε με επιτυχία", "success", true);
        fetchDeletedPatients();
      } else {
        handleModal("Προέκυψε κάποιο σφάλμα κατά την διαδικασία διαγραφής", "fail", true);
      }
    }
  };

  const closeAlert = () => {
    setModalState((prevState) => ({ ...prevState, visibility: false }));
    refetchPatients();
  };

  const AlertDisplay = () => {
    if(modalState.visibility) {
      return (
          <HandleCases {...modalState}
            onClose={closeAlert}
          />
      );
    }
  };

  const fetchDeletedPatients = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setIsLoadingDeleted(true);
    try {
      const response = await fetch("/api/patients/deleted/fetch", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDeletedPatients(data);
      }
    } catch (error) {
      console.error("Error fetching deleted patients:", error);
    } finally {
      setIsLoadingDeleted(false);
    }
  }, []);

  const filteredDeletedPatients = useMemo(() => {
    if (!deletedPatients) return [];
    if (!deletedSearchTerm) return deletedPatients;

    const term = deletedSearchTerm.toLowerCase();
    return deletedPatients.filter((dp) => {
      const pd = dp.patientData;
      const fullname = `${pd.firstname ?? ""} ${pd.lastname ?? ""}`.toLowerCase();
      const reason = (dp.deletionReason ?? "").toLowerCase();
      const doctor = (dp.deletedBy ?? "").toLowerCase();
      const deletedAt = new Date(dp.deletedAt ?? "").toLocaleDateString().toLowerCase();
      return (
        fullname.includes(term) ||
        reason.includes(term) ||
        doctor.includes(term) ||
        deletedAt.includes(term)
      );
    });
  }, [deletedPatients, deletedSearchTerm]);

  const handleDeletedPatientClick = (dp: DeletedPatientInterface) => {
    setSelectedDeletedPatient(dp);
    setRestoreAlertVisibility(true);
  };

  const handleRestorePatient = async () => {
    if (!selectedDeletedPatient?._id) return;
    setRestoreAlertVisibility(false);
    handleModal("Η διαδικασία επαναφοράς βρίσκεται σε εξέλιξη", "loading", true);

    const token = localStorage.getItem("token");
    if (!token) {
      handleModal("Σφάλμα: Μη εξουσιοδοτημένος χρήστης", "fail", true);
      return;
    }

    try {
      const response = await fetch("/api/patients/deleted/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deletedPatientId: selectedDeletedPatient._id }),
      });

      if (response.ok) {
        handleModal("Η επαναφορά ολοκληρώθηκε με επιτυχία", "success", true);
        refetchPatients();
        fetchDeletedPatients();
      } else {
        const errorData = await response.json();
        handleModal(errorData.message || "Προέκυψε σφάλμα κατά την επαναφορά", "fail", true);
      }
    } catch (error) {
      console.error("Error restoring patient:", error);
      handleModal("Προέκυψε σφάλμα κατά την επαναφορά", "fail", true);
    }
  };

  const displayRestoreAlert = () => {
    if (restoreAlertVisibility && selectedDeletedPatient) {
      return (
        <RestorePatientAlert
          deletedPatient={selectedDeletedPatient}
          onCancel={() => setRestoreAlertVisibility(false)}
          onConfirm={handleRestorePatient}
        />
      );
    }
  };

  useEffect(() => {
    if (!loading && !currentDoctorData) {
      router.push(`/`);  
    }
  }, [currentDoctorData, loading, router]);

  useEffect(() => {
    fetchDeletedPatients();
  }, [fetchDeletedPatients]);


  return (
    <>
      <main className={styles.main}>
        <div className={styles.content}>
            <div className={styles.header}>
              <h2>Καλώς Ήρθατε, {currentDoctorData?.firstname} {currentDoctorData?.lastname}</h2>
            </div>
            <div className={styles.actions}>
                <div className={styles.search}>
                  <SearchInput
                    onSearch={(value) => {setSearchTerm(value)}}
                    place_holder="Αναζήτηση Ασθενών"
                  />
                </div>
                <div className={styles.dropdown}>
                    <select title="filters" name="filters" value={sortOption} onChange={handleSortChange}>
                        <option value="" hidden disabled>{<IoFilter/>}Ταξινόμηση Κατά</option>
                        <option value="alphabetical">Αλφαβητική Σειρά</option>
                        <option value="newest">Πρόσφατες Εγγραφές</option>
                        <option value="oldest">Παλαιότερες Εγγραφές</option>
                    </select>
                  </div>
                  <div className={styles.register_patient}>
                      <AddButton
                        onRegister={navigateToRegisterPantPg}
                        value="Προσθήκη Ασθενή"
                      >
                        Προσθήκη Ασθενή
                      </AddButton>
                  </div>
              </div>
            <div className={styles.tableN}>
              <div className={styles.tableNHeader}>
                <div className={styles.tableNHeaderCell}>ΟΝΟΜΑΤΕΠΩΝΥΜΟ</div>
                <div className={styles.tableNHeaderCell}>ΑΜΚΑ</div>
                <div className={styles.tableNHeaderCell}>ΣΤΑΔΙΟ</div>
                <div className={styles.tableNHeaderCell}>ΚΙΝΗΤΟ</div>
                <div className={styles.tableNHeaderCell}>ΕΠΙΒΛΕΠΩΝ</div>
                <div className={styles.tableNHeaderCell}>ΕΓΓΡΑΦΗ</div>
                <div className={styles.tableNHeaderCell}></div>
              </div>
              <div className={styles.tableNContent}>
                { sortedFilteredPatients.length > 0 && 
                  (
                    <>
                      { sortedFilteredPatients.map((patient: PatientInterface) => (
                        <div 
                          key={patient._id}
                          className={styles.tableNContentCell}
                          onClick={() => {handleNavigateToPatient(patient._id ?? "", patient.id ?? 0)}}
                        >
                          <div className={styles.itemCell}>
                            {highlightMatch(patient.firstname, searchTerm)} {highlightMatch(patient.lastname, searchTerm)}
                          </div>
                          <div className={styles.itemCell}>
                            {/* {highlightMatch(patient.amka, searchTerm)} */}
                            {safeHighlight(patient.amka, searchTerm)}
                          </div>
                          <div className={styles.itemCell}>
                            {highlightMatch(patient.currentStage, searchTerm)}
                          </div>
                          <div className={styles.itemCell}>
                            {safeHighlight(patient.mobilephone, searchTerm)}
                          </div>
                          <div className={styles.itemCell}>
                            {highlightMatch(patient.supervisorDoctor, searchTerm)}
                          </div>
                          <div className={styles.itemCell}>
                            {highlightMatch(new Date(patient?.createdAt?? "1970-01-01T00:00:00Z").toLocaleDateString(), searchTerm)}
                          </div>
                          <div className={styles.itemCell}>
                            <button
                              type="button"
                              title="delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAction(patient._id ?? "", patient.firstname, patient.lastname);
                              }}
                            >
                              {<RiDeleteBinLine />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </> 
                  )
                }
              </div>
            </div>
            {/* Recent Deleted Patients */}
            <div className={styles.recentDeletes}>
              <h4>Πρόσφατες Διαγραφές</h4>
              <div className={styles.recentDeletesSearch}>
                <SearchInput
                  onSearch={(value) => {setDeletedSearchTerm(value)}}
                  place_holder="Αναζήτηση Διαγραμμένων Ασθενών"
                />
              </div>
              <div className={styles.deletedTable}>
                <div className={styles.deletedTableHeader}>
                  <div className={styles.deletedTableHeaderCell}>ΟΝΟΜΑΤΕΠΩΝΥΜΟ</div>
                  <div className={styles.deletedTableHeaderCell}>ΑΙΤΙΑ ΔΙΑΓΡΑΦΗΣ</div>
                  <div className={styles.deletedTableHeaderCell}>ΔΙΑΓΡΑΦΗΚΕ ΑΠΟ</div>
                  <div className={styles.deletedTableHeaderCell}>ΗΜΕΡΟΜΗΝΙΑ</div>
                  <div className={styles.deletedTableHeaderCell}>ΑΜΚΑ</div>
                </div>
                <div className={styles.deletedTableContent}>
                  {isLoadingDeleted ? (
                    <div className={styles.deletedEmpty}>
                      <span>Φόρτωση...</span>
                    </div>
                  ) : filteredDeletedPatients.length > 0 ? (
                    filteredDeletedPatients.map((dp: DeletedPatientInterface) => (
                      <div
                        key={dp._id}
                        className={styles.deletedTableRow}
                        onClick={() => handleDeletedPatientClick(dp)}
                      >
                        <div className={styles.deletedItemCell}>
                          {(dp.patientData.firstname as string) ?? ""} {(dp.patientData.lastname as string) ?? ""}
                        </div>
                        <div className={styles.deletedItemCell}>
                          {dp.deletionReason}
                        </div>
                        <div className={styles.deletedItemCell}>
                          {dp.deletedBy}
                        </div>
                        <div className={styles.deletedItemCell}>
                          {new Date(dp.deletedAt ?? "").toLocaleDateString("el-GR")}
                        </div>
                        <div className={styles.deletedItemCell}>
                          {(dp.patientData.amka as string) ?? "-"}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.deletedEmpty}>
                      <span>Δεν υπάρχουν διαγραμμένοι ασθενείς</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>

      </main>
      {displayDeleteAlert()}
      {displayStatusAlert()}
      {displayRestoreAlert()}
      {AlertDisplay()}
      {isLoading && (
        <>
          <div className={styles.backdrop} data-app-loading="true" />
          <div className={styles.loadingModal}>
            <div className={styles.spinner}></div>
            <span>Η διαδικασία βρίσκεται σε εξέλιξη. Παρακαλούμε περιμένετε.</span>
          </div>
        </>
      )}
      {isNavigating && (
        <>
          <div className={styles.backdrop} data-app-loading="true" />
          <div className={styles.loadingModal}>
            <div className={styles.spinner}></div>
            <span>Φόρτωση λεπτομερειών ασθενή. Παρακαλούμε περιμένετε.</span>
          </div>
        </>
      )}
    </>
  );
};

function highlightMatch(text: string, searchTerm: string) {
  if (!searchTerm) return text;

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = (text || '').split(regex);

  return parts.map((part, index) => 
    part.toLowerCase() === searchTerm.toLowerCase() 
      ? <span key={index} style={{ backgroundColor: 'lightblue' }}>{part}</span> 
      : part
  );
};

function safeHighlight(text: string | undefined | null, searchTerm: string) {
  return highlightMatch(text ?? "-", searchTerm);
};

function sortPatients(patientsList: PatientInterface[], option: 'newest' | 'oldest' | 'alphabetical' | '') {
  return patientsList.sort((a, b) => {

    const dateA = a.createdAt ? Date.parse(a.createdAt.toString()) : 0;
    const dateB = b.createdAt ? Date.parse(b.createdAt.toString()) : 0;

    switch (option) {
      case 'alphabetical':
        return a.lastname.localeCompare(b.lastname, 'el', { sensitivity: 'base' });
      case 'oldest':
        return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB); // Oldest first
      case 'newest':
        return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA); // Newest first
      default:
        return 0;
    }
  });

};

export default Homepage;