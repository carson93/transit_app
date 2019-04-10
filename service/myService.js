import { db } from '../db.js';

export const addUser = (username,password) => {
	db.ref('/users').push({
		username:username,
		password:password
	})
}