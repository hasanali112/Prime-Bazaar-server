import { v4 as uuidv4 } from "uuid";

export function generateOrderNumber() {
  const prefix = "ORD";
  const uuid = uuidv4().split("-")[0].toUpperCase();
  return `${prefix}-${uuid}`;
}

export function generateTransactionNumber() {
  const prefix = "TXN";
  const uuid = uuidv4().split("-")[0].toUpperCase();
  return `${prefix}-${uuid}`;
}

// Helper function to generate an order number
//   export function generateOrderNumber() {
//     const prefix = "ORD";
//     const timestamp = Date.now().toString().slice(-8);
//     const random = Math.floor(Math.random() * 10000)
//       .toString()
//       .padStart(4, "0");
//     return `${prefix}-${timestamp}-${random}`;
//   }
