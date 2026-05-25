"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import styles from "@/digihip/messages/css/MessagesPage.module.css";
import { useSearchParams } from "next/navigation";
import { Menu, Dropdown, Button, Input } from "antd";
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import Link from "next/link";
import { io } from "socket.io-client";
import { usePatientProvider } from "@/api/_context/Patients/Context";
import { useUnreadMessages } from "@/api/_context/UnreadMessages/Context";
import { RiDeleteBinLine } from "react-icons/ri";

const socket = io(process.env.NEXT_PUBLIC_WS_URL || "", {
  transports: ["websocket"],
});

interface MessageDetail {
  _id: string;
  sender_id: string;
  text: string;
  messageType: 'text' | 'image' | 'pdf';
  mediaUrl: string,
  fileName: string,
  timestamp: string;
  sender_name?: string;
  isRead: boolean;
}

interface Messages {
  _id: string;
  patient_id: string;
  patientid: number;
  patient_name?: string;
  messages: MessageDetail[];
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MessagesPageContent />
    </Suspense>
  );
}

function MessagesPageContent() {
  const [allMessages, setAllMessages] = useState<Messages[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Messages | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [newMessage, setNewMessage] = useState<string>("");
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [patientSearch, setPatientSearch] = useState<string>("");
  const searchParams = useSearchParams();
  const doctorUsername = searchParams.get("doctor");
  const { patientsList } = usePatientProvider();
  const DEBOUNCE_DELAY = 300;
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowPreview(true);
    }
  };
  const { incrementUnreadCount, resetUnreadCount } = useUnreadMessages();

  type Patient = {
    _id: string;
    id: number;
    firstname: string;
    lastname: string;
  };

  useEffect(() => {
    socket.on("newMessage", (data) => {
      // Ensure that we have a doctorId loaded
      if (!doctorId) return;

      // Check if the last message is from the patient
      const lastMessage = data.messages[data.messages.length - 1];
      if (lastMessage && lastMessage.sender_id === data.patient_id) {
        incrementUnreadCount(); // Only increment if the last message is from the patient
      }

      // Update allMessages with the new message data
      setAllMessages((prevMessages) => {
        return prevMessages.map((conv) =>
          conv.patient_id === data.patient_id
            ? { ...conv, messages: data.messages }
            : conv
        );
      });

      // Update selectedConversation if it matches the new message's patient ID
      setSelectedConversation((prevConversation) => {
        if (
          prevConversation &&
          prevConversation.patient_id === data.patient_id
        ) {
          return { ...prevConversation, messages: data.messages };
        }
        return prevConversation;
      });
    });

    // Clean up WebSocket listeners on unmount
    return () => {
      socket.off("newMessage");
    };
  }, [incrementUnreadCount, doctorId]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/messages");
        if (!response.ok) throw new Error("Failed to fetch messages");

        const messagesData: Messages[] = await response.json();
        const patientsData = JSON.stringify(patientsList);
        const parsedPatientsData: Patient[] = JSON.parse(patientsData);

        setAllMessages(messagesData);
        setPatients(parsedPatientsData);
        setFilteredPatients(parsedPatientsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientsList, doctorId]);

  useEffect(() => {
    const fetchDoctorId = async () => {
      try {
        const doctorResponse = await fetch("/api/doctors/getDoctorId", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: doctorUsername }),
        });

        if (!doctorResponse.ok) throw new Error("Failed to fetch doctor ID");

        const { doctorId } = await doctorResponse.json();
        setDoctorId(doctorId);
      } catch (err) {
        console.error("Error fetching doctor ID:", err);
      }
    };

    fetchDoctorId();
  }, [doctorUsername]);

  const handleSendMessage = useCallback(async () => {
    
    if (!selectedConversation || !doctorId || (!newMessage.trim() && !selectedFile)) return; 

    try {
      const formData = new FormData();
      // Attach regular fields
      formData.append("_id", selectedConversation._id);
      formData.append("patient_id", selectedConversation.patient_id);
      formData.append("sender_id", doctorId);
      formData.append("timestamp", new Date().toISOString());
      formData.append("text", newMessage);
      
      // Attach file if selected
      if (selectedFile) {
        formData.append("file", selectedFile); // actual file object
        formData.append("fileName", selectedFile.name);
        formData.append("messageType", selectedFile.type.includes("pdf") ? "pdf" : "image");
      }

      const response = await fetch("/api/messages", {
        method: "POST",
        body: formData, // No need for headers, browser sets correct boundary
      });

      if (!response.ok) throw new Error("Failed to send message");

      const responseData = await response.json();
      setSelectedConversation((prev) =>
        prev ? { ...prev, messages: responseData.message.messages } : null
      );
      setAllMessages((prevMessages) =>
        prevMessages.map((conv) =>
          conv._id === selectedConversation._id
            ? { ...conv, messages: responseData.message.messages }
            : conv
        )
      );
      setNewMessage("");
      setPreviewUrl(""); setSelectedFile(null); setShowPreview(false);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  }, [newMessage, selectedConversation, doctorId, selectedFile]);

  const handleNewChat = ({ key }: { key: string }) => {
    const patient = patients.find((p) => p._id === key);
    if (patient) {
      setSelectedConversation({
        _id: "new",
        patient_id: patient._id,
        patientid: patient.id,
        patient_name: `${patient.firstname} ${patient.lastname}`,
        messages: [],
      });
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this conversation?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/messages/${conversationId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete conversation");

      // Remove the deleted conversation from the local state
      setAllMessages((prevMessages) =>
        prevMessages.filter((conv) => conv._id !== conversationId)
      );

      // Clear the selected conversation if it's the one being deleted
      if (selectedConversation && selectedConversation._id === conversationId) {
        setSelectedConversation(null);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (patientSearch === "") {
        setFilteredPatients(patients);
      } else {
        const filtered = patients.filter((patient) =>
          `${patient.firstname} ${patient.lastname}`
            .toLowerCase()
            .includes(patientSearch.toLowerCase())
        );
        setFilteredPatients(filtered);
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [patientSearch, patients]);

  const patientMenu = (
    <div>
      <Input
        placeholder="Search patients..."
        value={patientSearch}
        onChange={(e) => setPatientSearch(e.target.value)}
        style={{ marginBottom: "8px" }}
      />
      <Menu onClick={handleNewChat}>
        {filteredPatients.map((patient) => (
          <Menu.Item key={patient._id}>
            {`${patient.firstname} ${patient.lastname}`}
          </Menu.Item>
        ))}
      </Menu>
    </div>
  );

  useEffect(() => {
    if (selectedConversation) {
      scrollToBottom();
    }
  }, [selectedConversation, selectedConversation?.messages]);

  // Sort messages by latest timestamp
  const sortedMessages = useMemo(() => {
    return allMessages.sort((a, b) => {
      const lastMessageA = a.messages[a.messages.length - 1]?.timestamp;
      const lastMessageB = b.messages[b.messages.length - 1]?.timestamp;
      return (
        new Date(lastMessageB).getTime() - new Date(lastMessageA).getTime()
      );
    });
  }, [allMessages]);

  const markConversationAsRead = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/markAsRead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conversationId, doctorId }),
      });

      if (!response.ok) throw new Error("Failed to mark messages as read");

      // Reset the unread count to 0 after marking all messages as read
      resetUnreadCount();

      // Update the local state to mark the messages as read
      setAllMessages((prevMessages) =>
        prevMessages.map((conv) =>
          conv._id === conversationId
            ? {
                ...conv,
                messages: conv.messages.map((msg) => ({
                  ...msg,
                  isRead: true,
                })),
              }
            : conv
        )
      );
    } catch (error) {
      console.error("Error marking conversation as read:", error);
    }
  };

  return (
    <>
      <div className={styles.container}>
        {loading ? (
          <div>Loading data...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <>
            <div className={styles.leftPanel}>
              <div className={styles.headerContainer}>
                <h2>Συνομιλίες</h2>
                <Dropdown overlay={patientMenu} trigger={["click"]}>
                  <Button type="primary" className={styles.newChatButton}>
                    <EditOutlined style={{ marginRight: "8px" }} />
                  </Button>
                </Dropdown>
              </div>
              <div className={styles.conversationList}>
                {sortedMessages.map((patientMessages) => {
                  const unreadMessagesCount = patientMessages.messages.reduce(
                    (count, msg) => (!msg.isRead && msg.sender_id !== doctorId ? count + 1 : count),
                    0
                  );
                  const isUnread = unreadMessagesCount > 0;

                  return (
                    <div
                      key={patientMessages._id}
                      className={`${styles.conversationItem} ${
                        isUnread ? styles.unreadConversation : ""
                      }`}
                      onClick={() => {
                        setSelectedConversation(patientMessages);
                        markConversationAsRead(patientMessages._id); // Mark as read and update Navbar
                      }}
                    >
                      <div className={styles.patientName}>
                        {patientMessages.patient_name ||
                          patientMessages.patient_id}
                        {isUnread && (
                          <span className={styles.unreadBadge}>
                            {unreadMessagesCount}
                          </span>
                        )}
                      </div>
                      <div className={styles.conversationContent}>
                        <div className={styles.lastMessage}>
                          {patientMessages.messages.length > 0
                            ? patientMessages.messages[
                                patientMessages.messages.length - 1
                              ].text
                            : "No messages yet."}
                        </div>
                        <RiDeleteBinLine
                          onClick={(e) => {
                            e.stopPropagation(); // Prevents the click from selecting the conversation
                            handleDeleteConversation(patientMessages._id);
                          }}
                          className={styles.deleteIcon}
                          title="Delete conversation"
                        />
                      </div>
                      {patientMessages.messages.length > 0 && (
                        <div className={styles.messageTimestamp}>
                          {new Date(
                            patientMessages.messages[
                              patientMessages.messages.length - 1
                            ].timestamp
                          ).toDateString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.rightPanel}>
              {selectedConversation ? (
                <div>
                  <div className={styles.conversationHeader}>
                    {/* Make the patient's name clickable to go to their profile */}
                    <Link
                      href={{
                        pathname: "/digihip/patient-details",
                        query: {
                          id: selectedConversation.patientid, // new Patientid 1,2,3
                        },
                      }}
                      className={styles.headerPatientName} // Apply styles directly to the Link component
                    >
                      {selectedConversation.patient_name ||
                        selectedConversation.patient_id}
                    </Link>
                    <button
                      className={styles.closeButton}
                      onClick={() => setSelectedConversation(null)}
                    >
                      X
                    </button>
                  </div>
                  <div
                    ref={messagesContainerRef}
                    className={styles.messagesContainer}
                  >
                    {selectedConversation.messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`${styles.messageItem} ${
                          msg.isRead ? "" : styles.unreadMessage
                        } ${
                          msg.sender_id === doctorId
                            ? styles.adminMessage
                            : styles.patientMessage
                        }`}
                      >
                        {/* Text messages */}
                        {msg.messageType === 'text' && (
                          <p className={styles.messageText}>{msg.text}</p>
                        )}
                    
                      {msg.messageType === 'image' && msg.mediaUrl && (
                        <>
                          <img
                            src={msg.mediaUrl}
                            alt="Sent media"
                            className={styles.messageImage}
                          />
                          {msg.text && (
                            <p className={styles.messageText}>{msg.text}</p>
                          )}
                        </>
                      )}
                    
                        {/* PDF messages */}
                        {msg.messageType === 'pdf' && msg.mediaUrl && (
                          <>
                            <a
                              href={msg.mediaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.messagePdfLink}
                            >
                              📄 {msg.fileName || "View PDF"}
                            </a>
                            {msg.text && (
                              <p className={styles.messageText}>{msg.text}</p>
                            )}
                          </>
                        )}
                    
                        {/* Timestamp */}
                        <p className={styles.messageTimestamp}>
                          <small>{new Date(msg.timestamp).toLocaleString()}</small>
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className={styles.replyContainer}>
                    {/* Modal to display the selected file */}
                    {showPreview && selectedFile && (
                      <div className={styles.previewModal}>
                        <div className={styles.previewHeader}>
                          <span>{selectedFile.name}</span>
                          <button onClick={() => {setPreviewUrl(""); setSelectedFile(null); setShowPreview(false);}} className={styles.closePreviewBtn}>
                            ✕
                          </button>
                        </div>
                        <div className={styles.previewContent}>
                          {selectedFile.type.startsWith('image') ? (
                            <img src={previewUrl} alt="Preview" className={styles.previewImage} />
                          ) : (
                            <iframe src={previewUrl} className={styles.previewPDF}></iframe>
                          )}
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}} >
                      {/* File upload button */}
                      <label
                        htmlFor="fileInput"
                        className={styles.fileUploadButton}
                      >
                        <UploadOutlined />
                        <input
                          type="file"
                          id="fileInput"
                          accept="image/*,application/pdf"
                          style={{ display: "none" }}
                          onChange={handleFileChange}
                        />
                      </label>
                      {/* Message textarea */}
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message here"
                        className={styles.replyInput}
                      ></textarea>
                      <button
                        className={styles.sendButton}
                        onClick={handleSendMessage}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p>Επιλέξτε μια συνομιλία για να δείτε τα μηνύματα</p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
