import nodemailer from 'nodemailer';
import { Candidature } from '../entities/Candidature';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendConfirmationEmail(candidature: Candidature) {
    // Vérification de l'adresse email du destinataire
    if (!candidature.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidature.email)) {
      console.error('Impossible d\'envoyer l\'email : adresse email du destinataire invalide ou manquante');
      throw new Error('Adresse email du destinataire invalide ou manquante');
    }

    // Vérification de la configuration de l'expéditeur
    if (!process.env.EMAIL_FROM) {
      console.error('Configuration manquante : EMAIL_FROM n\'est pas défini dans les variables d\'environnement');
      throw new Error('Configuration du service email incomplète');
    }

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'No Reply'}" <${process.env.EMAIL_FROM}>`,
      to: candidature.email,
      subject: 'Confirmation de réception de votre candidature',
      text: this.generatePlainTextEmail(candidature),
      html: this.generateHtmlEmail(candidature),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email de confirmation envoyé à ${candidature.email}`, { messageId: info.messageId });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors de l\'envoi de l\'email de confirmation :', {
        error: errorMessage,
        to: candidature.email,
        subject: mailOptions.subject
      });
      throw new Error(`Échec de l'envoi de l'email de confirmation : ${errorMessage}`);
    }
  }

  private generatePlainTextEmail(candidature: Candidature): string {
    const languagesText = candidature.languages?.join(', ') || 'Non spécifiée';
    const languageLevelsText = candidature.languageLevels
      ? Object.entries(candidature.languageLevels)
          .map(([lang, level]) => `${lang}: ${level}`)
          .join(', ')
      : 'Non spécifiée';
    const fundingSourceText = candidature.fundingSource?.join(', ') || 'Non spécifiée';

    return `
Bonjour ${candidature.firstName} ${candidature.lastName},

Nous accusons bonne réception de votre candidature pour le programme de formation.

========== RÉCAPITULATIF DE VOTRE CANDIDATURE ==========

INFORMATIONS GÉNÉRALES :
- Nom complet : ${candidature.firstName} ${candidature.lastName}
- Email : ${candidature.email}
- Téléphone : ${candidature.phoneNumber}
- Nationalité : ${candidature.nationality}
- Lieu de naissance : ${candidature.placeOfBirth}
- Pays : ${candidature.country}

INFORMATIONS PROFESSIONNELLES :
- Poste actuel : ${candidature.currentPosition}
- Département : ${candidature.department || 'Non spécifié'}
- Organisation : ${candidature.organization || 'Non spécifiée'}
- Description des tâches : ${candidature.taskDescription}

FORMATION & LANGUES :
- Diplôme : ${candidature.diploma}
- Institution : ${candidature.institution}
- Domaine : ${candidature.field}
- Langues : ${languagesText}
- Niveaux : ${languageLevelsText}

ATTENTES & FINANCEMENT :
- Résultats attendus : ${candidature.expectedResults}
- Informations supplémentaires : ${candidature.otherInformation || 'Aucune'}
- Mode de financement : ${fundingSourceText}
- Institution de financement : ${candidature.institutionName || 'Non spécifiée'}
- Contact financement : ${candidature.contactPerson || 'Non spécifié'}
- Email contact financement : ${candidature.contactEmail || 'Non spécifié'}
- Source d'information : ${candidature.informationSource}

========================================================

Nous examinerons votre dossier avec attention et reviendrons vers vous dans les plus brefs délais.

Cordialement,
L'équipe de formation
    `;
  }

  private generateHtmlEmail(candidature: Candidature): string {
    const languagesText = candidature.languages?.join(', ') || 'Non spécifiée';
    const languageLevelsText = candidature.languageLevels
      ? Object.entries(candidature.languageLevels)
          .map(([lang, level]) => `<strong>${lang}:</strong> ${level}`)
          .join('<br/>')
      : 'Non spécifiée';
    const fundingSourceText = candidature.fundingSource?.join(', ') || 'Non spécifiée';

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmation de réception de votre candidature</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2c3e50; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .section { border: 1px solid #ddd; margin: 15px 0; border-radius: 5px; overflow: hidden; }
          .section-title { background-color: #34495e; color: white; padding: 12px; font-weight: bold; }
          .section-content { padding: 15px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .label { font-weight: bold; color: #2c3e50; }
          .value { color: #555; }
          .footer { font-size: 0.85em; color: #999; border-top: 1px solid #ddd; margin-top: 20px; padding-top: 15px; text-align: center; }
          hr { border: none; border-top: 2px solid #ddd; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Candidature Reçue</h1>
            <p>Confirmation de réception de votre candidature</p>
          </div>

          <p style="margin-top: 20px;">Bonjour <strong>${candidature.firstName} ${candidature.lastName}</strong>,</p>
          
          <p>Nous vous remercions de votre candidature au programme de formation. Votre dossier a bien été reçu et enregistré dans notre système.</p>

          <!-- INFORMATIONS GÉNÉRALES -->
          <div class="section">
            <div class="section-title">📋 Informations Générales</div>
            <div class="section-content">
              <div class="row">
                <span class="label">Email :</span>
                <span class="value">${candidature.email}</span>
              </div>
              <div class="row">
                <span class="label">Téléphone :</span>
                <span class="value">${candidature.phoneNumber}</span>
              </div>
              <div class="row">
                <span class="label">Nationalité :</span>
                <span class="value">${candidature.nationality}</span>
              </div>
              <div class="row">
                <span class="label">Lieu de naissance :</span>
                <span class="value">${candidature.placeOfBirth}</span>
              </div>
              <div class="row">
                <span class="label">Pays :</span>
                <span class="value">${candidature.country}</span>
              </div>
            </div>
          </div>

          <!-- INFORMATIONS PROFESSIONNELLES -->
          <div class="section">
            <div class="section-title">💼 Informations Professionnelles</div>
            <div class="section-content">
              <div class="row">
                <span class="label">Poste actuel :</span>
                <span class="value">${candidature.currentPosition}</span>
              </div>
              <div class="row">
                <span class="label">Département :</span>
                <span class="value">${candidature.department || 'Non spécifié'}</span>
              </div>
              <div class="row">
                <span class="label">Organisation :</span>
                <span class="value">${candidature.organization || 'Non spécifiée'}</span>
              </div>
              <div style="margin-top: 10px;">
                <span class="label">Description des tâches :</span>
                <p style="margin: 5px 0; color: #555;">${candidature.taskDescription}</p>
              </div>
            </div>
          </div>

          <!-- FORMATION & LANGUES -->
          <div class="section">
            <div class="section-title">🎓 Formation & Langues</div>
            <div class="section-content">
              <div class="row">
                <span class="label">Diplôme :</span>
                <span class="value">${candidature.diploma}</span>
              </div>
              <div class="row">
                <span class="label">Institution :</span>
                <span class="value">${candidature.institution}</span>
              </div>
              <div class="row">
                <span class="label">Domaine :</span>
                <span class="value">${candidature.field}</span>
              </div>
              <div class="row">
                <span class="label">Langues :</span>
                <span class="value">${languagesText}</span>
              </div>
              <div style="margin-top: 10px;">
                <span class="label">Niveaux de langue :</span>
                <p style="margin: 5px 0; color: #555;">${languageLevelsText}</p>
              </div>
            </div>
          </div>

          <!-- ATTENTES & FINANCEMENT -->
          <div class="section">
            <div class="section-title">💰 Attentes & Financement</div>
            <div class="section-content">
              <div style="margin-bottom: 10px;">
                <span class="label">Résultats attendus :</span>
                <p style="margin: 5px 0; color: #555;">${candidature.expectedResults}</p>
              </div>
              <div style="margin-bottom: 10px;">
                <span class="label">Informations supplémentaires :</span>
                <p style="margin: 5px 0; color: #555;">${candidature.otherInformation || 'Aucune'}</p>
              </div>
              <div class="row">
                <span class="label">Mode de financement :</span>
                <span class="value">${fundingSourceText}</span>
              </div>
              <div class="row">
                <span class="label">Institution financement :</span>
                <span class="value">${candidature.institutionName || 'Non spécifiée'}</span>
              </div>
              <div class="row">
                <span class="label">Contact financement :</span>
                <span class="value">${candidature.contactPerson || 'Non spécifié'}</span>
              </div>
              <div class="row">
                <span class="label">Email contact financement :</span>
                <span class="value">${candidature.contactEmail || 'Non spécifié'}</span>
              </div>
              <div class="row">
                <span class="label">Source d'information :</span>
                <span class="value">${candidature.informationSource}</span>
              </div>
            </div>
          </div>

          <hr>

          <p style="margin-top: 20px;">Nous examinerons votre dossier avec attention et reviendrons vers vous dans les plus brefs délais pour vous communiquer notre décision.</p>
          
          <p><strong>Cordialement,</strong><br>L'équipe de formation</p>

          <div class="footer">
            <p>Ceci est un email automatique. Merci de ne pas y répondre directement.</p>
            <p>Conformément à la réglementation RGPD sur la protection des données personnelles, vous disposez d'un droit d'accès, de rectification et d'effacement de vos données.</p>
            <p style="font-size: 0.8em; color: #bbb;">Candidature soumise le : ${candidature.submissionDate?.toLocaleDateString('fr-FR') || 'N/A'}</p>
          </div>
        </div>
      </body>
    </html>
    `;
  }
}
