import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import { getDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase.config";
import Spinner from "../components/Spinner";
import ShareIcon from "../assets/svg/shareIcon.svg";
import { MyFormData } from "../types/MyFormData";

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

function Listing() {
  const [listing, setListing] = useState<MyFormData | null>(null);
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
        setListing(docSnap.data() as MyFormData);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId, navigate]);

  if (loading || !listing || !listing.imgUrls) {
    return <Spinner />;
  }

  return (
    <main>
      <Swiper slidesPerView={1} pagination={{ clickable: true }}>
        {listing!.imgUrls.map((_, index) => (
          <SwiperSlide key={index}>
            <div
              style={{
                background: `url(${listing?.imgUrls[index]}) center no-repeat`,
                backgroundSize: "cover",
              }}
              className="swiperSlideDiv"
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div
        className="shareIconDiv"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setShareLinkCopied(true);
          setTimeout(() => {
            setShareLinkCopied(false);
          }, 2000);
        }}
      >
        <ShareIcon />
      </div>
      {shareLinkCopied && <p className="linkCopied">Link copied </p>}
      <div className="listingDetails">
        <p className="listingName">
          {listing?.name} - $
          {listing?.offer ? listing?.discountedPrice : listing?.regularPrice}
        </p>
        <p className="listingLocation">{listing?.address}</p>
        <p className="listingType">
          For {listing?.type === "rent" ? "Rent" : "Sale"}
        </p>
        {listing?.offer && (
          <p className="discountPrice">
            ${listing?.regularPrice - listing?.discountedPrice} discount
          </p>
        )}
        <ul className="listingDetailsList">
          <li>
            {listing?.bedrooms > 1
              ? `${listing?.bedrooms} Bedrooms`
              : "1 Bedroom"}
          </li>
          <li>
            {listing?.bathrooms > 1
              ? `${listing?.bathrooms} Bathrooms`
              : "1 Bathroom"}
          </li>
          <li>{listing?.parking ? "Parking spot" : "No parking"}</li>
          <li>{listing?.furnished ? "Furnished" : "Not furnished"}</li>
        </ul>
        <p className="listingLocationTitle">Location</p>

        <div className="leafletContainer">
          <MapContainer
            style={{ height: "100%", width: "100%" }}
            center={[listing.geolocation!.lat, listing.geolocation!.lng]}
            zoom={13}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
            />
            <Marker
              position={[listing.geolocation!.lat, listing.geolocation!.lng]}
            >
              <Popup>{listing!.address}</Popup>
            </Marker>
          </MapContainer>
        </div>

        {auth.currentUser?.uid !== listing?.userRef && (
          <Link
            to={`/contact/${listing?.userRef}?listingName=${listing?.name}`}
            className="primaryButton"
          >
            Contact Landlord
          </Link>
        )}
      </div>
    </main>
  );
}

export default Listing;
