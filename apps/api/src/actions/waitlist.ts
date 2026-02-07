import { db, waitlist, eq } from "@app/database";
import { sendTemplateEmail } from "@app/mailer";
import { throwError } from "../lib/errors";

interface SignupInput {
  email: string;
  name?: string;
}

export class WaitlistActions {
  static async signup(input: SignupInput) {
    const normalizedEmail = input.email.toLowerCase().trim();
    const name = input.name?.trim() || "there";

    // Check if already signed up
    const existing = await db.query.waitlist.findFirst({
      where: eq(waitlist.email, normalizedEmail),
    });

    if (existing) {
      throwError("CONFLICT", "This email is already on the waitlist");
    }

    await db.insert(waitlist).values({
      email: normalizedEmail,
    });

    // Send waitlist welcome email (don't fail signup if email fails)
    try {
      await sendTemplateEmail("waitlistWelcome", {
        to: normalizedEmail,
        data: { name },
        locale: "en",
      });
    } catch (error) {
      console.error("[Waitlist] Failed to send welcome email:", error);
      // Don't throw - email failure shouldn't block signup
    }

    return {
      success: true,
      message: "Successfully joined the waitlist!",
    };
  }
}
