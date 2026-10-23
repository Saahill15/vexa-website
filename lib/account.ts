import { update } from "./store";

/**
 * Deletes an account. Its comments stay on the articles, shown as from a former member. Enquiries stay too,
 * since they are business records; they are not linked to the account by id, only by the email they were sent with.
 */
export async function deleteAccount(userId: string): Promise<void> {
  await update<{ userId: string }>("password-resets", (rows) => {
    for (let i = rows.length - 1; i >= 0; i--) if (rows[i].userId === userId) rows.splice(i, 1);
  });
  await update<{ userId: string }>("email-verifications", (rows) => {
    for (let i = rows.length - 1; i >= 0; i--) if (rows[i].userId === userId) rows.splice(i, 1);
  });
  await update<{ userId: string; name: string }>("comments", (rows) => {
    for (const c of rows) {
      if (c.userId !== userId) continue;
      c.userId = "";
      c.name = "Former member";
    }
  });
  await update<{ id: string }>("users", (rows) => {
    const i = rows.findIndex((u) => u.id === userId);
    if (i >= 0) rows.splice(i, 1);
  });
}
