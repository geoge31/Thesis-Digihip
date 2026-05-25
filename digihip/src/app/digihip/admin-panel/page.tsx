/**
 * @path @/src/app/digihip/admin-panel
 * @file page.tsx
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavbarLogin from "@/components/NavbarLogin/NavbarLogin";
import styles from "./css/AdminPanel.module.css";
import WrongCredentials from "@/customUtils/alerts/wrongCredentials";
import { FaPlus } from "react-icons/fa6";

interface DoctorRow {
  _id: string;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
}

export default function AdminPanel() {

  const router = useRouter();
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorRow | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [createForm, setCreateForm] = useState({
    username: "",
    email: "",
    firstname: "",
    lastname: "",
  });

  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    firstname: "",
    lastname: "",
  });

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

  // Check admin auth on mount
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/digihip/log-in");
      return;
    }
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("adminToken");

    try {
      const response = await fetch("/api/admins/doctors", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("adminToken");
          router.push("/digihip/log-in");
          return;
        }
        handleModal("Προέκυψε κάποιο σφάλμα κατά την ανάκτηση γιατρών :(", "psw_usr", true);
        return;
      }

      const data = await response.json();
      setDoctors(data.doctors || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      handleModal("Προέκυψε κάποιο σφάλμα κατά την ανάκτηση γιατρών :(", "psw_usr", true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDoctor = async () => {
    const { username, email, firstname, lastname } = createForm;

    if (!username || !email || !firstname || !lastname) {
      handleModal("Παρακαλούμε συμπληρώστε όλα τα πεδία καθώς είναι υποχρεωτικά", "empty", true);
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("adminToken");

    try {
      const response = await fetch("/api/admins/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (!response.ok) {
        handleModal(data.message || "Προέκυψε κάποιο σφάλμα κατά την εγγραφή :(", "psw_usr", true);
        return;
      }

      handleModal("Η εγγραφή ολοκληρώθηκε με επιτυχία", "empty", true);
      setSuccessMessage("Η εγγραφή ολοκληρώθηκε με επιτυχία! Ο κωδικός εστάλη στο email.");
      setShowCreateModal(false);
      setCreateForm({
        username: "",
        email: "",
        firstname: "",
        lastname: "",
      });
      fetchDoctors();
    } catch (error) {
      console.error("Error creating doctor:", error);
      handleModal("Προέκυψε κάποιο σφάλμα κατά την εγγραφή :(", "psw_usr", true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDoctor = async () => {
    if (!selectedDoctor) return;

    const { username, email, firstname, lastname } = editForm;

    if (!username || !email || !firstname || !lastname) {
      handleModal("Παρακαλούμε συμπληρώστε όλα τα υποχρεωτικά πεδία", "empty", true);
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("adminToken");

    const updates: Record<string, string> = {
      username,
      email,
      firstname,
      lastname,
    };

    try {
      const response = await fetch("/api/admins/doctors", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ id: selectedDoctor._id, updates }),
      });

      const data = await response.json();

      if (!response.ok) {
        handleModal(data.message || "Προέκυψε κάποιο σφάλμα κατά την ενημέρωση :(", "psw_usr", true);
        return;
      }

      handleModal("Επιτυχής ενημέρωση!", "empty", true);
      setSuccessMessage("Επιτυχής ενημέρωση στοιχείων γιατρού!");
      setShowEditModal(false);
      setSelectedDoctor(null);
      fetchDoctors();
    } catch (error) {
      console.error("Error updating doctor:", error);
      handleModal("Προέκυψε κάποιο σφάλμα κατά την ενημέρωση :(", "psw_usr", true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedDoctor) return;

    setIsLoading(true);
    const token = localStorage.getItem("adminToken");

    try {
      const response = await fetch("/api/admins/doctors", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ id: selectedDoctor._id, resetPassword: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        handleModal(data.message || "Προέκυψε κάποιο σφάλμα κατά την επαναφορά κωδικού :(", "psw_usr", true);
        return;
      }

      handleModal("Ο νέος κωδικός εστάλη στο email του γιατρού!", "empty", true);
      setSuccessMessage("Ο νέος κωδικός εστάλη στο email του γιατρού!");
    } catch (error) {
      console.error("Error resetting password:", error);
      handleModal("Προέκυψε κάποιο σφάλμα κατά την επαναφορά κωδικού :(", "psw_usr", true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDoctor = async () => {
    if (!selectedDoctor) return;

    setIsLoading(true);
    const token = localStorage.getItem("adminToken");

    try {
      const response = await fetch("/api/admins/doctors", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ id: selectedDoctor._id }),
      });

      if (!response.ok) {
        handleModal("Προέκυψε κάποιο σφάλμα κατά τη διαγραφή :(", "psw_usr", true);
        return;
      }

      handleModal("Επιτυχής διαγραφή γιατρού!", "empty", true);
      setSuccessMessage("Επιτυχής διαγραφή γιατρού!");
      setShowDeleteConfirm(false);
      setSelectedDoctor(null);
      fetchDoctors();
    } catch (error) {
      console.error("Error deleting doctor:", error);
      handleModal("Προέκυψε κάποιο σφάλμα κατά τη διαγραφή :(", "psw_usr", true);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (doctor: DoctorRow) => {
    setSelectedDoctor(doctor);
    setEditForm({
      username: doctor.username,
      email: doctor.email,
      firstname: doctor.firstname,
      lastname: doctor.lastname,
    });
    setShowEditModal(true);
  };

  const openDeleteConfirm = (doctor: DoctorRow) => {
    setSelectedDoctor(doctor);
    setShowDeleteConfirm(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/digihip/log-in");
  };

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "firstname" || name === "lastname") {
      setCreateForm({ ...createForm, [name]: value.toUpperCase() });
    } else {
      setCreateForm({ ...createForm, [name]: value });
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "firstname" || name === "lastname") {
      setEditForm({ ...editForm, [name]: value.toUpperCase() });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  const Loading = () => {
    if (isLoading) {
      return (
        <>
          <div className={styles.backdrop} />
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <span>Η διαδικασία βρίσκεται σε εξέλιξη. Παρακαλούμε περιμένετε.</span>
          </div>
        </>
      );
    }
  };

  const Alert = () => {
    if (modalState.visibility) {
      return (
        <WrongCredentials {...modalState}
          onClose={closeAlert}
        />
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
          <div className={styles.header}>
            <h2>Πίνακας Διαχείρισης</h2>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Αποσύνδεση
            </button>
          </div>

          {/* Doctors Table */}
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h3>Λογαριασμοί Γιατρών</h3>
              <div className={styles.searchAndBtn}>
                <input
                  type="text"
                  className={styles.searchBar}
                  placeholder="Αναζήτηση γιατρού..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className={styles.addBtn} onClick={() => setShowCreateModal(true)}>
                  <FaPlus size={14} /> Προσθήκη Νέου Γιατρού
                </button>
              </div>
            </div>

            {doctors.length === 0 && !isLoading ? (
              <div className={styles.emptyState}>
                <p>Δεν βρέθηκαν εγγεγραμμένοι γιατροί</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Όνομα</th>
                    <th>Επίθετο</th>
                    <th>Ενέργειες</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors
                    .filter(
                      (doctor) =>
                        (doctor.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (doctor.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (doctor.firstname || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (doctor.lastname || "").toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((doctor) => (
                      <tr key={doctor._id}>
                        <td>{doctor.username}</td>
                        <td>{doctor.email}</td>
                        <td>{doctor.firstname}</td>
                        <td>{doctor.lastname}</td>
                        <td>
                          <button
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                            onClick={() => openEditModal(doctor)}
                          >
                            Επεξεργασία
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => openDeleteConfirm(doctor)}
                          >
                            Διαγραφή
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Create Doctor Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Δημιουργία Νέου Γιατρού</h3>
            <div className={styles.formGroup}>
              <label>Όνομα χρήστη *</label>
              <input
                type="text"
                name="username"
                value={createForm.username}
                onChange={handleCreateChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={createForm.email}
                onChange={handleCreateChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Όνομα *</label>
              <input
                type="text"
                name="firstname"
                value={createForm.firstname}
                onChange={handleCreateChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Επίθετο *</label>
              <input
                type="text"
                name="lastname"
                value={createForm.lastname}
                onChange={handleCreateChange}
              />
            </div>
            <div className={styles.modalButtons}>
              <button className={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>
                Ακύρωση
              </button>
              <button className={styles.saveBtn} onClick={handleCreateDoctor}>
                Εγγραφή
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {showEditModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Επεξεργασία Γιατρού</h3>
            <div className={styles.formGroup}>
              <label>Όνομα χρήστη *</label>
              <input
                type="text"
                name="username"
                value={editForm.username}
                onChange={handleEditChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Όνομα *</label>
              <input
                type="text"
                name="firstname"
                value={editForm.firstname}
                onChange={handleEditChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Επίθετο *</label>
              <input
                type="text"
                name="lastname"
                value={editForm.lastname}
                onChange={handleEditChange}
              />
            </div>
            <div className={styles.formGroup}>
              <button
                type="button"
                className={styles.resetPasswordBtn}
                onClick={handleResetPassword}
              >
                Επαναφορά Κωδικού (αποστολή μέσω email)
              </button>
            </div>
            <div className={styles.modalButtons}>
              <button className={styles.cancelBtn} onClick={() => setShowEditModal(false)}>
                Ακύρωση
              </button>
              <button className={styles.saveBtn} onClick={handleEditDoctor}>
                Αποθήκευση
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && selectedDoctor && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <h3>Επιβεβαίωση Διαγραφής</h3>
            <p>
              Είστε σίγουροι ότι θέλετε να διαγράψετε τον γιατρό{" "}
              <strong>{selectedDoctor.username}</strong>;
            </p>
            <div className={styles.confirmButtons}>
              <button className={styles.cancelBtn} onClick={() => setShowDeleteConfirm(false)}>
                Ακύρωση
              </button>
              <button className={styles.confirmDeleteBtn} onClick={handleDeleteDoctor}>
                Διαγραφή
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
