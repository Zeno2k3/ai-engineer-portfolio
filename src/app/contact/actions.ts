"use server";

// Xử lý form liên hệ phía server (spec §4.4): kiểm tra dữ liệu + lọc spam, gửi email qua Resend.
// Cần biến môi trường: RESEND_API_KEY, CONTACT_TO_EMAIL (và tuỳ chọn CONTACT_FROM_EMAIL).

import { z } from "zod";

type Field = "name" | "email" | "message";

export type ContactState = {
  status: "idle" | "success" | "error";
  message: string;
  fields?: Record<Field, string>;
  errors?: Partial<Record<Field, string>>;
  /** true = lỗi phía server → hiện email dự phòng. */
  fallback?: boolean;
};

const schema = z.object({
  name: z.string().trim().min(1, "Nhập tên của bạn.").max(100, "Tên tối đa 100 ký tự."),
  email: z.email("Email chưa đúng định dạng."),
  message: z.string().trim().min(10, "Viết ít nhất 10 ký tự.").max(5000, "Tối đa 5000 ký tự."),
});

const SUCCESS = "Đã gửi! Mình sẽ trả lời qua email sớm nhất có thể.";
const MIN_FILL_MS = 3000;

export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const fields: Record<Field, string> = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? "").trim(),
    message: String(formData.get("message") ?? ""),
  };

  // Honeypot: ô ẩn người thật không thấy — bot điền vào thì giả vờ thành công.
  if (String(formData.get("company") ?? "")) return { status: "success", message: SUCCESS };

  // Bot thường gửi ngay lập tức, không có thời điểm bắt đầu nhập.
  const startedAt = Number(formData.get("startedAt"));
  if (!startedAt || Date.now() - startedAt < MIN_FILL_MS) {
    return { status: "error", message: "Gửi hơi nhanh — đợi vài giây rồi thử lại nhé.", fields };
  }

  const parsed = schema.safeParse(fields);
  if (!parsed.success) {
    const errors = z.flattenError(parsed.error).fieldErrors;
    return {
      status: "error",
      message: "Kiểm tra lại các ô được đánh dấu.",
      fields,
      errors: { name: errors.name?.[0], email: errors.email?.[0], message: errors.message?.[0] },
    };
  }

  if ((parsed.data.message.match(/https?:\/\//g) ?? []).length > 3) {
    return { status: "error", message: "Tin nhắn chứa quá nhiều link.", fields };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    return { status: "error", message: "Form liên hệ chưa được cấu hình trên server.", fields, fallback: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>",
      to: [to],
      reply_to: parsed.data.email,
      subject: `[Portfolio] Tin nhắn từ ${parsed.data.name}`,
      text: `${parsed.data.message}\n\n— ${parsed.data.name} <${parsed.data.email}>`,
    }),
  }).catch(() => null);

  if (!res?.ok) {
    return { status: "error", message: "Chưa gửi được do lỗi máy chủ.", fields, fallback: true };
  }
  return { status: "success", message: SUCCESS };
}
