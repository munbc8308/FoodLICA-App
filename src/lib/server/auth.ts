import bcrypt from 'bcrypt';
import { db } from './db';
import { users, sessions, type User, type Session } from './db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const SALT_ROUNDS = 10;
const SESSION_EXPIRY_DAYS = 30;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

/**
 * Generate a secure random token
 */
function generateToken(): string {
	return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new user
 */
export async function createUser(email: string, password: string): Promise<User> {
	const hashedPassword = await hashPassword(password);

	const [user] = await db
		.insert(users)
		.values({
			email,
			password: hashedPassword
		})
		.returning();

	return user;
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | undefined> {
	const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
	return user;
}

/**
 * Create a new session for a user
 */
export async function createSession(userId: number): Promise<Session> {
	const token = generateToken();
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

	const [session] = await db
		.insert(sessions)
		.values({
			userId,
			token,
			expiresAt
		})
		.returning();

	return session;
}

/**
 * Find session by token
 */
export async function findSessionByToken(token: string): Promise<
	| (Session & {
			user: User;
	  })
	| undefined
> {
	const [result] = await db
		.select({
			id: sessions.id,
			userId: sessions.userId,
			token: sessions.token,
			expiresAt: sessions.expiresAt,
			createdAt: sessions.createdAt,
			user: users
		})
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.token, token))
		.limit(1);

	return result;
}

/**
 * Delete a session
 */
export async function deleteSession(token: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.token, token));
}

/**
 * Delete all expired sessions
 */
export async function deleteExpiredSessions(): Promise<void> {
	const now = new Date();
	await db.delete(sessions).where(eq(sessions.expiresAt, now));
}

/**
 * Validate session and return user if valid
 */
export async function validateSession(token: string | undefined): Promise<User | null> {
	if (!token) {
		return null;
	}

	const session = await findSessionByToken(token);

	if (!session) {
		return null;
	}

	// Check if session is expired
	if (session.expiresAt < new Date()) {
		await deleteSession(token);
		return null;
	}

	return session.user;
}
