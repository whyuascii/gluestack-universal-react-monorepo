/**
 * Server-side i18n loader for email templates
 *
 * Embeds translations directly since React Email templates
 * run on the server without access to i18next context.
 */

type SupportedLocale = "en" | "es";

interface EmailTranslations {
  verifyEmail: {
    subject: string;
    greeting: string;
    body: string;
    cta: string;
    expiry: string;
    ignore: string;
  };
  resetPassword: {
    subject: string;
    greeting: string;
    body: string;
    cta: string;
    expiry: string;
    ignore: string;
  };
  welcome: {
    subject: string;
    greeting: string;
    body: string;
    cta: string;
    support: string;
  };
  inviteToGroup: {
    subject: string;
    greeting: string;
    body: string;
    cta: string;
    expiry: string;
    ignore: string;
  };
  waitlist: {
    subject: string;
    title: string;
    greeting: string;
    body1: string;
    body2: string;
    body3: string;
    unsubscribe: string;
  };
  common: {
    footer: string;
    unsubscribe: string;
    sentBy: string;
  };
}

// Embedded translations (synced from @app/i18n/locales/*/emails.json)
const enEmails: EmailTranslations = {
  verifyEmail: {
    subject: "Verify your email address",
    greeting: "Hi {{name}},",
    body: "Please verify your email address by clicking the button below.",
    cta: "Verify Email",
    expiry: "This link will expire in 24 hours.",
    ignore: "If you didn't create an account, you can safely ignore this email.",
  },
  resetPassword: {
    subject: "Reset your password",
    greeting: "Hi {{name}},",
    body: "We received a request to reset your password. Click the button below to create a new password.",
    cta: "Reset Password",
    expiry: "This link will expire in {{expiresIn}}.",
    ignore: "If you didn't request a password reset, you can safely ignore this email.",
  },
  welcome: {
    subject: "Welcome to {{appName}}!",
    greeting: "Welcome, {{name}}!",
    body: "Thank you for joining {{appName}}. We're excited to have you on board.",
    cta: "Get Started",
    support: "If you have any questions, feel free to reach out to our support team.",
  },
  inviteToGroup: {
    subject: "You've been invited to join {{groupName}}",
    greeting: "Hi,",
    body: "{{inviterName}} has invited you to join {{groupName}} on {{appName}}.",
    cta: "Accept Invitation",
    expiry: "This invitation will expire in {{expiresIn}}.",
    ignore: "If you don't want to join, you can safely ignore this email.",
  },
  waitlist: {
    subject: "You're on the waitlist for {{appName}}!",
    title: "You're on the list!",
    greeting: "Hi {{name}},",
    body1:
      "Thanks for joining our waitlist! We're building something special and can't wait to share it with you.",
    body2:
      "We'll keep you updated on our progress and let you know as soon as we're ready for you to try.",
    body3: "In the meantime, feel free to reply to this email with any questions or feedback!",
    unsubscribe: "Unsubscribe from waitlist updates",
  },
  common: {
    footer: "{{year}} {{appName}}. All rights reserved.",
    unsubscribe: "Unsubscribe from these emails",
    sentBy: "This email was sent by {{appName}}",
  },
};

const esEmails: EmailTranslations = {
  verifyEmail: {
    subject: "Verifica tu dirección de correo electrónico",
    greeting: "Hola {{name}},",
    body: "Por favor verifica tu dirección de correo electrónico haciendo clic en el botón de abajo.",
    cta: "Verificar correo",
    expiry: "Este enlace expirará en 24 horas.",
    ignore: "Si no creaste una cuenta, puedes ignorar este correo.",
  },
  resetPassword: {
    subject: "Restablecer tu contraseña",
    greeting: "Hola {{name}},",
    body: "Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva contraseña.",
    cta: "Restablecer contraseña",
    expiry: "Este enlace expirará en {{expiresIn}}.",
    ignore: "Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.",
  },
  welcome: {
    subject: "¡Bienvenido a {{appName}}!",
    greeting: "¡Bienvenido, {{name}}!",
    body: "Gracias por unirte a {{appName}}. Estamos emocionados de tenerte con nosotros.",
    cta: "Comenzar",
    support: "Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.",
  },
  inviteToGroup: {
    subject: "Has sido invitado a unirte a {{groupName}}",
    greeting: "Hola,",
    body: "{{inviterName}} te ha invitado a unirte a {{groupName}} en {{appName}}.",
    cta: "Aceptar invitación",
    expiry: "Esta invitación expirará en {{expiresIn}}.",
    ignore: "Si no deseas unirte, puedes ignorar este correo.",
  },
  waitlist: {
    subject: "¡Estás en la lista de espera de {{appName}}!",
    title: "¡Estás en la lista!",
    greeting: "Hola {{name}},",
    body1:
      "¡Gracias por unirte a nuestra lista de espera! Estamos construyendo algo especial y no podemos esperar para compartirlo contigo.",
    body2:
      "Te mantendremos informado sobre nuestro progreso y te avisaremos tan pronto como estemos listos para que lo pruebes.",
    body3:
      "Mientras tanto, ¡no dudes en responder a este correo con cualquier pregunta o comentario!",
    unsubscribe: "Cancelar suscripción a actualizaciones de lista de espera",
  },
  common: {
    footer: "{{year}} {{appName}}. Todos los derechos reservados.",
    unsubscribe: "Cancelar suscripción a estos correos",
    sentBy: "Este correo fue enviado por {{appName}}",
  },
};

const translations: Record<SupportedLocale, EmailTranslations> = {
  en: enEmails,
  es: esEmails,
};

/**
 * Get email translations for a specific locale
 */
export function getEmailTranslations(locale: string = "en"): EmailTranslations {
  const normalizedLocale = locale.toLowerCase().split("-")[0] as SupportedLocale;
  return translations[normalizedLocale] || translations.en;
}

/**
 * Get a specific translation with interpolation support
 */
export function t(locale: string, key: string, params?: Record<string, string | number>): string {
  const translations = getEmailTranslations(locale);
  const keys = key.split(".");
  let value: any = translations;

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      console.warn(`[Mailer i18n] Missing translation: ${key} for locale: ${locale}`);
      return key;
    }
  }

  if (typeof value !== "string") {
    console.warn(`[Mailer i18n] Translation is not a string: ${key}`);
    return key;
  }

  // Handle interpolation {{variable}}
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => {
      return String(params[paramKey] ?? `{{${paramKey}}}`);
    });
  }

  return value;
}

export type { SupportedLocale };
