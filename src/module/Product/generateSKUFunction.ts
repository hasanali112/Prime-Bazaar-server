import { v4 as uuidv4 } from "uuid";

export const generateSKU = (productName: string, shopName: string): string => {
  const shortUUID = uuidv4().split("-")[0].toUpperCase(); // Extract first segment of UUID
  const namePart = productName.replace(/\s+/g, "").slice(0, 3).toUpperCase(); // First 3 letters of product name
  const shopPart = shopName.replace(/\s+/g, "").slice(0, 3).toUpperCase(); // First 3 letters of shop name

  return `${shopPart}-${namePart}-${shortUUID}`;
};
