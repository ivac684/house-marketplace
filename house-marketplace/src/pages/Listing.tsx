import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getDoc, doc, DocumentData } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase.config";
import Spinner from "../components/Spinner";
import ShareIcon from "../assets/svg/shareIcon.svg";

interface ListingData {
  name: string;
}

function Listing() {
  const [listing, setListing] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  const navigate = useNavigate();
  const params = useParams();
  const auth = getAuth();

  useEffect(() => {
    const fetchListing = async () => {
      if (!params.listingId) {
        navigate("/");
        return;
      }

      const docRef = doc(db, "listings", params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("lala", docSnap.data());
        setListing(docSnap.data() as ListingData);
        setLoading(false);
      }
    };

    fetchListing();
  }, [params.listingId, navigate]);

  if (loading) {
    return <Spinner />;
  }

  return <div>hello</div>;
}

export default Listing;
