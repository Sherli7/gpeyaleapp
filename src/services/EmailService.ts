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
    return `
Bonjour ${candidature.firstName} ${candidature.lastName},

Nous accusons bonne réception de votre candidature pour le programme de formation.

Voici un récapitulatif de vos informations :

- Poste actuel : ${candidature.currentPosition}
- Institution : ${candidature.institution}
- Domaine : ${candidature.field}

Nous examinerons votre dossier avec attention et reviendrons vers vous dans les plus brefs délais.

Cordialement,
L'équipe de formation
    `;
  }

  private generateHtmlEmail(candidature: Candidature): string {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmation de réception de votre candidature</title>
      </head>
      <body>
        <p>Bonjour ${candidature.firstName} ${candidature.lastName},</p>
        
        <p>Nous accusons bonne réception de votre candidature pour le programme de formation.</p>
        
        <h3>Récapitulatif de votre candidature :</h3>
        <ul>
          <li><strong>Poste actuel :</strong> ${candidature.currentPosition}</li>
          <li><strong>Institution :</strong> ${candidature.institution}</li>
          <li><strong>Domaine :</strong> ${candidature.field}</li>
        </ul>
        
        <p>Nous examinerons votre dossier avec attention et reviendrons vers vous dans les plus brefs délais.</p>
        
        <p>Cordialement,<br>L'équipe de formation</p>
        
        <hr>
        <p style="font-size: 0.8em; color: #666;">
          Ceci est un email automatique, merci de ne pas y répondre.
          Conformément à la réglementation sur la protection des données, vous disposez d'un droit d'accès, 
          de rectification et d'effacement de vos données.
        </p>
      </body>
    </html>
    `;
  }
}
