const nodemailer = require("nodemailer");

// ✅ Lazy transporter — created on first use, NOT at module load
let _transporter = null;

const getTransporter = () => {
  if (!_transporter) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error(
        `Email credentials missing in env. EMAIL_USER=${
          process.env.EMAIL_USER ? "SET" : "NOT SET"
        }, EMAIL_PASS=${process.env.EMAIL_PASS ? "SET" : "NOT SET"}`
      );
    }

    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // ✅ Explicit timeouts so failures don't hang forever
      connectionTimeout: 10000, // 10s
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    console.log("✅ Email transporter initialized with:", process.env.EMAIL_USER);
  }
  return _transporter;
};

/**
 * Send an approval email to a student
 */
const sendApprovalEmail = async (student) => {
  if (!student?.email) throw new Error("Student email is missing");

  const mailOptions = {
    from: `"Campus Gate Pass System" <${process.env.EMAIL_USER}>`,
    to: student.email,
    subject: "Your Account Has Been Approved",
    html: `
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
  };

  return getTransporter().sendMail(mailOptions);
};

/**
 * Send a rejection email to a student
 */
const sendRejectionEmail = async (student) => {
  if (!student?.email) throw new Error("Student email is missing");

  const mailOptions = {
    from: `"Campus Gate Pass System" <${process.env.EMAIL_USER}>`,
    to: student.email,
    subject: "Your Registration Has Been Rejected",
    html: `
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
  };

  return getTransporter().sendMail(mailOptions);
};

module.exports = {
  sendApprovalEmail,
  sendRejectionEmail,
};