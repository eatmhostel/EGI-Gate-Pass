// ✅ Direct Brevo HTTP API — no SDK, no version issues
const fetch = require("node-fetch").default;
const API_BASE = "https://api.brevo.com/v3";

let _initialized = false;

const initCheck = () => {
  if (!_initialized) {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY missing in env");
    }
    if (!process.env.BREVO_FROM_EMAIL) {
      throw new Error("BREVO_FROM_EMAIL missing in env");
    }
    console.log("✅ Brevo email client initialized");
    _initialized = true;
  }
};

/**
 * Internal: call Brevo's send email endpoint
 */
const sendBrevoEmail = async ({ to, toName, subject, htmlContent }) => {
  initCheck();

  const response = await fetch(`${API_BASE}/smtp/email`, {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_FROM_EMAIL,
        name: process.env.BREVO_FROM_NAME || "Campus Gate Pass System",
      },
      to: [{ email: to, name: toName }],
      subject,
      htmlContent,
    }),
  });

  // Read the response body once
  const data = await response.json();

  if (!response.ok) {
    const errMsg =
      data?.message || data?.error || `Brevo API error: HTTP ${response.status}`;
    const error = new Error(errMsg);
    error.response = data;
    error.status = response.status;
    throw error;
  }

  return { messageId: data?.messageId };
};

/**
 * Send an approval email to a student
 */
const sendApprovalEmail = async (student) => {
  if (!student?.email) throw new Error("Student email is missing");

  return sendBrevoEmail({
    to: student.email,
    toName: student.fullName,
    subject: "Your Account Has Been Approved",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #16a34a;">Account Approved!</h2>
        <p>Dear <strong>${student.fullName}</strong>,</p>
        <p>Your registration has been approved by the administrator. You can now log in to the Campus Gate Pass System using your registered credentials.</p>

        <div style="background: #f5f7fa; padding: 14px; border-radius: 6px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Registration No:</strong> ${student.regNo}</p>
          <p style="margin: 4px 0;"><strong>Email:</strong> ${student.email}</p>
          <p style="margin: 4px 0;"><strong>Course:</strong> ${student.course || "—"}</p>
          <p style="margin: 4px 0;"><strong>Branch:</strong> ${student.branch || "—"}</p>
        </div>

        <p>Please use the email and password you set during registration to log in to the mobile app.</p>

        <p style="margin-top: 24px;">Regards,<br/><strong>Campus Gate Pass Admin Team</strong></p>
      </div>
    `,
  });
};

/**
 * Send a rejection email to a student
 */
const sendRejectionEmail = async (student) => {
  if (!student?.email) throw new Error("Student email is missing");

  return sendBrevoEmail({
    to: student.email,
    toName: student.fullName,
    subject: "Your Registration Has Been Rejected",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #dc2626;">Registration Rejected</h2>
        <p>Dear <strong>${student.fullName}</strong>,</p>
        <p>We regret to inform you that your registration for the Campus Gate Pass System has been rejected by the administrator.</p>

        <div style="background: #f5f7fa; padding: 14px; border-radius: 6px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Registration No:</strong> ${student.regNo}</p>
          <p style="margin: 4px 0;"><strong>Email:</strong> ${student.email}</p>
        </div>

        <p>If you believe this is an error or you would like to appeal, please contact the administration office for further assistance.</p>

        <p style="margin-top: 24px;">Regards,<br/><strong>Campus Gate Pass Admin Team</strong></p>
      </div>
    `,
  });
};

module.exports = {
  sendApprovalEmail,
  sendRejectionEmail,
};