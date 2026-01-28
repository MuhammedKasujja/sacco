import "server-only";
import { SignJWT, jwtVerify } from "jose";
// import { SessionPayload } from "@/app/lib/definitions";
import { cookies } from "next/headers";
import { systemDateTime } from "./utils";

type SessionPayload = { userId: string; expiresAt: Date };

const secretKey = process.env.SESSION_SECRET;
// const sessionDuration = process.env.SESSION_EXPIRY_TIME ?? "1 day";
const sessionDuration = systemDateTime.plus({ days: 7 }).toJSDate();
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(sessionDuration)
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.log(`Failed to verify session ${error?.toString()}`);
  }
}

export async function createSession(userId: string) {
  const expiresAt = systemDateTime.plus({ days: 7 }).toJSDate();
  const session = await encrypt({ userId, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function updateSession() {
  const session = (await cookies()).get("session")?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return null;
  }

  const expires = systemDateTime.plus({ days: 7 }).toJSDate();

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
