import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { doc, getDoc, DocumentData } from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import LandLordData from "../types/LandlordData";

function Contact() {
  const [message, setMessage] = useState("");
  const [landlord, setLandlord] = useState<LandLordData | null>(null);
  const [searchParams] = useSearchParams();

  const params = useParams();

  useEffect(() => {
    const getLandlord = async () => {
      if (!params.landlordId) {
        return;
      }
      const docRef = doc(db, "users", params.landlordId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLandlord(docSnap.data() as LandLordData);
      } else {
        toast.error("Could not get landlord data");
      }
    };
    getLandlord();
  }, [params.landlordId]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setMessage(e.target.value);
  };

  return (
    <div className="pageContainer">
      <header>
        <p className="pageHeader">Contact Landlord</p>
      </header>
      {landlord !== null && (
        <main>
          <div className="contactLandlord">
            <p className="landlordName">Contact: {landlord?.name}</p>
          </div>
          <form className="messageForm">
            <div className="messageDiv">
              <label htmlFor="message" className="messageLabel">
                Message
              </label>
              <textarea
                name="message"
                id="message"
                className="textarea"
                value={message}
                onChange={onChange}
              ></textarea>
            </div>
            <a
              href={`mailto:${landlord.email}?Subject=${searchParams.get("listing")}&body=${message}`}
            >
              <button type="button" className="primaryButton">
                Send message
              </button>
            </a>
          </form>
        </main>
      )}
    </div>
  );
}

export default Contact;