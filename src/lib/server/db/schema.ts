import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	email: text('email').notNull().unique(),
	password: text('password').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

export const sessions = sqliteTable('sessions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	token: text('token').notNull().unique(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

export const reviews = sqliteTable('reviews', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	restaurantId: text('restaurant_id').notNull(), // Google Place ID
	restaurantName: text('restaurant_name').notNull(),
	rating: integer('rating').notNull(), // 1-5
	comment: text('comment'), // Optional
	visitDate: integer('visit_date', { mode: 'timestamp' }), // Optional
	wouldVisitAgain: integer('would_visit_again', { mode: 'boolean' })
		.notNull()
		.default(sql`0`),
	photos: text('photos'), // JSON string array - Optional
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

export const visitHistory = sqliteTable('visit_history', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	restaurantId: text('restaurant_id').notNull(), // Google Place ID
	restaurantName: text('restaurant_name').notNull(),
	restaurantAddress: text('restaurant_address'), // Optional
	visitDate: integer('visit_date', { mode: 'timestamp' }).notNull(),
	hasReview: integer('has_review', { mode: 'boolean' })
		.notNull()
		.default(sql`0`),
	reviewId: integer('review_id').references(() => reviews.id, { onDelete: 'set null' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type VisitHistory = typeof visitHistory.$inferSelect;
export type NewVisitHistory = typeof visitHistory.$inferInsert;
