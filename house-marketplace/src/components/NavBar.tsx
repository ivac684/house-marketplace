import { useNavigate } from "react-router-dom";
import OfferIcon from "../assets/svg/localOfferIcon.svg";
import ExploreIcon from "../assets/svg/exploreIcon.svg";
import PersonOutlineIcon from "../assets/svg/personOutlineIcon.svg";

function NavBar() {
  const navigate = useNavigate();

  return (
    <footer className="navbar">
      <nav className="navbarNav">
        <ul className="navbarListItems">
          <li className="navbarListItem" onClick={() => navigate("/")}>
            <ExploreIcon />

            <p>Explore</p>
          </li>
          <li className="navbarListItem" onClick={() => navigate("/offers")}>
            <OfferIcon />

            <p>Offers</p>
          </li>
          <li className="navbarListItem" onClick={() => navigate("/profile")}>
            <PersonOutlineIcon />

            <p>Profile</p>
          </li>
        </ul>
      </nav>
    </footer>
  );
}

export default NavBar;
