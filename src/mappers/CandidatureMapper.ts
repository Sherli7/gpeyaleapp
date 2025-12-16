import { Candidature } from "../entities/Candidature";

type FRPayload = Record<string, any>;

export function mapFrenchToCandidature(payload: FRPayload): Candidature {
    const c = new Candidature();

    c.firstName = payload.prenom ?? '';
    c.lastName = payload.nom ?? '';
    c.nationality = payload.nationalite ?? '';
    c.gender = payload.sexe ?? '';
    // Normalize date to ISO 8601 format (YYYY-MM-DD)
    // Support both snake_case (date_naissance) and camelCase (dateNaissance)
    const dateValue = payload.dateNaissance ?? payload.date_naissance;
    if (dateValue) {
        const d = new Date(dateValue);
        if (!isNaN(d.getTime())) {
            c.dateOfBirth = d.toISOString().split('T')[0];
        } else {
            c.dateOfBirth = String(dateValue);
        }
    } else {
        c.dateOfBirth = '';
    }
    c.placeOfBirth = payload.lieuNaissance ?? payload.lieu_naissance ?? '';
    c.phoneNumber = payload.telephone ?? '';
    c.email = payload.email ?? '';

    c.organization = payload.organisation ?? '';
    c.country = payload.pays ?? '';
    c.department = payload.departement ?? '';
    c.currentPosition = payload.posteActuel ?? payload.poste_actuel ?? '';
    c.taskDescription = payload.descriptionTaches ?? payload.description_taches ?? '';

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

    c.expectedResults = payload.resultatsAttendus ?? payload.resultats_attendus ?? '';
    c.otherInformation = payload.autresInfos ?? payload.autres_infos ?? '';

    // fundingSource is a text[] in entity; accept single string or array
    // Support both 'mode' and 'mode_financement'
    const fundingValue = payload.mode ?? payload.mode_financement;
    if (Array.isArray(fundingValue)) {
        c.fundingSource = fundingValue;
    } else if (fundingValue) {
        c.fundingSource = [String(fundingValue)];
    } else {
        c.fundingSource = [];
    }

    c.institutionName = payload.institutionFinancement ?? payload.institution_financement ?? '';
    c.contactPerson = payload.contactFinancement ?? payload.contact_financement ?? '';
    c.contactEmail = payload.emailContactFinancement ?? payload.email_contact_financement ?? null;

    c.informationSource = payload.source ?? payload.source_information ?? '';
    c.consent = Boolean(payload.consentement ?? payload.consent ?? false);

    // submissionDate will be set by CreateDateColumn on save; keep current Date for in-memory object
    c.submissionDate = new Date();

    return c;
}