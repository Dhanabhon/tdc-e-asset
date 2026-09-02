import { Resend } from "resend";

export const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
};

export function getMagicLinkEmailHtml({
  email,
  magicLink,
}: {
  email: string;
  magicLink: string;
}) {
  const currentThaiYear = new Date().getFullYear() + 543;

  return `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>เข้าสู่ระบบ TDC e-Asset</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #faf9f5;
      margin: 0;
      padding: 40px 16px;
      color: #211f1c;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e3ddcd;
      border-radius: 16px;
      padding: 36px 32px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
    }
    .brand {
      display: flex;
      align-items: center;
      margin-bottom: 28px;
    }
    .brand-badge {
      display: inline-block;
      width: 38px;
      height: 38px;
      line-height: 38px;
      text-align: center;
      background-color: #c2593c;
      color: #ffffff;
      font-size: 18px;
      font-weight: bold;
      border-radius: 10px;
      margin-right: 12px;
    }
    .brand-text {
      display: inline-block;
      vertical-align: middle;
    }
    .brand-title {
      font-size: 16px;
      font-weight: 700;
      color: #211f1c;
      margin: 0;
      line-height: 1.2;
    }
    .brand-subtitle {
      font-size: 11px;
      color: #8b8271;
      margin: 2px 0 0 0;
    }
    .headline {
      font-size: 22px;
      font-weight: 700;
      color: #211f1c;
      margin-top: 0;
      margin-bottom: 12px;
      line-height: 1.3;
    }
    .description {
      font-size: 14px;
      color: #524d44;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      background-color: #c2593c;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      box-shadow: 0 2px 6px rgba(194, 89, 60, 0.25);
    }
    .fallback-box {
      background-color: #faf9f5;
      border: 1px dashed #ddd6c6;
      border-radius: 10px;
      padding: 14px;
      margin-top: 24px;
      font-size: 12px;
      color: #71695e;
      line-height: 1.5;
    }
    .fallback-link {
      color: #c2593c;
      word-break: break-all;
      text-decoration: underline;
    }
    .footer {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #f0eee6;
      font-size: 11px;
      color: #8b8271;
      line-height: 1.5;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">
      <div class="brand-badge">e</div>
      <div class="brand-text">
        <h2 class="brand-title">TDC E-Asset</h2>
        <p class="brand-subtitle">กองเทคโนโลยีสารสนเทศ</p>
      </div>
    </div>

    <h1 class="headline">เข้าสู่ระบบ TDC e-Asset</h1>
    <p class="description">
      มีการร้องขอลิงก์เข้าสู่ระบบสำหรับบัญชี <strong>${email}</strong><br>
      กรุณากดปุ่มด้านล่างเพื่อเข้าสู่ระบบงานครุภัณฑ์ (ลิงก์มีอายุ 1 ชั่วโมง):
    </p>

    <div class="btn-container">
      <a href="${magicLink}" class="btn" target="_blank">
        เข้าสู่ระบบ TDC e-Asset
      </a>
    </div>

    <div class="fallback-box">
      หากปุ่มด้านบนกดไม่ทำงาน สามารถคัดลอกลิงก์ด้านล่างไปเปิดในเบราว์เซอร์ได้โดยตรง:<br>
      <a href="${magicLink}" class="fallback-link">${magicLink}</a>
    </div>

    <div class="footer">
      หากคุณไม่ได้เป็นผู้ร้องขอเข้าสู่ระบบ กรุณาละเว้นอีเมลฉบับนี้<br>
      © ${currentThaiYear} กองเทคโนโลยีสารสนเทศ · ระบบบริหารจัดการครุภัณฑ์ดิจิทัล
    </div>
  </div>
</body>
</html>
  `.trim();
}

export async function sendMagicLinkViaResend({
  to,
  magicLink,
}: {
  to: string;
  magicLink: string;
}): Promise<{ success: boolean; error?: string }> {
  const resend = getResendClient();
  if (!resend) {
    return { success: false, error: "RESEND_API_KEY is not configured" };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "TDC e-Asset <onboarding@resend.dev>";

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: "ลิงก์เข้าสู่ระบบ TDC e-Asset (กองเทคโนโลยีสารสนเทศ)",
      html: getMagicLinkEmailHtml({ email: to, magicLink }),
    });

    if (error) {
      console.error("Resend send email error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("Resend exception:", err);
    const msg = err instanceof Error ? err.message : "Failed to send email via Resend";
    return { success: false, error: msg };
  }
}
