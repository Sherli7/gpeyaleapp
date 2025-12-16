import { Candidature } from "../entities/Candidature";

type FRPayload = Record<string, any>;

export function mapFrenchToCandidature(payload: FRPayload): Candidature {
    const c = new Candidature();

    c.firstName = payload.prenom ?? '';
    c.lastName = payload.nom ?? '';
    c.nationality = payload.nationalite ?? '';
    c.gender = payload.sexe ?? '';
    // Normalize date to ISO 8601 format (YYYY-MM-DD)
    if (payload.date_naissance) {
        const d = new Date(payload.date_naissance);
        if (!isNaN(d.getTime())) {
            c.dateOfBirth = d.toISOString().split('T')[0];
        } else {
            c.dateOfBirth = String(payload.date_naissance);
        }
    } else {
        c.dateOfBirth = '';
    }
    c.placeOfBirth = payload.lieu_naissance ?? '';
    c.phoneNumber = payload.telephone ?? '';
    c.email = payload.email ?? '';

    c.organization = payload.organisation ?? '';
    c.country = payload.pays ?? '';
    c.department = payload.departement ?? '';
    c.currentPosition = payload.poste_actuel ?? '';
    c.taskDescription = payload.description_taches ?? '';

    c.diploma = payload.diplome ?? '';
    c.institution = payload.institution ?? '';
    // 'domaine' in payload can be a comma-separated string or array
    if (Array.isArray(payload.domaine)) {
        c.field = payload.domaine.join(', ');
    } else {
        c.field = payload.domaine ?? '';
    }

    c.languages = Array.isArray(payload.langues) ? payload.langues : (payload.langues ? [payload.langues] : []);
    c.languageLevels = payload.niveaux && typeof payload.niveaux === 'object' ? payload.niveaux : {};

    c.expectedResults = payload.resultats_attendus ?? '';
    c.otherInformation = payload.autres_infos ?? '';

    // fundingSource is a text[] in entity; accept single string or array
    if (Array.isArray(payload.mode_financement)) {
        c.fundingSource = payload.mode_financement;
    } else if (payload.mode_financement) {
        c.fundingSource = [String(payload.mode_financement)];
    } else {
        c.fundingSource = [];
    }

    c.institutionName = payload.institution_financement ?? '';
    c.contactPerson = payload.contact_financement ?? '';
    c.contactEmail = payload.email_contact_financement ?? null;

    c.informationSource = payload.source_information ?? '';
    c.consent = Boolean(payload.consentement ?? payload.consent ?? false);

    // submissionDate will be set by CreateDateColumn on save; keep current Date for in-memory object
    c.submissionDate = new Date();

    return c;
}