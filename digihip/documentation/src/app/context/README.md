### Υλοποίηση context-api

- src/app
    - context/
        - <b>AdminContext.tsx</b> : Αφορά την διαχείριση των δεδομένων του admin με χρήση context  API στο React.

            - Το interface Admin ορίζει την δομή δεδομένων που σχετίζονται με έναν admin. Περιγράφει πως θα πρέπει να μοιάζουν τα δεδομένα του admin σε όλη την εφαρμογή.

                    interface Admin {
                        _id: string;
                        username: string;
                        email: string;
                        firstName: string;
                        lastName: string;
                    }

            - Το interface AdminContextType καθορίζει το είδος δεδομένων που θα είναι διαθέσιμα μέσω του AdminContext 

                    interface AdminContextType {
                        adminData: AdminData | null;
                        setAdminData: React.Dispatch<react.SetStateaction<AdminData>>;
                        login: (usernameOrEmail: string, password: string) => Promise<{succes: boolean, usearnme?:string, message?:string}>;
                    }

            - Η συνάρτηση <b>export const AdminProvider</b> είναι το provider component που θα τυλίγει το κομμάτι της εφαρμογής, όταν θέλουμε να έχουμε πρόσβαση στα δεδομένα του admin μέσω του context.
                
                - H συνάρτηση useEffect εκτελείται όταν φορτώνεται το component, καλώντας την συνάρτηση fetchadminData για να φέρει τα δεδομένα του admin από το 
                <b>api/admins/login</b>  

                        export const AdminProvider = ({ children }: { children: ReactNode }) => {
                            const [adminData, setAdminData] = useState<AdminData>(null);

                            const login = async (usernameOrEmail: string, password: string) => {
                                const response = await fetch('/api/admins/login', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ usernameOrEmail, password }),
                                });

                                const data = await response.json();

                                if (response.ok) {
                                const { _id, username, firstName, lastName } = data;
                                setAdminData([{ _id, username, firstName, lastName }]);
                                return { success: true, username };
                                } else {
                                return { success: false, message: data.message };
                                }
                            };

                            return (
                                <AdminContext.Provider value={{ adminData, setAdminData, login }}>
                                {children}
                                </AdminContext.Provider>
                            );
                        };

            - To custom hook <b>useAdmin</b> επιτρέπει σε οποιδήποτε component να αποκτήσει πρόσβαση στα δεδομένα του admin χωρίς να χρειάζεται να χρησιμοποιηθεί το useContext κάθε φορά.

                        export const useAdmin = () => {
                            cosnt cxontext = usecontext(AdminContext);
                            if(!context) {
                                throw new Error('useAdmin must be used within an AdminProvider')
                            }

                            return context;
                        };
                     
                