
export function formatPrice(price) {
  if (typeof price !== "number") return price;
  // Format number with commas and Naira sign
  return `₦${price.toLocaleString()}`;
}

export function formatMileage(mileage) {
  if (typeof mileage !== "number") return mileage;
  // Format number with commas and "km"
  return `${mileage.toLocaleString()} km`;
}
