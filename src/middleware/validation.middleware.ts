import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Candidature } from '../entities/Candidature';
import { mapFrenchToCandidature } from '../mappers/CandidatureMapper';

type AnyObj = Record<string, any>;

function isFrenchFlat(b: AnyObj) {
  return !!(b && (b.prenom || b.nom || b.date_naissance));
}
function isEnglishFlat(b: AnyObj) {
  return !!(b && (b.firstName || b.lastName || b.email));
}
function isEnglishNested(b: AnyObj) {
  return !!(b && (b.generalInfo || b.professionalDetails || b.education || b.additionalInfo || b.funding));
}

function normalizeDateString(v: any): string {
  if (!v) return '';
  if (v instanceof Date) {
    return v.toISOString().split('T')[0];
  }
  const d = new Date(v);
  return isNaN(d.getTime()) ? String(v) : d.toISOString().split('T')[0];
}

function mapFromEnglishNested(b: AnyObj): Partial<Candidature> {
  const gi = b.generalInfo ?? {};
  const pd = b.professionalDetails ?? {};
  const ed = b.education ?? {};
  const ai = b.additionalInfo ?? {};
  const fu = b.funding ?? {};

  return {
    firstName: gi.firstName || '',
    lastName: gi.lastName || '',
    nationality: gi.nationality || '',
    gender: gi.gender || '',
    dateOfBirth: normalizeDateString(gi.dateOfBirth),
    placeOfBirth: gi.placeOfBirth || '',
    phoneNumber: gi.phoneNumber || '',
    email: gi.email || '',
    organization: gi.organization || '',
    country: gi.country || '',
    department: pd.department || '',
    currentPosition: pd.currentPosition || '',
    taskDescription: pd.taskDescription || '',
    diploma: ed.diploma || '',
    institution: ed.institution || '',
    field: ed.field || '',
    languages: ed.languages || [],
    languageLevels: ed.languageLevels || {},
    expectedResults: ai.expectedResults || '',
    otherInformation: ai.otherInformation || '',
    fundingSource: fu.fundingSource || [],
    institutionName: fu.institutionName || '',
    contactPerson: fu.contactPerson || '',
    contactEmail: fu.contactEmail ?? null,
    informationSource: fu.informationSource || '',
    consent: Boolean(b.consent),
  };
}

function mapFromEnglishFlat(b: AnyObj): Partial<Candidature> {
  return {
    firstName: b.firstName || '',
    lastName: b.lastName || '',
    nationality: b.nationality || '',
    gender: b.gender || '',
    dateOfBirth: normalizeDateString(b.dateOfBirth),
    placeOfBirth: b.placeOfBirth || '',
    phoneNumber: b.phoneNumber || '',
    email: b.email || '',
    organization: b.organization || '',
    country: b.country || '',
    department: b.department || '',
    currentPosition: b.currentPosition || '',
    taskDescription: b.taskDescription || '',
    diploma: b.diploma || '',
    institution: b.institution || '',
    field: b.field || '',
    languages: b.languages || [],
    languageLevels: b.languageLevels || {},
    expectedResults: b.expectedResults || '',
    otherInformation: b.otherInformation || '',
    fundingSource: b.fundingSource || [],
    institutionName: b.institutionName || '',
    contactPerson: b.contactPerson || '',
    contactEmail: b.contactEmail ?? null,
    informationSource: b.informationSource || '',
    consent: Boolean(b.consent),
  };
}

export function validationMiddleware(type: { new (): Candidature }, skipMissingProperties = false) {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('Incoming req.body:', JSON.stringify(req.body, null, 2));

    let mappedData: Partial<Candidature>;
    try {
      if (isFrenchFlat(req.body)) {
        mappedData = mapFrenchToCandidature(req.body);
      } else if (isEnglishNested(req.body)) {
        mappedData = mapFromEnglishNested(req.body);
      } else if (isEnglishFlat(req.body)) {
        mappedData = mapFromEnglishFlat(req.body);
      } else {
        throw new Error('Format de payload non reconnu');
      }
    } catch (e) {
      console.error('Erreur lors du mapping du payload:', e);
      return res.status(400).json({
        success: false,
        message: 'Payload invalide ou non reconnu',
      });
    }

    const dto = plainToInstance(type, mappedData);
    validate(dto as object, { skipMissingProperties, validationError: { target: false } })
      .then((errors: ValidationError[]) => {
        if (errors.length > 0) {
          const message = errors
            .map((error: ValidationError) => Object.values(error.constraints || {}).join(', '))
            .join('; ');
          res.status(400).json({
            success: false,
            message: `Échec de la validation : ${message}`,
            errors: errors.map(error => ({
              property: error.property,
              constraints: error.constraints,
            })),
          });
        } else {
          req.body = mappedData;
          console.log('Transformed req.body:', JSON.stringify(req.body, null, 2));
          next();
        }
      })
      .catch((error) => {
        console.error('Erreur de validation :', error);
        res.status(500).json({
          success: false,
          message: 'Erreur interne du serveur lors de la validation',
        });
      });
  };
}
