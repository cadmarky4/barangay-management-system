// ============================================================================
// utils/formatters.ts - Utility functions for formatting resident data
// ============================================================================

import { type TFunction } from 'i18next';

export const formatters = {
  // Format gender values
  formatGender: (gender: string, t: TFunction): string => {
    const genderMap: Record<string, string> = {
      'MALE': t('residents.form.genderOptions.male'),
      'FEMALE': t('residents.form.genderOptions.female'),
      'NON_BINARY': t('residents.form.genderOptions.nonBinary'),
      'PREFER_NOT_TO_SAY': t('residents.form.genderOptions.preferNotToSay'),
    };
    return genderMap[gender] || gender;
  },

  // Format civil status values
  formatCivilStatus: (status: string, t: TFunction): string => {
    const statusMap: Record<string, string> = {
      'SINGLE': t('residents.form.civilStatusOptions.single'),
      'LIVE_IN': t('residents.form.civilStatusOptions.liveIn'),
      'MARRIED': t('residents.form.civilStatusOptions.married'),
      'WIDOWED': t('residents.form.civilStatusOptions.widowed'),
      'DIVORCED': t('residents.form.civilStatusOptions.divorced'),
      'SEPARATED': t('residents.form.civilStatusOptions.separated'),
      'ANNULLED': t('residents.form.civilStatusOptions.annulled'),
      'PREFER_NOT_TO_SAY': t('residents.form.civilStatusOptions.preferNotToSay'),
    };
    return statusMap[status] || status;
  },

  // Format nationality values
  formatNationality: (nationality: string, t: TFunction): string => {
    const nationalityMap: Record<string, string> = {
      'FILIPINO': 'Filipino',
      'AMERICAN': 'American',
      'BRITISH': 'British',
      'CANADIAN': 'Canadian',
      'AUSTRALIAN': 'Australian',
      'OTHER': t('residents.form.options.other'),
    };
    return nationalityMap[nationality] || nationality;
  },

  // Format religion values
  formatReligion: (religion: string, t: TFunction): string => {
    const religionMap: Record<string, string> = {
      'CATHOLIC': t('residents.form.religionOptions.catholic'),
      'IGLESIA_NI_CRISTO': t('residents.form.religionOptions.iglesiaNiCristo'),
      'EVANGELICAL': t('residents.form.religionOptions.evangelical'),
      'PROTESTANT': t('residents.form.religionOptions.protestant'),
      'ISLAM': t('residents.form.religionOptions.islam'),
      'BUDDHIST': t('residents.form.religionOptions.buddhist'),
      'HINDU': t('residents.form.religionOptions.hindu'),
      'SEVENTH_DAY_ADVENTIST': t('residents.form.religionOptions.seventhDayAdventist'),
      'JEHOVAHS_WITNESS': t('residents.form.religionOptions.jehovahsWitness'),
      'BORN_AGAIN_CHRISTIAN': t('residents.form.religionOptions.bornAgainChristian'),
      'ORTHODOX': t('residents.form.religionOptions.orthodox'),
      'JUDAISM': t('residents.form.religionOptions.judaism'),
      'ATHEIST': t('residents.form.religionOptions.atheist'),
      'AGLIPAYAN': t('residents.form.religionOptions.aglipayan'),
      'OTHER': t('residents.form.options.other'),
      'PREFER_NOT_TO_SAY': t('residents.form.religionOptions.preferNotToSay'),
    };
    return religionMap[religion] || religion;
  },

  // Format educational attainment values
  formatEducationalAttainment: (education: string, t: TFunction): string => {
    const educationMap: Record<string, string> = {
      'NO_FORMAL_EDUCATION': t('residents.form.educationalAttainmentOptions.noFormalEducation'),
      'ELEMENTARY_UNDERGRADUATE': t('residents.form.educationalAttainmentOptions.elementaryUndergraduate'),
      'ELEMENTARY_GRADUATE': t('residents.form.educationalAttainmentOptions.elementaryGraduate'),
      'HIGH_SCHOOL_UNDERGRADUATE': t('residents.form.educationalAttainmentOptions.highSchoolUndergraduate'),
      'HIGH_SCHOOL_GRADUATE': t('residents.form.educationalAttainmentOptions.highSchoolGraduate'),
      'COLLEGE_UNDERGRADUATE': t('residents.form.educationalAttainmentOptions.collegeUndergraduate'),
      'COLLEGE_GRADUATE': t('residents.form.educationalAttainmentOptions.collegeGraduate'),
      'POST_GRADUATE': t('residents.form.educationalAttainmentOptions.postGraduate'),
      'VOCATIONAL': t('residents.form.educationalAttainmentOptions.vocational'),
      'OTHER': t('residents.form.options.other'),
    };
    return educationMap[education] || education;
  },

  // Format employment status values
  formatEmploymentStatus: (status: string, t: TFunction): string => {
    const statusMap: Record<string, string> = {
      'EMPLOYED': t('residents.form.employmentStatusOptions.employed'),
      'UNEMPLOYED': t('residents.form.employmentStatusOptions.unemployed'),
      'SELF_EMPLOYED': t('residents.form.employmentStatusOptions.selfEmployed'),
      'RETIRED': t('residents.form.employmentStatusOptions.retired'),
      'STUDENT': t('residents.form.employmentStatusOptions.student'),
      'OFW': t('residents.form.employmentStatusOptions.overseasWorker'),
    };
    return statusMap[status] || status;
  },

  // Format voter status values
  formatVoterStatus: (status: string, t: TFunction): string => {
    const statusMap: Record<string, string> = {
      'NOT_REGISTERED': t('residents.form.voterStatusOptions.notRegistered'),
      'REGISTERED': t('residents.form.voterStatusOptions.registered'),
      'DECEASED': t('residents.form.voterStatusOptions.deceased'),
      'TRANSFERRED': t('residents.form.voterStatusOptions.transferred'),
    };
    return statusMap[status] || status;
  },

  // Format resident status values
  formatResidentStatus: (status: string, t: TFunction): string => {
    const statusMap: Record<string, string> = {
      'ACTIVE': t('residents.view.status.active'),
      'INACTIVE': t('residents.view.status.inactive'),
      'DECEASED': t('residents.view.status.deceased'),
      'TRANSFERRED': t('residents.view.status.transferred'),
    };
    return statusMap[status] || status;
  },

  // Format ID type values
  formatIdType: (idType: string, t: TFunction): string => {
    const idTypeMap: Record<string, string> = {
      'NATIONAL_ID': t('residents.form.idTypeOptions.nationalId'),
      'PASSPORT': t('residents.form.idTypeOptions.passport'),
      "DRIVER'S_LICENSE": t('residents.form.idTypeOptions.driversLicense'),
      "VOTER'S_ID": t('residents.form.idTypeOptions.votersId'),
      'PHILHEALTH_ID': t('residents.form.idTypeOptions.philhealthId'),
      'SSS_ID': t('residents.form.idTypeOptions.sssId'),
      'UMID': t('residents.form.idTypeOptions.umid'),
    };
    return idTypeMap[idType] || idType;
  },

  // Format date values
  formatDate: (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  },

  // Format datetime values
  formatDateTime: (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  },

  // Format boolean values
  formatBoolean: (value: boolean, t: TFunction): string => {
    return value ? t('common.yes') : t('common.no');
  },

  // Format phone numbers
  formatPhoneNumber: (phone: string): string => {
    if (!phone) return '';
    
    // Basic Philippine phone number formatting
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11 && cleaned.startsWith('09')) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    return phone;
  },

  // Format addresses
  formatAddress: (resident: {
    house_number?: string;
    street?: string;
    barangay?: string;
    city?: string;
    province?: string;
    region?: string;
  }): string => {
    const parts = [
      resident.house_number,
      resident.street,
      resident.barangay,
      resident.city,
      resident.province,
      resident.region
    ].filter(Boolean);
    
    return parts.join(', ');
  }
};