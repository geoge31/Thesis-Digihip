import React, { useEffect, useState } from 'react';
import styles from '@/components/PatientNotificationModal/PatientNotificationModal.module.css';
import { INotificationItem } from '../../models/Notification'

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

interface NotificationModalProps {
  isVisible: boolean;
  onClose: () => void;
  patientName: string;
  currentNotif: INotificationItem[];
  onSubmit: (NotificationData: {
    title: string;
    message: string;
    notifyPeriod: string;
    category: string;
  }[]) => void;
}

const PatientNotificationModal: React.FC<NotificationModalProps> = ({ isVisible, onClose, patientName, currentNotif, onSubmit  }) => {
  const [selected, setSelected] = useState({});
  const [customNotifications, setCustomNotifications] = useState([]);
  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  // Filters only Προεπιλεγμένη notifications from currentNotif
  const predefinedNotifs = currentNotif.filter(n => n.title === 'Καθημερινή Υγεία' || 'Αποκατάσταση και Φυσικοθεραπεία' || 'Γενικές Ειδοποιήσεις');
  const predefinedSet = new Set(predefinedNotifs.map(n => `${n.title}:${n.message}`));
  const toggleNotification = (category: string, note: string) => {
    const key = `${category}:${note}`;
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateNotification = (index: number, field: string, value: string) => {
    const updated = [...customNotifications];
    updated[index][field] = value;
    setCustomNotifications(updated);
  };

  const addNotification = () => {
    const updated = [...customNotifications, { title: '', message: '', period: '' }];
    setCustomNotifications(updated);
    setSelectedTab(updated.length - 1);
  };

  const removeNotification = (index: number) => {
    const updated = [...customNotifications];
    updated.splice(index, 1);
    setCustomNotifications(updated);

    if (updated.length === 0) {
      setSelectedTab(null);
    } else if (index === selectedTab) {
      setSelectedTab(0);
    } else if (index < (selectedTab || 0)) {
      setSelectedTab((prev) => (prev !== null ? prev - 1 : null));
    }
  };

  const isValid = () => {
    const selectedKeys = Object.keys(selected).filter((k) => selected[k]);
    const hasDefaults = selectedKeys.length > 0;
    const hasValidCustoms = customNotifications.some(n => n.title && n.message && n.period);
    return hasDefaults || hasValidCustoms;
  };

  const handleClose = () => {
    setSelected({});
    setCustomNotifications([]);
    setSelectedTab(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const combined: any[] = [];

    // Predefined notifications
    Object.entries(selected)
      .filter(([_, v]) => v)
      .forEach(([k]) => {
        const [title, message] = k.split(':');
        let notifyPeriod: string;
        switch( title ) {
          case 'Καθημερινή Υγεία':
            notifyPeriod = '1day';
            break;
          default:
            notifyPeriod = 'once';
        }

        combined.push({
          title: `${title}`,
          message,
          notifyPeriod, 
          category: 'Προεπιλεγμένη',
          createAt: new Date(),
          isActive: true,
        });
    });

    // Custom notifications
    customNotifications.forEach((custom) => {
      if (custom.title && custom.message && custom.period) {
        combined.push({
          title: custom.title,
          message: custom.message,
          notifyPeriod: custom.period,
          category: 'Προσαρμοσμένη',
          createAt: new Date(),
          isActive: true,
        });
      }
    });

    onSubmit(combined);
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h1 style={{ paddingBottom: '16px'}}>Νέες Ειδοποιήσεις για {patientName}</h1>
        <div>
          {Object.entries(notificationCategories).map(([category, notes]) => {
            // Define memo text per category
            const memoTextMap: Record<string, string> = {
              'Καθημερινή Υγεία': 'Ο ασθενής θα λαμβάνει καθημερινές ειδοποιήσεις για αυτή την κατηγορία.',
              'Αποκατάσταση και Φυσικοθεραπεία': 'Ο ασθενής θα λάβει μία MONO ειδοποίηση μόλις τεθεί η υπενθύμιση.',
              'Γενικές Ειδοποιήσεις': 'Ο ασθενής θα λάβει μία MONO ειδοποίηση μόλις τεθεί η υπενθύμιση.',
            };
            const memoText = memoTextMap[category] || '';

            return (
              <div key={category} className={styles.category}>
                <h2 className={styles.categoryTitle}>
                  {category} <span className={styles.categoryMemo}>({memoText})</span>
                </h2>
                
                <div className={styles.selections}>
                  {notes.map((note) => {
                    const key = `${category}:${note}`;
                    const isDisabled = predefinedSet.has(key);
                    return (
                      <label
                        key={note}
                        style={{
                          opacity: isDisabled ? 0.5 : 1,
                          pointerEvents: isDisabled ? 'none' : 'auto',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selected[key] || false}
                          onChange={() => toggleNotification(category, note)}
                          disabled={isDisabled}
                        />
                        <h4 style={{fontSize: '1rem', fontWeight: 'normal'}}>{note}</h4>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
          

          {/* Custom Notifications */}
          {customNotifications.length > 0 && (
            <div className={styles.tabHeaderWrapper} style={{paddingTop: '24px'}}>
              {customNotifications.map((_, index) => (
                <div key={index} className={`${styles.tabHeader} ${selectedTab === index ? styles.active : ''}`} onClick={() => setSelectedTab(index)}>
                  Ειδοποίηση {index + 1}
                  <button
                    className={styles.tabCloseBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(index);
                    }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}
          {customNotifications.length > 0 && (
            <div className={styles.category}>
              <h3 className="font-medium text-gray-700 mb-2">Προσαρμοσμένη Ειδοποίηση #{selectedTab + 1}</h3>
              <div className={styles.selections}>
                <input
                  type="text"
                  placeholder="Τίτλος"
                  value={customNotifications[selectedTab]?.title || ''}
                  onChange={(e) => updateNotification(selectedTab, 'title', e.target.value)}
                  className={styles.input}
                />
                <textarea
                  placeholder="Μήνυμα"
                  value={customNotifications[selectedTab]?.message || ''}
                  onChange={(e) => updateNotification(selectedTab, 'message', e.target.value)}
                  className={styles.textarea}
                />
                <select
                  value={customNotifications[selectedTab]?.period || ''}
                  onChange={(e) => updateNotification(selectedTab, 'period', e.target.value)}
                  className={styles.select}
                >
                  <option value="">Επιλογή Περιόδου</option>
                  <option value="once">1 φορά</option>
                  <option value="12h">12 ώρες</option>
                  <option value="1day">1 μέρα</option>
                  <option value="2days">2 μέρες</option>
                  <option value="5days">5 μέρες</option>
                  <option value="1week">1 εβδομάδα</option>
                  <option value="2weeks">2 εβδομάδες</option>
                  <option value="1month">1 μήνας</option>
                  <option value="2months">2 μήνες</option>
                  <option value="4months">4 μήνες</option>
                  <option value="6months">6 μήνες</option>
                  <option value="1year">1 χρόνος</option>
                </select>
              </div>
            </div>
          )}
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: customNotifications.length > 0 ? '0px' : '24px',}}>
          <button className={styles.add_btn} onClick={addNotification}>Προσθήκη Νέας Ειδοποίησης</button>
          <div className={styles.buttons}>
            <button type="submit" onClick={handleSubmit} disabled={!isValid()}>
              Αποθήκευση
            </button>
            <button type="button" onClick={handleClose}>
              Άκυρο
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientNotificationModal;
