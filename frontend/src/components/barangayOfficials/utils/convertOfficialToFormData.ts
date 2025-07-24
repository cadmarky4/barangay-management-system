import type { BarangayOfficial, BarangayOfficialFormData } from "../../../services/barangayOfficials.types";

// Transform API data to form data format
export const convertOfficialToFormData = (official: BarangayOfficial): BarangayOfficialFormData => ({
    prefix: official.prefix,
    firstName: official.first_name,
    middleName: official.middle_name,
    lastName: official.last_name,
    gender: official.gender,
    contactNumber: official.contact_number,
    emailAddress: official.email_address,
    completeAddress: official.complete_address,
    civilStatus: official.civil_status,
    educationalBackground: official.educational_background,
  
    position: official.position,
  
    termStart: official.term_start,
    termEnd: official.term_end,
    termNumber: official.term_number,
    isCurrentTerm: official.is_current_term,
  
    electionDate: official.election_date,
    votesReceived: official.votes_received,
    isElected: official.is_elected,
    appointmentDocument: official.appointment_document,
  
    status: official.status,
    statusDate: official.status_date,
    statusReason: official.status_reason,
  
    workExperience: official.work_experience,
    skillsExpertise: official.skills_expertise,
    trainingsAttended: official.trainings_attended,
    certifications: official.certifications,
    majorAccomplishments: official.major_accomplishments,
    projectsInitiated: official.projects_initiated,
    performanceNotes: official.performance_notes,
    performanceRating: official.performance_rating,
  
    emergencyContactName: official.emergency_contact_name,
    emergencyContactNumber: official.emergency_contact_number,
    emergencyContactRelationship: official.emergency_contact_relationship,
  
    documents: official.documents,
  
    oathTakingDate: official.oath_taking_date,
    oathTakingNotes: official.oath_taking_notes,
  
    isActive: official.is_active,
  
    profile_photo: official.profile_photo,
  });