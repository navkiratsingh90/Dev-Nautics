import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_FROM,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ─── Simple OTP email (existing) ─────────────────────────────────────
export const sendMail = async (to_person: string, currSubject: string) => {
  try {
    await transporter.sendMail({
      to: `"Fleeter" ${to_person}`,
      from: process.env.GMAIL_FROM,
      subject: `your 6 digit otp is ${currSubject}`,
    });
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500 });
  }
};

// ─── Pickup OTP email (existing) ────────────────────────────────────
export const sendPickupOtp = async (email: string, otp: string) => {
  await transporter.sendMail({
    from: process.env.GMAIL_FROM,
    to: email,
    subject: 'Your Ride Pickup OTP',
    html: `
      <div style="font-family:sans-serif">
        <h2>Ride Pickup Verification</h2>
        <p>Your pickup OTP is:</p>
        <h1 style="letter-spacing:8px; color:#16a34a;">${otp}</h1>
        <p>Share this OTP with your driver only after they arrive at your pickup location.</p>
        <p>OTP expires in 10 minutes.</p>
      </div>
    `,
  });
};

// ─── NEW: Send join request email ────────────────────────────────────
export const sendJoinRequestEmail = async (
  projectCreatorEmail: string,
  projectCreatorName: string,
  requesterName: string,
  requesterEmail: string,
  projectTitle: string,
  projectDescription: string,
  projectId: string
) => {
  const projectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/collaborations/${projectId}`;

  await transporter.sendMail({
    from: process.env.GMAIL_FROM,
    to: projectCreatorEmail,
    subject: `🔗 Join Request: "${projectTitle}"`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Join Request</h2>
        <p><strong>${requesterName}</strong> (${requesterEmail}) wants to join your project.</p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0;">${projectTitle}</h3>
          <p style="margin: 0; color: #475569;">${projectDescription}</p>
          <p style="margin-top: 8px;">
            <a href="${projectUrl}" style="color: #0ea472;">View project</a>
          </p>
        </div>
        <p>You can review this request by visiting the project page and manually adding the user to the team.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p style="font-size: 14px; color: #94a3b8;">This is an automated message from DevConnect.</p>
      </div>
    `,
  });
};