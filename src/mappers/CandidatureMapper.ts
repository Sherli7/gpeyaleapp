import { Candidature } from "../entities/Candidature";

type FRPayload = Record<string, any>;

export function mapFrenchToCandidature(payload: FRPayload): Candidature {
    const c = new Candidature();

    c.firstName = payload.firstName ?? payload.prenom ?? '';
    c.lastName = payload.lastName ?? payload.nom ?? '';
    c.nationality = payload.nationality ?? payload.nationalite ?? '';
    c.gender = payload.gender ?? payload.sexe ?? '';
    // Normalize date to ISO 8601 format (YYYY-MM-DD)
    // Support both snake_case (date_naissance) and camelCase (dateNaissance)
    const dateValue = payload.dateOfBirth ?? payload.dateNaissance ?? payload.date_naissance;
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
    c.placeOfBirth = payload.placeOfBirth ?? payload.lieuNaissance ?? payload.lieu_naissance ?? '';
    c.phoneNumber = payload.phoneNumber ?? payload.telephone ?? '';
    c.email = payload.email ?? payload.contactEmail ?? '';

    c.organization = payload.organization ?? payload.organisation ?? '';
    c.country = payload.country ?? payload.pays ?? '';
    c.department = payload.department ?? payload.departement ?? '';
    c.currentPosition = payload.currentPosition ?? payload.posteActuel ?? payload.poste_actuel ?? '';
    c.taskDescription = payload.taskDescription ?? payload.descriptionTaches ?? payload.description_taches ?? '';

    c.diploma = payload.diploma ?? payload.diplome ?? '';
    c.institution = payload.institution ?? payload.institutionEtudes ?? payload.institution_etudes ?? '';
    // 'domaine' in payload can be a comma-separated string or array
    const domainValue = payload.field ?? payload.domaine;
    c.field = Array.isArray(domainValue) ? domainValue.join(', ') : (domainValue ?? '');

    const languagesValue = payload.languages ?? payload.langues;
    c.languages = Array.isArray(languagesValue) ? languagesValue : (languagesValue ? [languagesValue] : []);

    const levelsValue = payload.languageLevels ?? payload.niveaux;
    c.languageLevels = levelsValue && typeof levelsValue === 'object' ? levelsValue : {};

    c.expectedResults = payload.expectedResults ?? payload.resultatsAttendus ?? payload.resultats_attendus ?? '';
    c.otherInformation = payload.otherInformation ?? payload.autresInfos ?? payload.autres_infos ?? '';

    // fundingSource is a text[] in entity; accept single string or array
    // Support both 'mode' and 'mode_financement'
    const fundingValue = payload.fundingSource ?? payload.mode ?? payload.mode_financement;
    if (Array.isArray(fundingValue)) {
        c.fundingSource = fundingValue;
    } else if (fundingValue) {
        c.fundingSource = [String(fundingValue)];
    } else {
        c.fundingSource = [];
    }

    c.institutionName = payload.institutionName ?? payload.institutionFinancement ?? payload.institution_financement ?? '';
    c.contactPerson = payload.contactPerson ?? payload.contactFinancement ?? payload.contact_financement ?? '';
    c.contactEmail = payload.contactEmail ?? payload.emailContactFinancement ?? payload.email_contact_financement ?? null;

    c.informationSource = payload.informationSource ?? payload.source ?? payload.source_information ?? '';
    c.consent = Boolean(payload.consent ?? payload.consentement ?? false);

    // submissionDate will be set by CreateDateColumn on save; keep current Date for in-memory object
    c.submissionDate = new Date();

    return c;
}
