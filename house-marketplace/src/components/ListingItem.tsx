import { Link } from "react-router-dom";
import DeleteIcon from "../assets/svg/deleteIcon.svg";
import EditIcon from "../assets/svg/editIcon.svg";
import BedIcon from "../assets/svg/bedIcon.svg";
import BathtubIcon from "../assets/svg/bathtubIcon.svg";
import { MyFormData } from "../types/MyFormData";

interface ListingItemProps {
  listing: MyFormData;
  id: string;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

function ListingItem({ listing, id, onDelete, onEdit }: ListingItemProps) {
  return (
    <div>
      <li className="categoryListing">
        <Link
          to={`/category/${listing.type}/${id}`}
          className="categoryListingLink"
        >
          <img
            src={listing.imgUrls?.[0]}
            alt={listing.name}
            className="categoryListingImg"
          ></img>
          <div className="categoryListingDetails">
            <div className="alignLeftCategory">
              <p className="categoryListingLocation">{listing.address}</p>
              <p className="categoryListingName">{listing.name}</p>
            </div>
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
        {onDelete && (
          <Link to={`/profile`} className="categoryListingLink">
            <div className="removeIcon" onClick={() => onDelete(listing.id)}>
              <DeleteIcon />
            </div>
          </Link>
        )}
        {onEdit && (
          <div
            className="editIcon"
            onClick={(e) => {
              e.preventDefault();
              onEdit(listing.id);
            }}
          >
            <EditIcon />
          </div>
        )}
      </li>
    </div>
  );
}

export default ListingItem;
