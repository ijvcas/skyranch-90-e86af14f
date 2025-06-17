
export function createMimeMessage(
  to: string, 
  subject: string, 
  html: string, 
  senderName: string, 
  organizationName: string
): string {
  const boundary = "boundary_" + Math.random().toString(36).substring(2);
  const fromEmail = "soporte@skyranch.es";
  const fromName = senderName || "SkyRanch Soporte";
  
  const message = [
    `To: ${to}`,
    `From: ${fromName} <${fromEmail}>`,
    `Reply-To: soporte@skyranch.es`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    `X-Mailer: SkyRanch Sistema de Gestión Ganadera`,
    `X-Organization: ${organizationName || 'SkyRanch'}`,
    `X-Priority: 3`,
    `X-MSMail-Priority: Normal`,
    `Message-ID: <${Date.now()}.${Math.random().toString(36).substring(2)}@skyranch.es>`,
    `Date: ${new Date().toUTCString()}`,
    '',
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    '',
    html,
    '',
    `--${boundary}--`
  ].join('\r\n');
  
  // Convert to base64url for Gmail API
  const base64Message = btoa(unescape(encodeURIComponent(message)));
  return base64Message.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
