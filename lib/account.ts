import { isUuid, transaction } from "./db";

/**
 * Deletes an account. Its comments stay on the articles, shown as from a former member. Enquiries stay too,
 * since they are business records; they are not linked to the account by id, only by the email they were sent with.
 * Password-reset and verification links are removed with the account (they cascade).
 */
export async function deleteAccount(userId: string): Promise<void> {
  if (!isUuid(userId)) return;
  await transaction(async (client) => {
    await client.query("update comments set user_id = null, name = 'Former member' where user_id = $1", [userId]);
    await client.query("delete from users where id = $1", [userId]);
  });
}
