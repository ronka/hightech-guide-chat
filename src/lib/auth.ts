import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { Resend } from "resend";
import { db } from "@/db/index";
import * as schema from "@/db/schema";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? "noreply@example.com",
          to: email,
          subject: "🔐 הקישור שלך להתחברות מוכן!",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9f9f9; border-radius: 12px; direction: rtl; text-align: right;">
              <h1 style="font-size: 24px; color: #111; margin-bottom: 8px;">שלום! 👋</h1>
              <p style="font-size: 16px; color: #444; line-height: 1.6;">
                קיבלנו בקשה להתחברות לחשבונך. לחץ על הכפתור למטה כדי להיכנס — הקישור תקף ל-10 דקות בלבד. ⏱️
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${url}" style="background: #2563eb; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
                  ✨ כניסה לאתר
                </a>
              </div>
              <p style="font-size: 13px; color: #888; line-height: 1.5;">
                אם לא ביקשת להתחבר, אפשר פשוט להתעלם מהמייל הזה. 🙈<br/>
                הקישור לא יעבוד אחרי שתיכנס בפעם הראשונה.
              </p>
              <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
              <p style="font-size: 12px; color: #bbb; text-align: center;">
                נשלח עם ❤️ על ידי HighTech Guide
              </p>
            </div>
          `,
        });
      },
    }),
  ],
});
