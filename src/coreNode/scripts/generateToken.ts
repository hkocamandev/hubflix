import { sign } from "jsonwebtoken";

const payload = { id: "123", role: "admin" };

// 26 Ağustos 2025'e kadar geçerli token
const token = sign(payload, "supersecretkey", {
  expiresIn: Math.floor(new Date("2025-08-26T23:59:59Z").getTime() / 1000) - Math.floor(Date.now() / 1000),
});

console.log(token);