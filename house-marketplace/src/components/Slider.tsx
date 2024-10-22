import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase.config";
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import Spinner from "./Spinner";
import MyFormData from "../types/MyFormData";

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

function Slider() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<MyFormData[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      const listingRef = collection(db, "listings");
      const q = query(listingRef, orderBy("timestamp", "desc"), limit(5));
      const querySnap = await getDocs(q);

      const listings: MyFormData[] = [];
      querySnap.forEach((doc) => {
        const data = doc.data() as MyFormData;
        listings.push(data);
      });
      setListings(listings);
      setLoading(false);
    };

    fetchListings();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <Swiper slidesPerView={1} pagination={{ clickable: true }}>
        {listings.map((listing, id) => (
          <SwiperSlide
            key={id}
            onClick={() => navigate(`/category/${listing.type}/${id}`)}
          >
            <div
              style={{
                background: `url(${listing.imgUrls[0]}) center no-repeat`,
                backgroundSize: "cover",
              }}
              className="swiperSlideDiv"
            >
              <p className="swiperSlideText">{listing.name}</p>
              <p className="swiperSlidePrice">
                ${listing.discountedPrice ?? listing.regularPrice}
                {listing.type === "rent" && "/ month"}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default Slider;
