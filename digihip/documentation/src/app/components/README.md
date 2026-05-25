### Components

- src/app/components/

    ---

    - Alerts/
        - <b>customAlert.tsx</b> : Modal ειδοποίησης που εμφανίζει δύο μηνύματα και ένα κουμπί "Συνέχεια" για κλείσιμο. Χρησιμοποιείται για απλές ειδοποιήσεις προς τον χρήστη.

            - <b>Props</b>

                | Prop | Τύπος | Υποχρεωτικό | Default | Περιγραφή |
                |------|-------|-------------|---------|-----------|
                | `message` | `string` | Ναι | — | Το πρώτο μήνυμα που εμφανίζεται |
                | `messageNew` | `string` | Ναι | — | Το δεύτερο μήνυμα που εμφανίζεται |
                | `onClose` | `() => void` | Ναι | — | Callback που καλείται όταν ο χρήστης πατήσει "Συνέχεια" |

            - <b>Παράδειγμα Χρήσης</b>

                    import CustomAlert from "@/components/Alerts/customAlert";

                    <CustomAlert
                        message="Προσοχή"
                        messageNew="Η ενέργεια δεν μπορεί να αναιρεθεί."
                        onClose={() => setAlertVisible(false)}
                    />

            - <b>customAlert.module.css</b> : Styles για το CustomAlert component.

        - Appointments/
            - <b>apptStatus.tsx</b> : Placeholder component για εμφάνιση κατάστασης ραντεβού. Προς το παρόν δεν εμφανίζει περιεχόμενο (κενά fragments).

                - <b>Props</b>

                    | Prop | Τύπος | Υποχρεωτικό | Default | Περιγραφή |
                    |------|-------|-------------|---------|-----------|
                    | `state` | `boolean` | Ναι | — | Κατάσταση εμφάνισης |
                    | `type` | `{ [key: number]: string }` | Ναι | — | Τύπος κατάστασης |

    ---

    - Appointments/
        - ClickExistingApptModal/
            - <b>AppointmentPreview.tsx</b> : Modal προεπισκόπησης και επεξεργασίας υπάρχοντος ραντεβού. Εμφανίζει τα στοιχεία του ραντεβού (ημερομηνία, ασθενής, αιτιολογία, ιατρός, διαχειριστής) και επιτρέπει inline επεξεργασία με κουμπιά Ακύρωση/Αποθήκευση. Χρησιμοποιεί `react-datepicker` με ελληνικό locale.

                - <b>Props</b>

                    | Prop | Τύπος | Υποχρεωτικό | Default | Περιγραφή |
                    |------|-------|-------------|---------|-----------|
                    | `appointment` | `AppointmentInterface \| null` | Ναι | — | Τα δεδομένα του ραντεβού |
                    | `onClose` | `() => void` | Ναι | — | Callback κλεισίματος του modal |

                - <b>AppointmentsPreview.module.css</b> : Styles για το AppointmentPreview component.

        - HoverExistingApptModal/
            - <b>Tooltip.tsx</b> : Tooltip component που εμφανίζεται κατά το hover πάνω σε ένα ραντεβού στο ημερολόγιο. Δείχνει ημερομηνία, ώρα, ασθενή (clickable), αιτιολογία και ιατρό.

                - <b>Props</b>

                    | Prop | Τύπος | Υποχρεωτικό | Default | Περιγραφή |
                    |------|-------|-------------|---------|-----------|
                    | `date` | `string` | Ναι | — | Ημερομηνία ραντεβού |
                    | `time` | `string` | Ναι | — | Ώρα ραντεβού |
                    | `pntName` | `string` | Ναι | — | Όνομα ασθενή |
                    | `apptReason` | `string \| null` | Ναι | — | Αιτιολογία ραντεβού |
                    | `docName` | `string \| null` | Ναι | — | Όνομα ιατρού |
                    | `onPatientClick` | `() => void` | Όχι | — | Callback κατά το click στον ασθενή |

                - <b>Tooltip.module.css</b> : Styles για το Tooltip component.

        - NavigationPanel/
            - <b>NavigationPanel.tsx</b> : Panel πλοήγησης για τις προβολές ραντεβού (ημέρα, εβδομάδα, μήνας). Παρέχει κουμπιά πλοήγησης (προηγούμενο/επόμενο), κουμπί "Σήμερα" και κουμπί ημερολογίου.

                - <b>Props</b>

                    | Prop | Τύπος | Υποχρεωτικό | Default | Περιγραφή |
                    |------|-------|-------------|---------|-----------|
                    | `view` | `"month" \| "week" \| "day"` | Ναι | — | Ο τρέχων τύπος προβολής |
                    | `displayLabel` | `string` | Ναι | — | Η ετικέτα που εμφανίζεται για την τρέχουσα ημερομηνία |
                    | `onPrev` | `() => void` | Ναι | — | Callback πλοήγησης στην προηγούμενη προβολή |
                    | `onNext` | `() => void` | Ναι | — | Callback πλοήγησης στην επόμενη προβολή |
                    | `onToday` | `() => void` | Ναι | — | Callback μετάβασης στη σημερινή ημερομηνία |
                    | `onToggleCalendar` | `() => void` | Ναι | — | Callback ανοίγματος/κλεισίματος ημερολογίου |

                - <b>navigationPanel.module.css</b> : Styles για το NavigationPanel component.

        - NewApptModal/
            - <b>NewAppointmentModal.tsx</b> : Modal δημιουργίας νέου ραντεβού. Περιλαμβάνει πεδία για ημερομηνία (DatePicker), ώρα (TimeSelect), επιλογή ασθενή (react-select με αναζήτηση), ιατρό, αιτία και αυτόματη συμπλήρωση "Προστέθηκε Από". Χρησιμοποιεί `ReactDOM.createPortal` για rendering στο body. Εμφανίζει HandleCases ειδοποιήσεις.

                - <b>Props</b>

                    | Prop | Τύπος | Υποχρεωτικό | Default | Περιγραφή |
                    |------|-------|-------------|---------|-----------|
                    | `onClose` | `() => void` | Ναι | — | Callback κλεισίματος του modal |
                    | `patients` | `PatientOfAppointment[] \| null` | Ναι | — | Λίστα ασθενών για επιλογή |

                - <b>newApptModal.module.css</b> : Styles για το NewAppointmentModal component.

            - functions/
                - <b>functionSearch.tsx</b> : Βοηθητική συνάρτηση `highlightMatch` που επισημαίνει τα τμήματα κειμένου που ταιριάζουν με τον όρο αναζήτησης (highlight με γαλάζιο background).

                    - <b>Παράδειγμα Χρήσης</b>

                            import highlightMatch from "@/components/Appointments/NewApptModal/functions/functionSearch";

                            highlightMatch("Γιώργος Παπαδόπουλος", "Γιώργος")

        - PreviewAppointmentModal/
            - <b>PreviewAppointmentModal.tsx</b> : Modal προεπισκόπησης και επεξεργασίας υπάρχοντος ραντεβού. Εμφανίζει τα στοιχεία (ημερομηνία, ώρα, ασθενής, ιατρός, αιτία, σημείωση, δημιουργός) με δυνατότητα εναλλαγής σε edit mode. Χρησιμοποιεί `ReactDOM.createPortal`, DatePicker, TimeSelect και HandleCases.

                - <b>Props</b>

                    | Prop | Τύπος | Υποχρεωτικό | Default | Περιγραφή |
                    |------|-------|-------------|---------|-----------|
                    | `onClose` | `() => void` | Ναι | — | Callback κλεισίματος του modal |
                    | `patients` | `PatientOfAppointment[] \| null` | Ναι | — | Λίστα ασθενών |
                    | `appointment` | `AppointmentInterface \| null` | Ναι | — | Τα δεδομένα του ραντεβού |

                - <b>previewAppointmentModal.module.css</b> : Styles για το PreviewAppointmentModal component.

        - SelectView/
            - <b>selectView.tsx</b> : Dropdown component για επιλογή προβολής ημερολογίου (Μήνας, Εβδομάδα, Ημέρα). Κλείνει αυτόματα όταν ο χρήστης κάνει κλικ εκτός. Κατά το άνοιγμα επαναφέρει την επιλογή στο placeholder.

                - <b>Props</b>

                    | Prop | Τύπος | Υποχρεωτικό | Default | Περιγραφή |
                    |------|-------|-------------|---------|-----------|
                    | `selectionChange` | `(view: number) => void` | Ναι | — | Callback που καλείται κατά την αλλαγή προβολής (1=Μήνας, 2=Εβδομάδα, 3=Ημέρα) |

                - <b>SelectView.module.css</b> : Styles για το SelectView component.

    ---

    - Buttons/
        - CancelSave/
            - <b>CancelSave.tsx</b> : Ζεύγος κουμπιών Ακύρωσης (X) και Αποθήκευσης (✓). Χρησιμοποιεί εικονίδια από τη `react-icons/gr`. Εξάγεται ως `CnlSvBtns`.

                - <b>Props</b>

                    | Prop | Τύπος | Υποχρεωτικό | Default | Περιγραφή |
                    |------|-------|-------------|---------|-----------|
                    | `onClickCancel` | `() => void` | Ναι | — | Callback κατά το πάτημα του κουμπιού ακύρωσης |
                    | `onClickSave` | `() => void` | Ναι | — | Callback κατά το πάτημα του κουμπιού αποθήκευσης |

                - <b>Παράδειγμα Χρήσης</b>

                        import CnlSvBtns from "@/components/Buttons/CancelSave/CancelSave";

                        <CnlSvBtns
                            onClickCancel={() => setEditMode(false)}
                            onClickSave={handleSave}
                        />

                - <b>CancelSave.module.css</b> : Styles για το CancelSave component.

        - EditButton/
            - <b>EditButton.tsx</b> : Κουμπί επεξεργασίας. Δέχεται children (π.χ. εικονίδιο) που εμφανίζονται μέσα στο κουμπί.

                - <b>Props</b>

                    | Prop | Τύπος | Υποχρεωτικό | Default | Περιγραφή |
                    |------|-------|-------------|---------|-----------|
                    | `onClick` | `() => void` | Ναι | — | Callback κατά το πάτημα του κουμπιού |
                    | `children` | `ReactNode` | Ναι | — | Το περιεχόμενο του κουμπιού (π.χ. εικονίδιο) |

                - <b>Παράδειγμα Χρήσης</b>

                        import EditButton from "@/components/Buttons/EditButton/EditButton";
                        import { AiFillEdit } from "react-icons/ai";

                        <EditButton onClick={() => setEditMode(true)}>
                            <AiFillEdit />
                        </EditButton>

                - <b>EditButton.module.css</b> : Styles για το EditButton component.

        - Register/
            - <b>addButton.tsx</b> : Κουμπί "Προσθήκη" με customizable εικονίδιο/περιεχόμενο (children) και tooltip μέσω title. Εξάγεται ως `AddButton`.

                - <b>Props</b>

                    | Prop | Τύπος | Υποχρεωτικό | Default | Περιγραφή |
                    |------|-------|-------------|---------|-----------|
                    | `onRegister` | `() => void` | Ναι | — | Callback κατά το πάτημα του κουμπιού |
                    | `value` | `string` | Ναι | — | Τιμή που χρησιμοποιείται ως title/tooltip |
                    | `children` | `ReactNode` | Ναι | — | Το περιεχόμενο του κουμπιού (π.χ. εικονίδιο + κείμενο) |

                - <b>Παράδειγμα Χρήσης</b>

                        import AddButton from "@/components/Buttons/Register/addButton";

                        <AddButton onRegister={() => openForm()} value="Προσθήκη Ασθενή">
                            + Προσθήκη
                        </AddButton>

                - <b>AddButton.module.css</b> : Styles για το AddButton component.

    ---

    - DropDown/
        - <b>SelectDropdown.tsx</b> : Reusable dropdown component για επιλογή από λίστα επιλογών. Υποστηρίζει custom options, placeholder, αρχική επιλογή και reset κατά το άνοιγμα. Κλείνει αυτόματα κατά το click εκτός.

            - <b>Props</b>

                | Prop | Τύπος | Υποχρεωτικό | Default | Περιγραφή |
                |------|-------|-------------|---------|-----------|
                | `options` | `Option[]` (`{ key: number \| string, label: string }`) | Ναι | — | Λίστα επιλογών |
                | `onSelect` | `(key: number \| string) => void` | Ναι | — | Callback κατά την επιλογή |
                | `placeholder` | `string` | Όχι | `""` | Κείμενο placeholder |
                | `initialKey` | `number \| string` | Όχι | `null` | Αρχική επιλεγμένη τιμή |
                | `resetOnOpen` | `boolean` | Όχι | `false` | Αν `true`, επαναφέρει την επιλογή κατά το άνοιγμα |

            - <b>Παράδειγμα Χρήσης</b>

                    import SelectDropdown from "@/components/DropDown/SelectDropdown";

                    const options = [
                        { key: 1, label: "Επιλογή 1" },
                        { key: 2, label: "Επιλογή 2" },
                    ];

                    <SelectDropdown
                        options={options}
                        onSelect={(key) => console.log(key)}
                        placeholder="Επιλέξτε..."
                    />

            - <b>selectDropdown.module.css</b> : Styles για το SelectDropdown component.

    ---

    - Footer/
        - <b>Footer.tsx</b> : Footer component της εφαρμογής. Εμφανίζει το λογότυπο του Βενιζέλειου Νοσοκομείου, το copyright "2024 DiGiHip" και ένα ενσωματωμένο Google Maps iframe με την τοποθεσία του νοσοκομείου.

            - <b>Props</b> : Κανένα.

            - <b>Footer.module.css</b> : Styles για το Footer component.

    ---

    - HandleCases/
        - <b>HandleCases.tsx</b> : Ένα reusable component που εμφανίζει ένα μήνυμα ειδοποίησης (status notification) στο πάνω δεξιά μέρος της οθόνης. Χρησιμοποιείται για ενημέρωση του χρήστη σχετικά με την κατάσταση μιας ενέργειας (φόρτωση, επιτυχία, αποτυχία).

            Η ειδοποίηση εμφανίζεται με slide-in animation και κλείνει χειροκίνητα μέσω ενός κουμπιού (X). Το χρώμα αλλάζει ανάλογα με την κατάσταση: γκρι για φόρτωση, πράσινο για επιτυχία, κόκκινο για αποτυχία.

        - <b>Props</b>

            | Prop | Τύπος | Υποχρεωτικό | Default | Περιγραφή |
            |------|-------|-------------|---------|-----------|
            | `message` | `string` | Ναι | — | Το μήνυμα που εμφανίζεται στην ειδοποίηση |
            | `option` | `"loading" \| "success" \| "fail"` | Ναι | — | Καθορίζει το χρώμα (γκρι, πράσινο ή κόκκινο) |
            | `onClose` | `() => void` | Ναι | — | Callback που καλείται όταν ο χρήστης πατήσει το κουμπί κλεισίματος |
            | `visibility` | `boolean` | Ναι | — | Ελέγχει αν η ειδοποίηση είναι ορατή |

        - <b>Παράδειγμα Χρήσης</b>

            1. Προσθέστε ένα state για την ειδοποίηση στο component σας:

                    import HandleCases from "@/components/HandleCases/HandleCases";

                    const [modalState, setModalState] = useState<{
                        message: string;
                        option: "loading" | "success" | "fail";
                        visibility: boolean;
                    }>({
                        message: "",
                        option: "loading",
                        visibility: false,
                    });

            2. Ενεργοποιήστε την ειδοποίηση όπου χρειάζεται (π.χ. κατά τη διάρκεια ή μετά από μια ενέργεια):

                    // Φόρτωση
                    setModalState({ message: "Η διαδικασία βρίσκεται σε εξέλιξη", option: "loading", visibility: true });
                    // Επιτυχία
                    setModalState({ message: "Η ενέργεια ολοκληρώθηκε επιτυχώς", option: "success", visibility: true });
                    // Αποτυχία
                    setModalState({ message: "Προέκυψε σφάλμα", option: "fail", visibility: true });

            3. Προσθέστε το `<HandleCases />` στο JSX του component σας (συνήθως στο τέλος, πριν το κλείσιμο του parent element):

                    {modalState.visibility && (
                        <HandleCases
                            {...modalState}
                            onClose={() => setModalState(prev => ({ ...prev, visibility: false }))}
                        />
                    )}

            > **Σημείωση:** Η ειδοποίηση δεν κλείνει αυτόματα — ο χρήστης πρέπει να πατήσει το κουμπί (X) για να την κλείσει. Αυτό είναι χρήσιμο για μηνύματα που πρέπει να διαβαστούν πριν κλείσουν.

        - <b>HandleCases.module.css</b> : Περιέχει τα styles για το HandleCases component.
            - `.item` — Βασικό positioning (fixed, πάνω δεξιά, z-index 1000, slide-in animation)
            - `.succGreen` — Πράσινο background (`#179004`) για επιτυχία
            - `.failRed` — Κόκκινο background (`#f92335`) για αποτυχία
            - `.loadGrey` — Γκρι background (`#7c7c7c`) για φόρτωση
            - `@keyframes slideInFromOut` — Slide-in animation από τα δεξιά

    ---

    - Inputs/
        - Search/
            - <b>SearchInput.tsx</b> : Component πεδίου αναζήτησης με κουμπί εκκαθάρισης (X). Καλεί το `onSearch` callback σε κάθε αλλαγή κειμένου, επιτρέποντας live filtering.

                - <b>Props</b>

                    | Prop | Τύπος | Υποχρεωτικό | Default | Περιγραφή |
                    |------|-------|-------------|---------|-----------|
                    | `onSearch` | `(query: string) => void` | Ναι | — | Callback που καλείται σε κάθε αλλαγή του κειμένου αναζήτησης |
                    | `place_holder` | `string` | Ναι | — | Κείμενο placeholder του input |

                - <b>Παράδειγμα Χρήσης</b>

                        import SearchInput from "@/components/Inputs/Search/SearchInput";

                        <SearchInput
                            onSearch={(query) => setSearchTerm(query)}
                            place_holder="Αναζήτηση ασθενή..."
                        />

                - <b>SearchInput.module.css</b> : Styles για το SearchInput component.

    ---

    - <b>Layout.tsx</b> : Wrapper component που περιβάλλει τα children με το `Navbar` (πάνω) και το `Footer` (κάτω). Χρησιμοποιείται ως βασικό layout για τις authenticated σελίδες.

        - <b>Props</b>

            | Prop | Τύπος | Υποχρεωτικό | Default | Περιγραφή |
            |------|-------|-------------|---------|-----------|
            | `children` | `ReactNode` | Ναι | — | Το περιεχόμενο της σελίδας |

        - <b>Παράδειγμα Χρήσης</b>

                import Layout from "@/components/Layout";

                <Layout>
                    <MyPageContent />
                </Layout>

    ---

    - Navbar/
        - <b>Navbar.tsx</b> : Κύριο navigation bar της εφαρμογής (client component). Εμφανίζει το λογότυπο "DiGiHip", links πλοήγησης (Αρχική Σελίδα, Τα Ραντεβού Μου, Μηνύματα με badge αδιάβαστων) και dropdown menu χρήστη (Προφίλ, Αποσύνδεση). Χρησιμοποιεί τα contexts `useDoctor` και `useUnreadMessages`. Ανακατευθύνει στο login αν δεν υπάρχει authenticated χρήστης.

            - <b>Props</b> : Κανένα.

            - <b>Navbar.module.css</b> : Styles για το Navbar component.

    ---

    - NavbarLogin/
        - <b>NavbarLogin.tsx</b> : Απλοποιημένο navigation bar για τις σελίδες login/signup. Εμφανίζει μόνο το λογότυπο "DiGiHip" χωρίς links πλοήγησης ή user actions.

            - <b>Props</b> : Κανένα.

            - <b>NavbarLogin.module.css</b> : Styles για το NavbarLogin component.

    ---

    - PatientAppointmentModal/
        - <b>PatientAppointmentModal.tsx</b> : Modal δημιουργίας ραντεβού για συγκεκριμένο ασθενή (χρησιμοποιείται από τη σελίδα patient-details). Περιλαμβάνει DatePicker (inline), TimeSelect, πεδία αιτιολογίας και ιατρού. Αποτρέπει το scroll του background ενώ είναι ανοιχτό.

            - <b>Props</b>

                | Prop | Τύπος | Υποχρεωτικό | Default | Περιγραφή |
                |------|-------|-------------|---------|-----------|
                | `isVisible` | `boolean` | Ναι | — | Ελέγχει αν το modal είναι ορατό |
                | `onClose` | `() => void` | Ναι | — | Callback κλεισίματος |
                | `patientName` | `string` | Ναι | — | Όνομα ασθενή (εμφανίζεται στον τίτλο) |
                | `onSubmit` | `(data: { date, time, reason, doctor }) => void` | Ναι | — | Callback υποβολής με τα δεδομένα ραντεβού |

            - <b>PatientAppointmentModal.module.css</b> : Styles για το PatientAppointmentModal component.

    ---

    - PatientNotificationModal/
        - <b>PatientNotificationModal.tsx</b> : Modal δημιουργίας ειδοποιήσεων για ασθενή. Υποστηρίζει προεπιλεγμένες ειδοποιήσεις (Καθημερινή Υγεία, Αποκατάσταση, Γενικές) με checkboxes και δυνατότητα προσθήκης προσαρμοσμένων ειδοποιήσεων (τίτλος, μήνυμα, περίοδος). Οι ήδη ενεργές ειδοποιήσεις εμφανίζονται ως disabled.

            - <b>Props</b>

                | Prop | Τύπος | Υποχρεωτικό | Default | Περιγραφή |
                |------|-------|-------------|---------|-----------|
                | `isVisible` | `boolean` | Ναι | — | Ελέγχει αν το modal είναι ορατό |
                | `onClose` | `() => void` | Ναι | — | Callback κλεισίματος |
                | `patientName` | `string` | Ναι | — | Όνομα ασθενή (εμφανίζεται στον τίτλο) |
                | `currentNotif` | `INotificationItem[]` | Ναι | — | Τρέχουσες ειδοποιήσεις ασθενή (για αποφυγή διπλοτύπων) |
                | `onSubmit` | `(data: { title, message, notifyPeriod, category }[]) => void` | Ναι | — | Callback υποβολής με τις νέες ειδοποιήσεις |

            - <b>PatientNotificationModal.module.css</b> : Styles για το PatientNotificationModal component.

    ---

    - Shared/
        - DateTime/
            - <b>DatePicker.tsx</b> : Component επιλογής ημερομηνίας βασισμένο στη βιβλιοθήκη `Flatpickr`. Υποστηρίζει inline εμφάνιση (ημερολόγιο ενσωματωμένο στη σελίδα) ή popup, με ελληνική τοπικοποίηση (Greek locale). Χρησιμοποιεί τη `date-fns` για formatting της επιλεγμένης ημερομηνίας.

                - <b>Props</b>

                    | Prop | Τύπος | Υποχρεωτικό | Default | Περιγραφή |
                    |------|-------|-------------|---------|-----------|
                    | `value` | `Date \| string` | Όχι | `undefined` | Η τρέχουσα επιλεγμένη ημερομηνία |
                    | `onChange` | `(date: Date) => void` | Ναι | — | Callback που καλείται κατά την επιλογή ημερομηνίας |
                    | `inline` | `boolean` | Όχι | `true` | Αν `true`, το ημερολόγιο εμφανίζεται ενσωματωμένο. Αν `false`, εμφανίζεται ως popup |
                    | `placeholder` | `string` | Όχι | `"Επιλέξτε ημερομηνία"` | Κείμενο placeholder όταν δεν υπάρχει επιλεγμένη ημερομηνία |

                - <b>Παράδειγμα Χρήσης</b>

                        import DatePicker from "@/components/Shared/DateTime/DatePicker";

                        const [date, setDate] = useState<Date | undefined>(undefined);

                        <DatePicker
                            value={date}
                            onChange={(d) => setDate(d)}
                            inline={true}
                            placeholder="Επιλέξτε ημερομηνία"
                        />

            - <b>TimeSelect.tsx</b> : Custom dropdown component για επιλογή ώρας. Εμφανίζει μια λίστα με προκαθορισμένες επιλογές ώρας και κλείνει αυτόματα όταν ο χρήστης κάνει κλικ εκτός του component.

                - <b>Props</b>

                    | Prop | Τύπος | Υποχρεωτικό | Default | Περιγραφή |
                    |------|-------|-------------|---------|-----------|
                    | `value` | `string` | Ναι | — | Η τρέχουσα επιλεγμένη ώρα (π.χ. `"09:00"`) |
                    | `options` | `string[]` | Ναι | — | Λίστα με τις διαθέσιμες ώρες προς επιλογή |
                    | `onChange` | `(val: string) => void` | Ναι | — | Callback που καλείται κατά την επιλογή ώρας |

                - <b>Παράδειγμα Χρήσης</b>

                        import TimeSelect from "@/components/Shared/DateTime/TimeSelect";

                        const timeOptions = ["08:00", "08:30", "09:00", "09:30", "10:00"];
                        const [time, setTime] = useState("");

                        <TimeSelect
                            value={time}
                            options={timeOptions}
                            onChange={(val) => setTime(val)}
                        />

            - <b>datePicker.module.css</b> : Κοινό αρχείο styles για τα DatePicker και TimeSelect components.
                - `.inlineCalendar` — Styles για το inline ημερολόγιο (Flatpickr overrides)
                - `.selectedDate` — Εμφάνιση επιλεγμένης ημερομηνίας
                - `.dateInput` — Input πεδίο για popup mode
                - `.timePickerWrap` — Container του TimeSelect dropdown
                - `.timePickerButton` — Κουμπί εμφάνισης του dropdown
                - `.timeList` / `.timeListItem` — Η λίστα επιλογών ώρας