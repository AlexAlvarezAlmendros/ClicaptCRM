// LeadFlow CRM — Services — Email (Nodemailer + Gmail)
// Owned by Agente 3 — Integration Engineer

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const FROM = `"LeadFlow CRM" <${process.env.GMAIL_USER}>`;

export async function sendWelcomeEmail(to, userName) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: "🎉 Bienvenido a LeadFlow CRM",
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1E293B;">¡Hola, ${userName}!</h1>
        <p style="color: #475569; font-size: 16px;">
          Tu cuenta en <strong>LeadFlow CRM</strong> está lista.
          Tienes <strong>30 días de prueba gratuita</strong> con acceso a todas las funcionalidades.
        </p>
        <a href="${process.env.APP_URL}/dashboard"
           style="display: inline-block; background: #3B82F6; color: white;
                  padding: 12px 24px; border-radius: 8px; text-decoration: none;
                  font-weight: 600; margin-top: 16px;">
          Empezar ahora →
        </a>
        <p style="color: #94A3B8; font-size: 14px; margin-top: 32px;">
          ¿Dudas? Responde a este email y te ayudamos.
        </p>
      </div>
    `,
  });
}

export async function sendTrialWarningEmail(to, userName, daysLeft) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `⏰ Tu prueba gratuita termina en ${daysLeft} días`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1E293B;">Hola, ${userName}</h1>
        <p style="color: #475569; font-size: 16px;">
          Tu periodo de prueba en LeadFlow CRM finaliza en <strong>${daysLeft} días</strong>.
        </p>
        <p style="color: #475569; font-size: 16px;">
          Suscríbete para no perder acceso a tus datos y seguir gestionando tus oportunidades.
        </p>
        <a href="${process.env.APP_URL}/configuracion/suscripcion"
           style="display: inline-block; background: #3B82F6; color: white;
                  padding: 12px 24px; border-radius: 8px; text-decoration: none;
                  font-weight: 600; margin-top: 16px;">
          Ver planes de suscripción →
        </a>
      </div>
    `,
  });
}

export async function sendTaskReminderEmail(to, userName, tasks) {
  const taskListHtml = tasks
    .map((t) => `<li style="margin-bottom: 8px;">${t.title} — vence: ${t.due_date}</li>`)
    .join("");

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `📋 Tienes ${tasks.length} tarea(s) pendiente(s) hoy`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1E293B;">Hola, ${userName}</h1>
        <p style="color: #475569; font-size: 16px;">Estas son tus tareas para hoy:</p>
        <ul style="color: #334155; font-size: 15px;">${taskListHtml}</ul>
        <a href="${process.env.APP_URL}/tareas"
           style="display: inline-block; background: #3B82F6; color: white;
                  padding: 12px 24px; border-radius: 8px; text-decoration: none;
                  font-weight: 600; margin-top: 16px;">
          Ver mis tareas →
        </a>
      </div>
    `,
  });
}
