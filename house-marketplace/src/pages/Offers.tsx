import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";
import { MyFormData } from "../types/MyFormData";

function Offers() {
  const [listings, setListings] = useState<MyFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingsRef = collection(db, "listings");
        const q = query(
          listingsRef,
          where("offer", "==", true),
          orderBy("timestamp", "desc"),
          limit(10)
        );
        const querySnap = await getDocs(q);
        const listings: MyFormData[] = [];
        querySnap.forEach((doc) => {
          const data = doc.data() as MyFormData;
          listings.push({ ...data, id: doc.id });
        });
        setListings(listings);
        setLoading(false);
      } catch (error) {
        toast.error("Could not fetch listings");
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="category">
      <header>
        <p className="pageHeader">Offers</p>
      </header>
      {listings.length > 0 ? (
        <main>
          <ul className="categoryListings">
            {listings.map((listing) => (
              <ListingItem listing={listing} id={listing.id} key={listing.id} />
            ))}
          </ul>
        </main>
      ) : (
        <p>No listings for {params.categoryName}</p>
      )}
    </div>
  );
}

export default Offers;
