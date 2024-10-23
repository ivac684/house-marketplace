export interface Geolocation {
  lat: number;
  lng: number;
}

export interface MyFormData {
  id: string;
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
  geolocation?: Geolocation;
  imgUrls: File[];
  userRef: string;
}

export const createDefaultFormData = (): MyFormData => ({
  id: "",
  name: "",
  address: "911 Hillside Dr, Kodiak, Alaska 99615, USA",
  type: "rent",
  bedrooms: 1,
  bathrooms: 1,
  parking: false,
  furnished: false,
  offer: false,
  regularPrice: 0,
  discountedPrice: 0,
  geolocation: { lat: 0, lng: 0 },
  imgUrls: [],
  userRef: "",
});
