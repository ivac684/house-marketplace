import { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.config";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { MyFormData, createDefaultFormData } from "../types/MyFormData";

interface Geolocation {
  lat?: number;
  lng?: number;
}

function EditListing() {
  const [geolocationEnabled, setGeolocationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState<MyFormData | null>(null);
  const [formData, setFormData] = useState<MyFormData>(createDefaultFormData());
  const auth = getAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  const params = useParams();

  useEffect(() => {
    if (listing && listing.userRef !== auth.currentUser?.uid) {
      toast.error("You can not edit this listing");
      navigate("/");
    }
  });

  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid });
        } else {
          navigate("/sign-in");
        }
      });
    }
    return () => {
      isMounted.current = false;
    };
  }, [isMounted]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (formData.discountedPrice >= formData.regularPrice) {
      setLoading(false);
      toast.error("That is not a discount :)");
      return;
    }
    if (formData.imgUrls.length > 6) {
      setLoading(false);
      toast.error("Max 6 images");
      return;
    }

    let geolocation: Geolocation = {};
    let location;

    if (geolocationEnabled) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${formData.address}&key=AIzaSyDMofzw2NhTu8kcRmq7vzxcvm45e6zMh5w`
      );
      const data = await response.json();
      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;
      location =
        data.status === "ZERO:RESULTS"
          ? undefined
          : data.results[0].formatted_address;

      if (location === undefined || location.includes("undefined")) {
        setLoading(false);
        toast.error("Please enter a correct address");
        return;
      }
      if (data.results && data.results[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        geolocation = { lat, lng };
        location = formData.address;
      }
    }
    const storeImage = async (image: File) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser?.uid}-${image.name}-${uuidv4()}`;
        const storageRef = ref(storage, "images/" + fileName);
        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            switch (snapshot.state) {
              case "paused":
                break;
              case "running":
                break;
            }
          },
          (error) => {
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    };

    useEffect(() => {
      setLoading(true);
      const fetchListing = async () => {
        if (!params.listingId) {
          return;
        }
        const docRef = doc(db, "listings", params.listingId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setListing(docSnap.data() as MyFormData);
          setFormData({
            ...(docSnap.data() as MyFormData),
            address: docSnap.data().location,
          });
          setLoading(false);
        } else {
          toast.error("Could not get listing data");
        }
      };
      fetchListing();
    }, [params.listingId, navigate]);

    const imgUrls = await Promise.all(
      [...formData.imgUrls].map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false);
      toast.error("Image is not uploaded :(");
      return;
    });
    const {
      imgUrls: File,
      address,
      ...formDataCopy
    } = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
    };
    if (!params.listingId) {
      return;
    }
    const docRef = doc(db, "listings", params.listingId);
    await updateDoc(docRef, formDataCopy);
    setLoading(false);
    toast.success("Listing saved :)");
    navigate(`category/${formDataCopy.type}/${docRef.id}`);
  };

  const onMutate = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement
    >
  ) => {
    let boolean = null;
    if (e.target.value === "true") {
      boolean = true;
    }
    if (e.target.value === "false") {
      boolean = false;
    }
    const target = e.target as HTMLInputElement;
    const files = target?.files;
    if (files) {
      setFormData((prevState) => ({
        ...prevState,
        images: Array.from(files),
      }));
    }
    if (!files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  };

  if (loading) {
    return <Spinner />;
  }
  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Edit a Listing</p>
      </header>
      <main>
        <form onSubmit={onSubmit}>
          <label className="formLabel">Sell / Rent</label>
          <div className="formButtons">
            <button
              type="button"
              className={
                formData.type === "sale" ? "formButtonActive" : "formButton"
              }
              id="type"
              value="sale"
              onChange={onMutate}
            >
              Sell
            </button>
            <button
              type="button"
              className={
                formData.type === "rent" ? "formButtonActive" : "formButton"
              }
              id="type"
              value="rent"
              onChange={onMutate}
            >
              Rent
            </button>
          </div>
          <label className="formLabel">Name</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            className="formInputName"
            onChange={onMutate}
            required
          />
          <div className="formRooms flex">
            <div>
              <label className="formLabel">Bedrooms</label>
              <input
                type="number"
                id="bedrooms"
                value={formData.bedrooms}
                className="formInputSmall"
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
            <div>
              <label className="formLabel">Bathrooms</label>
              <input
                type="number"
                id="bathrooms"
                value={formData.bathrooms}
                className="formInputSmall"
                min="1"
                max="50"
                onChange={onMutate}
                required
              />
            </div>
          </div>
          <label className="formLabel">Parking spot</label>
          <div className="formButtons">
            <button
              className={formData.parking ? "formButtonActive" : "formButton"}
              type="button"
              id="parking"
              value={true.toString()}
              onClick={onMutate}
              min="1"
              max="50"
            >
              Yes
            </button>
            <button
              className={
                !formData.parking && formData.parking !== null
                  ? "formButtonActive"
                  : "formButton"
              }
              type="button"
              id="parking"
              value={false.toString()}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label className="formLabel">Furnished</label>
          <div className="formButtons">
            <button
              type="button"
              id="furnished"
              value={true.toString()}
              className={formData.furnished ? "formButtonActive" : "formButton"}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              id="furnished"
              value={false.toString()}
              className={
                !formData.furnished && formData.furnished != null
                  ? "formButtonActive"
                  : "formButton"
              }
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label className="formLabel">Address</label>
          <textarea
            className="formInputAddress"
            type="text"
            id="address"
            value={formData.address}
            onChange={onMutate}
            required
          ></textarea>
          {!geolocationEnabled && (
            <div className="formLatLng flex">
              <div>
                <label className="formLabel">Latitude</label>
                <input
                  type="number"
                  className="formInputSmall"
                  id="latitude"
                  value={formData.geolocation?.lat}
                  onChange={onMutate}
                  required
                />
              </div>
              <div className="formLatLng flex">
                <div>
                  <label className="formLabel">Longitude</label>
                  <input
                    type="number"
                    className="formInputSmall"
                    id="longitude"
                    value={formData.geolocation?.lng}
                    onChange={onMutate}
                    required
                  />
                </div>
              </div>
            </div>
          )}
          <label className="formLabel">Offer</label>
          <div className="formButtons">
            <button
              className={formData.offer ? "formButtonActive" : "formButton"}
              type="button"
              id="offer"
              value={true.toString()}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !formData.offer && formData.offer !== null
                  ? "formButtonActive"
                  : "formButton"
              }
              type="button"
              id="offer"
              value={false.toString()}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label className="formLabel">Regular Price</label>
          <div className="formPriceDiv">
            <input
              type="number"
              className="formInputSmall"
              id="regularPrice"
              value={formData.regularPrice}
              onChange={onMutate}
              min="50"
              max="75000000"
              required
            />
            {formData.type === "rent" && (
              <p className="formPriceText">$ / Month</p>
            )}
          </div>
          {formData.offer && (
            <>
              <label className="formLabel">Discounted Price</label>
              <input
                type="number"
                className="formInputSmall"
                id="discountedPrice"
                value={formData.discountedPrice}
                min="50"
                max="75000000"
                onChange={onMutate}
                required={formData.offer}
              />
            </>
          )}
          <label className="formLabel">Images</label>
          <p className="imagesInfo">
            The first image will be the cover (max 6)
          </p>
          <input
            type="file"
            className="formInputFile"
            id="images"
            max="6"
            accept=".jpg, .png, .jpeg"
            onChange={onMutate}
            multiple
            required
          />
          <button type="submit" className="primaryButton createListingButton">
            Edit Listing
          </button>
        </form>
      </main>
    </div>
  );
}

export default EditListing;
