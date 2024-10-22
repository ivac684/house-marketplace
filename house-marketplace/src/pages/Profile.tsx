import { getAuth, updateProfile } from "firebase/auth";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase.config";
import {
  updateDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import ArrowRight from "../assets/svg/keyboardArrowRightIcon.svg";
import HomeIcon from "../assets/svg/homeIcon.svg";
import MyFormData from "../types/MyFormData";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";

function Profile() {
  const auth = getAuth();
  const [changeDetails, setChangeDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<MyFormData[]>([]);
  const [formData, setFormData] = useState({
    name: auth.currentUser?.displayName || "",
    email: auth.currentUser?.email || "",
  });

  const { name } = formData;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserListings = async () => {
      const listingsRef = collection(db, "listings");
      const q = query(
        listingsRef,
        where("userRef", "==", auth.currentUser?.uid),
        orderBy("timestamp", "desc")
      );
      const querySnap = await getDocs(q);

      const listings: MyFormData[] = [];
      querySnap.forEach((doc) => {
        const data = doc.data() as MyFormData;
        listings.push(data);
      });
      setLoading(false);
      setListings(listings);
    };
    fetchUserListings();
  }, [auth.currentUser?.uid]);

  const onLogout = () => {
    auth.signOut();
    navigate("/");
  };

  const onSubmit = async () => {
    try {
      const currentUser = auth.currentUser;

      if (currentUser && currentUser.displayName !== name) {
        await updateProfile(currentUser, {
          displayName: name,
        });
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, {
          name,
        });
      }
    } catch (error) {
      toast.error("Could not update profile details");
    }
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="profile">
      <header className="profileHeader">
        <p className="pageHeader">My Profile</p>
        <button type="button" className="logOut" onClick={onLogout}>
          Logout
        </button>
      </header>
      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <p
            className="changePersonalDetails"
            onClick={() => {
              if (changeDetails) {
                onSubmit();
              }
              setChangeDetails((prevState) => !prevState);
            }}
          >
            {changeDetails ? "Done" : "Change"}
          </p>
        </div>
        <div className="profileCard">
          <form>
            <input
              type="text"
              id="name"
              className={!changeDetails ? "profileEmail" : "profileEmailActive"}
              disabled={!changeDetails}
              value={name}
              onChange={onChange}
            />
          </form>
        </div>
        <Link to="/create-listing" className="createListing">
          <HomeIcon />
          <p>Sell or rent your home</p>
          <ArrowRight />
        </Link>
      </main>
      {!loading && listings?.length > 0 && (
        <>
          <p className="listingText">Your listings</p>
          <ul className="listingsList">
            {listings.map((listing) => (
              <ListingItem listing={listing} id={listing.name} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default Profile;
