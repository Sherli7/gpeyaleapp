import { Candidature } from "../entities/Candidature";

type FRPayload = Record<string, any>;

export function mapFrenchToCandidature(payload: FRPayload): Candidature {
    const c = new Candidature();

    // Helper to retrieve value regardless of case/underscore variants
    const get = (...keys: string[]) => {
        for (const key of keys) {
            if (payload[key] !== undefined) return payload[key];
            const lowerKey = key.toLowerCase();
            const found = Object.keys(payload).find(k => k.toLowerCase() === lowerKey);
            if (found && payload[found] !== undefined) return payload[found];
        }
        return undefined;
    };

    c.firstName = get('firstName', 'prenom') ?? '';
    c.lastName = get('lastName', 'nom') ?? '';
    c.nationality = get('nationality', 'nationalite') ?? '';
    c.gender = get('gender', 'sexe') ?? '';
    // Normalize date to ISO 8601 format (YYYY-MM-DD)
    // Support both snake_case (date_naissance) and camelCase (dateNaissance)
    const dateValue = get('dateOfBirth', 'dateNaissance', 'date_naissance');
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
    c.placeOfBirth = get('placeOfBirth', 'lieuNaissance', 'lieu_naissance') ?? '';
    c.phoneNumber = get('phoneNumber', 'telephone') ?? '';
    c.email = get('email', 'contactEmail') ?? '';

    c.organization = get('organization', 'organisation') ?? '';
    c.country = get('country', 'pays') ?? '';
    c.department = get('department', 'departement') ?? '';
    c.currentPosition = get('currentPosition', 'posteActuel', 'poste_actuel') ?? '';
    c.taskDescription = get('taskDescription', 'descriptionTaches', 'description_taches') ?? '';

    c.diploma = get('diploma', 'diplome') ?? '';
    c.institution = get('institution', 'institutionEtudes', 'institution_etudes') ?? '';
    // 'domaine' in payload can be a comma-separated string or array
    const domainValue = get('field', 'domaine');
    c.field = Array.isArray(domainValue) ? domainValue.join(', ') : (domainValue ?? '');

    const languagesValue = get('languages', 'langues');
    c.languages = Array.isArray(languagesValue) ? languagesValue : (languagesValue ? [languagesValue] : []);

    const levelsValue = get('languageLevels', 'niveaux');
    c.languageLevels = levelsValue && typeof levelsValue === 'object' ? levelsValue : {};

    c.expectedResults = get('expectedResults', 'resultatsAttendus', 'resultats_attendus') ?? '';
    c.otherInformation = get('otherInformation', 'autresInfos', 'autres_infos') ?? '';

    // fundingSource is a text[] in entity; accept single string or array
    // Support both 'mode' and 'mode_financement'
    const fundingValue = get('fundingSource', 'mode', 'mode_financement');
    if (Array.isArray(fundingValue)) {
        c.fundingSource = fundingValue;
    } else if (fundingValue) {
        c.fundingSource = [String(fundingValue)];
    } else {
        c.fundingSource = [];
    }

    c.institutionName = get('institutionName', 'institutionFinancement', 'institution_financement') ?? '';
    c.contactPerson = get('contactPerson', 'contactFinancement', 'contact_financement') ?? '';
    c.contactEmail = get('contactEmail', 'emailContactFinancement', 'email_contact_financement') ?? null;

    c.informationSource = get('informationSource', 'source', 'source_information') ?? '';
    c.consent = Boolean(get('consent', 'consentement') ?? false);

    // submissionDate will be set by CreateDateColumn on save; keep current Date for in-memory object
    c.submissionDate = new Date();

    return c;
}
