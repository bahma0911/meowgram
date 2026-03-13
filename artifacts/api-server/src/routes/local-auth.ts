import bcrypt from "bcryptjs";
import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { createSession, clearSession, getSessionId, type SessionData } from "../lib/auth";
import { SESSION_COOKIE, SESSION_TTL } from "../lib/auth";

const router: IRouter = Router();

function setSessionCookie(res: Response, sid: string) {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

router.post("/register", async (req: Request, res: Response) => {
  const { username, password, firstName, lastName } = req.body as Record<string, string>;

  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }
  if (username.length < 3 || username.length > 30) {
    res.status(400).json({ error: "Username must be 3–30 characters" });
    return;
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    res.status(400).json({ error: "Username may only contain letters, numbers, and underscores" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "Username is already taken" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(usersTable)
    .values({
      username,
      passwordHash,
      firstName: firstName || username,
      lastName: lastName || null,
    })
    .returning();

  const sessionData: SessionData = {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    },
    access_token: "",
  };

  const sid = await createSession(sessionData);
  setSessionCookie(res, sid);
  res.json({ user: sessionData.user });
});

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body as Record<string, string>;

  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);

  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  const sessionData: SessionData = {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    },
    access_token: "",
  };

  const sid = await createSession(sessionData);
  setSessionCookie(res, sid);
  res.json({ user: sessionData.user });
});

router.post("/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  await clearSession(res, sid);
  res.json({ success: true });
});

export default router;
