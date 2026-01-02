import { z } from 'zod';

export const eligibilitySchema = z
  .object({
    isOver16: z.enum(['yes', 'no'], {
      required_error: 'Please select an option',
    }),
    hasParentalConsent: z.boolean().optional(),
    isResident: z.enum(['yes', 'no'], {
      required_error: 'Please select an option',
    }),
  })
  .refine(
    (data) => {
      // Must be over 16 or have parental consent
      if (data.isOver16 === 'no') return false;
      return true;
    },
    {
      message: 'You must be 16 years or older to apply',
      path: ['isOver16'],
    }
  )
  .refine(
    (data) => {
      // Must be a resident
      if (data.isResident === 'no') return false;
      return true;
    },
    {
      message: 'You must be a resident of Barbados to apply',
      path: ['isResident'],
    }
  );

export const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  nationalId: z.string().min(5, 'Valid national ID is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  phone: z.string().min(7, 'Valid phone number is required'),
  email: z.string().email('Valid email is required'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  parish: z.string().min(2, 'Parish is required'),
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactRelationship: z.string().min(2, 'Relationship is required'),
  emergencyContactPhone: z.string().min(7, 'Valid phone number is required'),
});

export const documentsSchema = z.object({
  photo: z.string().min(1, 'Passport photo is required'),
  proofOfAge: z.string().min(1, 'Proof of age is required'),
  proofOfResidence: z.string().min(1, 'Proof of residence is required'),
  medicalCertificate: z.string().optional(),
});

export const reviewSchema = z.object({
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

export type EligibilityFormData = z.infer<typeof eligibilitySchema>;
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type DocumentsFormData = z.infer<typeof documentsSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;

export interface LearnersPermitFormData {
  eligibility: EligibilityFormData;
  personalInfo: PersonalInfoFormData;
  documents: DocumentsFormData;
  review: ReviewFormData;
}
