"use server";
import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = new Resend(env.RESEND_API_KEY);

export type EmailFormState = {
  success: boolean;
  error: boolean;
  message: string;
};

export async function emailSubscribe(
  prevState: EmailFormState,
  formData: FormData,
) {
  const email = formData.get("accept-e") as string;

  try {
    await Promise.all([
      await resend.contacts.create({
        email: email,
        unsubscribed: false,
        audienceId: process.env.RESEND_GENERAL_AUDIENCE_ID!,
      }),
    ]);
  } catch (e) {
    if ((e as unknown as { code: string }).code !== "P2002") {
      console.error(
        "An unexpected error occured while creating a row for",
        email,
        ":",
        (e as Error).name,
        (e as Error).message,
      );
    }
  }

  return {
    success: true,
    error: false,
    message: "Successfully Subscribed!",
    pending: false,
  };
}
