import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { IsEmail, IsNotEmpty, IsISO8601, IsArray, IsJSON, IsBoolean, IsOptional } from 'class-validator';

@Entity('candidatures')
export class Candidature {
  constructor() {
    // Initialisation des propriétés requises
    this.id = 0;
    this.firstName = '';
    this.lastName = '';
    this.nationality = '';
    this.gender = '';
    this.dateOfBirth = '';
    this.placeOfBirth = '';
    this.phoneNumber = '';
    this.email = '';
    this.organization = '';
    this.country = '';
    this.department = '';
    this.currentPosition = '';
    this.taskDescription = '';
    this.diploma = '';
    this.institution = '';
    this.field = '';
    this.languages = [];
    this.languageLevels = {};
    this.expectedResults = '';
    this.otherInformation = '';
    this.fundingSource = [];
    this.institutionName = '';
    this.contactPerson = '';
    this.contactEmail = '';
    this.informationSource = '';
    this.consent = false;
    this.submissionDate = new Date();
  }

  @PrimaryGeneratedColumn()
  id: number;

  // generalInfo
  @Column()
  @IsNotEmpty()
  firstName: string;

  @Column()
  @IsNotEmpty()
  lastName: string;

  @Column()
  @IsNotEmpty()
  nationality: string;

  @Column()
  @IsNotEmpty()
  gender: string;

  @Column()
  @IsISO8601()
  @IsNotEmpty()
  dateOfBirth: string;

  @Column()
  @IsNotEmpty()
  placeOfBirth: string;

  @Column()
  @IsNotEmpty()
  phoneNumber: string;

  @Column()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column({ nullable: true })
  @IsOptional()
  organization: string;

  @Column()
  @IsNotEmpty()
  country: string;

  // professionalDetails
  @Column({ nullable: true })
  @IsOptional()
  department: string;

  @Column()
  @IsNotEmpty()
  currentPosition: string;

  @Column('text')
  @IsNotEmpty()
  taskDescription: string;

  // education
  @Column()
  @IsNotEmpty()
  diploma: string;

  @Column()
  @IsNotEmpty()
  institution: string;

  @Column()
  @IsNotEmpty()
  field: string;

  @Column('text', { array: true })
  @IsArray()
  languages: string[];

  @Column('jsonb')
  languageLevels: Record<string, string>;
  

  // additionalInfo
  @Column('text')
  @IsNotEmpty()
  expectedResults: string;

  @Column('text', { nullable: true })
  @IsOptional()
  otherInformation: string;

  // funding
  @Column('text', { array: true })
  @IsArray()
  fundingSource: string[];

  @Column({ nullable: true })
  @IsOptional()
  institutionName: string;

  @Column({ nullable: true })
  @IsOptional()
  contactPerson: string;

  @Column({ name: 'contact_email', type: 'varchar', length: 255, nullable: true })
  @IsEmail()
  @IsOptional()
  contactEmail?: string | null;
  

  @Column()
  @IsNotEmpty()
  informationSource: string;

  @Column({ default: true })
  @IsBoolean()
  consent: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submissionDate: Date;
}