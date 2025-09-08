// lib/helpers.js
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
};

const safeIso = (val) => {
  if (val === undefined || val === null) return null;
  if (typeof val === "string") return val;
  if (val instanceof Date) return val.toISOString();
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
};

export const serializeCarData = (car = {}, wishlisted = false) => {
  const images =
    Array.isArray(car.images) && car.images.length > 0
      ? car.images.map((img) => img.url)
      : car.imageUrl
      ? [car.imageUrl]
      : [];

  return {
    id: car.id,
    title: car.title ?? `${car.make ?? ""} ${car.model ?? ""}`.trim(),
    make: car.make ?? null,
    model: car.model ?? null,
    year: car.year ?? null,
    price: car.price !== undefined && car.price !== null ? parseFloat(car.price) : 0,
    description: car.description ?? null,
    images,
    image: images.length ? images[0] : null,
    isForSale: !!car.isForSale,
    isForRent: !!car.isForRent,
    isVerified: !!car.isVerified,
    status: car.status ?? null,
    condition: car.condition ?? null,
    location: car.location ?? null,
    ownerId: car.userId ?? null,
    createdAt: safeIso(car.createdAt),
    updatedAt: safeIso(car.updatedAt),
    wishlisted: !!wishlisted,
  };
};
