
import { EmailRequestV2, EmailPayload } from './types.ts';
import { TagManager } from './tagManager.ts';

export class PayloadBuilder {
  static build(request: EmailRequestV2): EmailPayload {
    const recipientDomain = request.to.split('@')[1];
    
    // Use Resend's verified default domain
    const fromEmail = "onboarding@resend.dev";
    const fromName = request.senderName || "SkyRanch - Sistema de Gestión Ganadera";

    const finalTags = TagManager.prepareTags(request.metadata?.tags);

    return {
      from: `${fromName} <${fromEmail}>`,
      to: [request.to],
      subject: request.subject,
      html: request.html,
      headers: {
        'X-Entity-Ref-ID': 'skyranch-sistema-ganadero-v2',
        'Organization': request.organizationName || 'SkyRanch',
        'X-Mailer': 'SkyRanch Sistema de Gestión Ganadera v2',
        'X-Debug-Domain': recipientDomain,
        'X-Debug-Timestamp': new Date().toISOString(),
        ...(request.metadata?.headers || {})
      },
      tags: finalTags
    };
  }
}
