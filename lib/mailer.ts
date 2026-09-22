import nodemailer from "nodemailer";

/* ──────────────────────────────────────────────────────────────
   SMTP Mailer - Hostinger (no-reply@speui.org)
   Uses SSL/TLS on port 465.
   ────────────────────────────────────────────────────────────── */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: parseInt(process.env.SMTP_PORT || "465", 10),
  secure: true, // SSL/TLS on port 465
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  auth: {
    user: process.env.SMTP_USER || "no-reply@speui.org",
    pass: process.env.SMTP_PASS || "",
  },
});

const FROM_ADDRESS = `"SPE-UI" <${process.env.SMTP_USER || "no-reply@speui.org"}>`;

/**
 * Send an OTP verification email for election voting.
 */
export async function sendOtpEmail({
  to,
  voterName,
  otp,
  electionTitle,
}: {
  to: string;
  voterName: string;
  otp: string;
  electionTitle: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background:#ffffff; font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff; padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;">
          <tr>
            <td style="padding:0 0 24px;">
              <p style="margin:0; font-size:18px; font-weight:700; color:#111827;">SPE-UI Election</p>
              <p style="margin:4px 0 0; font-size:13px; color:#6B7280;">${electionTitle}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 16px;">
              <p style="margin:0; font-size:14px; color:#111827;">Hi ${voterName},</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 24px;">
              <p style="margin:0; font-size:14px; color:#374151; line-height:1.6;">
                Use the code below to verify your identity and access the voting booth. This code is valid for 10 minutes.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 0 24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#F3F4F6; border-radius:8px; padding:16px 32px; text-align:center;">
                    <span style="font-size:32px; font-weight:700; letter-spacing:8px; color:#111827; font-family:monospace;">${otp}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 24px;">
              <p style="margin:0; font-size:13px; color:#6B7280; line-height:1.5;">
                If you did not request this code, please ignore this email. Your vote is anonymous and no one can see who you voted for.
              </p>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #E5E7EB; padding:16px 0 0;">
              <p style="margin:0; font-size:12px; color:#9CA3AF;">
                Society of Petroleum Engineers, University of Ibadan Student Chapter
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  const text = [
    `SPE-UI Election: ${electionTitle}`,
    ``,
    `Hi ${voterName},`,
    ``,
    `Your verification code is: ${otp}`,
    ``,
    `This code is valid for 10 minutes. Enter it on the voting page to continue.`,
    ``,
    `If you did not request this code, please ignore this email.`,
    ``,
    `Society of Petroleum Engineers, University of Ibadan Student Chapter`,
  ].join("\n");

  await transporter.sendMail({
    from: FROM_ADDRESS,
    to,
    subject: `Your voting verification code: ${otp}`,
    text,
    html,
  });
}

/**
 * Generic email sender for other use cases.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  await transporter.sendMail({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
  });
}

/**
 * Send ticket invite email for the 3-day event.
 */
export async function sendTicketEmail({
  to,
  name,
  department,
  registrationId,
  accessCode,
  selectedDays,
}: {
  to: string;
  name: string;
  department: string;
  registrationId: string;
  accessCode: string;
  selectedDays: string;
}) {
  const shortId = registrationId.substring(0, 8).toUpperCase();
  const hasDay1 = selectedDays.includes("Day 1");
  const hasDay2 = selectedDays.includes("Day 2");
  const hasDay3 = selectedDays.includes("Day 3");
  const hasDay4 = selectedDays.includes("Day 4");
  const hasDay5 = selectedDays.includes("Day 5");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background:#f3f4f6; font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6; padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- TICKET CONTAINER TABLE -->
        <table width="480" cellpadding="0" cellspacing="0" style="border-collapse:collapse; background:transparent;">
          
          <!-- TOP CARD -->
          <tr>
            <td style="padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:24px 24px 0 0; border:1px solid #cbd5e1; border-bottom:none; border-collapse:collapse;">
                <!-- Header block -->
                <tr>
                  <td style="padding:28px 32px 20px; background:#0f172a; border-radius:22px 22px 0 0; text-align:center;">
                    <p style="margin:0; font-size:10px; font-weight:800; letter-spacing:3px; color:#38bdf8; text-transform:uppercase;">SPE UI Student Chapter</p>
                    <h2 style="margin:6px 0 0; font-size:20px; font-weight:900; color:#ffffff; letter-spacing:0.5px;">INDUSTRY WEEK 2026</h2>
                    <p style="margin:4px 0 0; font-size:10px; font-weight:700; color:#94a3b8; letter-spacing:1px; text-transform:uppercase;">Official Event Ticket Invite</p>
                  </td>
                </tr>

                <!-- Boarding Pass Transition Header -->
                <tr>
                  <td style="padding:28px 32px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="40%">
                          <p style="margin:0; font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">FROM</p>
                          <p style="margin:4px 0 0; font-size:20px; font-weight:900; color:#0f172a; line-height:1.2;">SPE UI</p>
                          <p style="margin:2px 0 0; font-size:11px; font-weight:700; color:#475569; white-space:nowrap;">Department of PE</p>
                        </td>
                        <td width="20%" align="center" style="vertical-align:middle;">
                          <div style="background:#f1f5f9; color:#475569; font-size:9px; font-weight:800; padding:6px 12px; border-radius:20px; text-transform:uppercase; letter-spacing:1px; display:inline-block; white-space:nowrap; border:1px solid #e2e8f0;">
                            5 DAYS
                          </div>
                        </td>
                        <td width="40%" align="right">
                          <p style="margin:0; font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">TO</p>
                          <p style="margin:4px 0 0; font-size:20px; font-weight:900; color:#0f172a; line-height:1.2;">PLLT ROOM</p>
                          <p style="margin:2px 0 0; font-size:11px; font-weight:700; color:#475569; white-space:nowrap;">University of Ibadan</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Grid Details block (2 rows of dynamic selected day highlight opacity to prevent smushing) -->
                <tr>
                  <td style="padding:0 32px 24px;">
                    <table width="100%" cellpadding="12" cellspacing="0" style="background:#f8fafc; border-radius:16px; border:1px solid #e2e8f0; border-collapse:collapse;">
                      <!-- Row 1: Day 1 - 3 -->
                      <tr style="border-bottom:1px solid #e2e8f0;">
                        <!-- Day 1 Column -->
                        <td width="33%" align="left" style="padding:12px; ${hasDay1 ? '' : 'opacity:0.35;'}">
                          <p style="margin:0; font-size:9px; font-weight:800; color:${hasDay1 ? '#94a3b8' : '#cbd5e1'}; text-transform:uppercase;">Day 1 (Sep 14)</p>
                          <p style="margin:4px 0 0; font-size:12px; font-weight:800; color:${hasDay1 ? '#0f172a' : '#cbd5e1'};">09:00 AM</p>
                        </td>
                        <!-- Day 2 Column -->
                        <td width="33%" align="left" style="border-left:1px solid #e2e8f0; padding:12px 12px 12px 16px; ${hasDay2 ? '' : 'opacity:0.35;'}">
                          <p style="margin:0; font-size:9px; font-weight:800; color:${hasDay2 ? '#94a3b8' : '#cbd5e1'}; text-transform:uppercase;">Day 2 (Sep 15)</p>
                          <p style="margin:4px 0 0; font-size:12px; font-weight:800; color:${hasDay2 ? '#0f172a' : '#cbd5e1'};">09:00 AM</p>
                        </td>
                        <!-- Day 3 Column -->
                        <td width="34%" align="left" style="border-left:1px solid #e2e8f0; padding:12px 12px 12px 16px; ${hasDay3 ? '' : 'opacity:0.35;'}">
                          <p style="margin:0; font-size:9px; font-weight:800; color:${hasDay3 ? '#94a3b8' : '#cbd5e1'}; text-transform:uppercase;">Day 3 (Sep 16)</p>
                          <p style="margin:4px 0 0; font-size:12px; font-weight:800; color:${hasDay3 ? '#0f172a' : '#cbd5e1'};">09:00 AM</p>
                        </td>
                      </tr>
                      <!-- Row 2: Day 4 - 5 -->
                      <tr>
                        <!-- Day 4 Column -->
                        <td width="33%" align="left" style="padding:12px; ${hasDay4 ? '' : 'opacity:0.35;'}">
                          <p style="margin:0; font-size:9px; font-weight:800; color:${hasDay4 ? '#94a3b8' : '#cbd5e1'}; text-transform:uppercase;">Day 4 (Sep 17)</p>
                          <p style="margin:4px 0 0; font-size:12px; font-weight:800; color:${hasDay4 ? '#0f172a' : '#cbd5e1'};">09:00 AM</p>
                        </td>
                        <!-- Day 5 Column -->
                        <td width="33%" align="left" style="border-left:1px solid #e2e8f0; padding:12px 12px 12px 16px; ${hasDay5 ? '' : 'opacity:0.35;'}">
                          <p style="margin:0; font-size:9px; font-weight:800; color:${hasDay5 ? '#94a3b8' : '#cbd5e1'}; text-transform:uppercase;">Day 5 (Sep 18)</p>
                          <p style="margin:4px 0 0; font-size:12px; font-weight:800; color:${hasDay5 ? '#0f172a' : '#cbd5e1'};">09:00 AM</p>
                        </td>
                        <!-- Spacer cell -->
                        <td width="34%" style="border-left:1px solid #e2e8f0; padding:12px;">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MIDDLE NOTCH & CONNECTION ROW -->
          <tr>
            <td style="padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:transparent; border-collapse:collapse; margin-top:-1px; margin-bottom:-1px;">
                <tr>
                  <!-- Left Notch -->
                  <td width="16" style="background:#f3f4f6; height:24px; border-radius:0 12px 12px 0; border:1px solid #cbd5e1; border-left:none;">&nbsp;</td>
                  <!-- Dashed Connection -->
                  <td style="background:#ffffff; height:24px; vertical-align:middle; padding:0 8px;">
                    <div style="border-top:2px dashed #cbd5e1; height:1px; line-height:1px; font-size:1px;">&nbsp;</div>
                  </td>
                  <!-- Right Notch -->
                  <td width="16" style="background:#f3f4f6; height:24px; border-radius:12px 0 0 12px; border:1px solid #cbd5e1; border-right:none;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BOTTOM CARD -->
          <tr>
            <td style="padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:0 0 24px 24px; border:1px solid #cbd5e1; border-top:none; border-collapse:collapse;">
                <!-- Passenger Details -->
                <tr>
                  <td style="padding:24px 32px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="55%" style="vertical-align:top;">
                          <p style="margin:0; font-size:9px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">PASSENGER / ATTENDEE</p>
                          <p style="margin:4px 0 0; font-size:15px; font-weight:800; color:#0f172a;">${name}</p>
                          <p style="margin:2px 0 0; font-size:11px; font-weight:700; color:#475569;">${to}</p>
                        </td>
                        <td width="45%" style="vertical-align:top; padding-left:16px;">
                          <p style="margin:0; font-size:9px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">DEPARTMENT</p>
                          <p style="margin:4px 0 0; font-size:14px; font-weight:800; color:#0f172a; text-transform:uppercase;">${department}</p>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top:20px;">
                          <p style="margin:0; font-size:9px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">ACCESS CODE</p>
                          <p style="margin:4px 0 0; font-size:16px; font-weight:900; color:#1e40af; font-family:monospace; letter-spacing:1.5px;">${accessCode}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = [
    `SPE UI STUDENT CHAPTER - INDUSTRY WEEK 2026`,
    `=========================================`,
    `5 DAY INVITE TICKET`,
    ``,
    `Attendee Name: ${name}`,
    `Email Address: ${to}`,
    `Department: ${department}`,
    `Access Code: ${accessCode}`,
    ``,
    `Access Details:`,
    `- Day 1 (Sept 14): ${hasDay1 ? "Registered" : "Not Registered"}`,
    `- Day 2 (Sept 15): ${hasDay2 ? "Registered" : "Not Registered"}`,
    `- Day 3 (Sept 16): ${hasDay3 ? "Registered" : "Not Registered"}`,
    `- Day 4 (Sept 17): ${hasDay4 ? "Registered" : "Not Registered"}`,
    `- Day 5 (Sept 18): ${hasDay5 ? "Registered" : "Not Registered"}`,
    ``,
    `Society of Petroleum Engineers, University of Ibadan Student Chapter`,
  ].join("\n");

  await transporter.sendMail({
    from: FROM_ADDRESS,
    to,
    subject: `Industry Week 2026 Event Ticket: ${name}`,
    text,
    html,
  });
}

/**
 * Send notification of registration details to ewansihapraise03@gmail.com.
 */
export async function sendAdminNotificationEmail({
  name,
  email,
  department,
  isSpeMember,
  isMembershipActive,
  whatsappNumber,
  accessCode,
  selectedDays,
}: {
  name: string;
  email: string;
  department: string;
  isSpeMember: boolean;
  isMembershipActive: boolean | null;
  whatsappNumber: string | null;
  accessCode: string;
  selectedDays: string;
}) {
  const membershipStatus = isSpeMember
    ? isMembershipActive
      ? "Active SPE Member"
      : "Inactive SPE Member"
    : "Guest (Waitlist)";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
</head>
<body style="margin:0; padding:24px; background:#f9fafb; font-family:Arial,sans-serif; color:#1f2937;">
  <div style="max-width:600px; margin:0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; padding:32px;">
    <h2 style="margin:0 0 16px; font-size:20px; font-weight:bold; color:#111827;">New Event Registration</h2>
    <p style="margin:0 0 24px; font-size:14px; color:#4b5563;">A new attendee has successfully registered for Industry Week '26.</p>
    
    <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse; font-size:14px;">
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td width="35%" style="font-weight:bold; color:#6b7280; padding:12px 0;">Attendee Name</td>
        <td style="color:#111827; padding:12px 0;">${name}</td>
      </tr>
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="font-weight:bold; color:#6b7280; padding:12px 0;">Email Address</td>
        <td style="color:#111827; padding:12px 0;">${email}</td>
      </tr>
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="font-weight:bold; color:#6b7280; padding:12px 0;">Department</td>
        <td style="color:#111827; padding:12px 0;">${department}</td>
      </tr>
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="font-weight:bold; color:#6b7280; padding:12px 0;">Membership</td>
        <td style="color:#111827; padding:12px 0;">${membershipStatus}</td>
      </tr>
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="font-weight:bold; color:#6b7280; padding:12px 0;">WhatsApp Number</td>
        <td style="color:#111827; padding:12px 0;">${whatsappNumber || "—"}</td>
      </tr>
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="font-weight:bold; color:#6b7280; padding:12px 0;">Access Code</td>
        <td style="font-weight:bold; color:#1e40af; padding:12px 0; font-family:monospace; letter-spacing:1px;">${accessCode}</td>
      </tr>
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="font-weight:bold; color:#6b7280; padding:12px 0;">Selected Days</td>
        <td style="color:#111827; padding:12px 0;">${selectedDays}</td>
      </tr>
    </table>
  </div>
</body>
</html>
  `.trim();

  const text = [
    `New Event Registration`,
    `Attendee Name: ${name}`,
    `Email Address: ${email}`,
    `Department: ${department}`,
    `Membership: ${membershipStatus}`,
    `WhatsApp Number: ${whatsappNumber || "—"}`,
    `Access Code: ${accessCode}`,
    `Selected Days: ${selectedDays}`,
  ].join("\n");

  await transporter.sendMail({
    from: FROM_ADDRESS,
    to: "ewansihapraise03@gmail.com",
    subject: `New Event Registration: ${name}`,
    text,
    html,
  });
}
