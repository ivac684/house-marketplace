import { Link } from "react-router-dom";
import DeleteIcon from "../assets/svg/deleteIcon.svg";
import BedIcon from "../assets/svg/bedIcon.svg";
import BathtubIcon from "../assets/svg/bathtubIcon.svg";
import { DocumentData } from "firebase/firestore";

interface ListingItemProps {
  listing: DocumentData;
  id: string;
}

function ListingItem({ listing, id }: ListingItemProps) {
  return (
    <div>
      <li className="categoryListing">
        <Link
          to={`/category/${listing.type}/${id}`}
          className="categoryListingLink"
        >
          <img
            src={listing.imageUrls[0]}
            alt={listing.name}
            className="categoryListingImg"
          ></img>
          <div className="categoryListingDetails">
            <p className="categoryListingLocation">{listing.location}</p>
            <p className="categoryListingName">{listing.name}</p>
            <p className="categoryListingPrice">
              $
              {listing.offer
                ? listing.discountedPrice
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                : listing.regularPrice
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              {listing.type === "rent" && " / month"}
            </p>
            <div className="categoryListingInfoDiv">
              <BedIcon />
              <p className="categoryListingInfoText">
                {listing.bedrooms > 1
                  ? `${listing.bedrooms} Bedrooms`
                  : "1 Bedroom"}
              </p>
              <BathtubIcon />
              <p className="categoryListingInfoText">
                {listing.bathrooms > 1
                  ? `${listing.bathrooms} Bathrooms`
                  : "1 Bathroom"}
              </p>
            </div>
          </div>
        </Link>
        {/* {onDelete && (
          <div
            className="removeIcon"
            onClick={() => onDelete(listing.id, listing.name)}
          >
            <DeleteIcon />
          </div>
        )} */}
      </li>
    </div>
  );
}

export default ListingItem;
