export default interface Geolocation {
  lat: number;
  lng: number;
}

export default interface MyFormData {
  name: string;
  address: string;
  type: "rent" | "sale";
  bedrooms: number;
  bathrooms: number;
  parking: boolean;
  furnished: boolean;
  offer: boolean;
  regularPrice: number;
  discountedPrice: number;
  geolocation: Geolocation;
  imgUrls: string[];
  userRef: string;
}
