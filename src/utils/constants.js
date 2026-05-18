export const REPORT_CATEGORIES = [
  { value: 'BULLYING_HARASSMENT', label: 'Bullying and Physical Harassment' },
  { value: 'VERBAL_ABUSE', label: 'Verbal Abuse and Intimidation' },
  { value: 'CYBERBULLYING', label: 'Cyberbullying' },
  { value: 'DRUG_ABUSE', label: 'Drug and Substance Abuse' },
  { value: 'ALCOHOL', label: 'Alcohol-Related Incident' },
  { value: 'SEXUAL_HARASSMENT', label: 'Sexual Harassment' },
  { value: 'THEFT', label: 'Theft' },
  { value: 'VANDALISM', label: 'Vandalism or Property Damage' },
  { value: 'SAFETY_HAZARD', label: 'Physical Safety Hazard' },
  { value: 'STAFF_MISCONDUCT', label: 'Staff or Lecturer Misconduct' },
  { value: 'MENTAL_HEALTH_CONCERN', label: 'Mental Health Concern About a Peer' },
  { value: 'ACADEMIC_INTEGRITY', label: 'Academic Integrity Violation' },
  { value: 'HAZING', label: 'Hazing or Initiation Activity' },
  { value: 'CULT_ACTIVITY', label: 'Gang or Group-Related Intimidation' },
  { value: 'WEAPONS', label: 'Weapons or Dangerous Objects' },
  { value: 'GROOMING_CONCERN', label: 'Safeguarding or Exploitation Concern' },
  { value: 'UNAUTHORISED_PERSONS', label: 'Unauthorised Persons on Campus' },
  { value: 'FACILITIES', label: 'Facilities or Infrastructure Concern' },
  { value: 'EXAM_FRAUD', label: 'Examination Fraud' },
  { value: 'OTHER', label: 'Other' }
];

export const HIGH_STAKES_CATEGORIES = [
  'SEXUAL_HARASSMENT',
  'STAFF_MISCONDUCT', 
  'CULT_ACTIVITY',
  'WEAPONS',
  'GROOMING_CONCERN'
];

export const COOLING_OFF_SECONDS = 120;

export const STATUS_CONFIG = {
  RECEIVED: { 
    label: 'Received', 
    colour: 'bg-gray-100 text-gray-700',
    description: 'Your report has been received and will be reviewed shortly.'
  },
  ESCROW: { 
    label: 'Pending Review', 
    colour: 'bg-yellow-100 text-yellow-800',
    description: 'Your report is in a 24-hour holding period before review.'
  },
  UNDER_REVIEW: { 
    label: 'Under Review', 
    colour: 'bg-blue-100 text-blue-700',
    description: 'An administrator is currently reviewing your report.'
  },
  INVESTIGATING: { 
    label: 'Being Investigated', 
    colour: 'bg-purple-100 text-purple-700',
    description: 'A formal investigation is underway.'
  },
  ACTION_TAKEN: { 
    label: 'Action Taken', 
    colour: 'bg-orange-100 text-orange-800',
    description: 'Appropriate action has been initiated.'
  },
  RESOLVED: { 
    label: 'Resolved', 
    colour: 'bg-green-100 text-green-700',
    description: 'This report has been resolved.'
  },
  CLOSED: { 
    label: 'Closed', 
    colour: 'bg-gray-100 text-gray-500',
    description: 'This case has been closed.'
  },
  RETRACTED_BY_REPORTER: { 
    label: 'Cancelled by You', 
    colour: 'bg-red-100 text-red-700',
    description: 'You cancelled this report within the allowed window.'
  }
};

export const CREDIBILITY_TIER_CONFIG = {
  HIGH: { 
    label: 'Structurally Consistent', 
    colour: 'bg-green-100 text-green-700',
    barColour: 'bg-green-500'
  },
  MEDIUM: { 
    label: 'Mixed Indicators', 
    colour: 'bg-yellow-100 text-yellow-700',
    barColour: 'bg-yellow-500'
  },
  LOW: { 
    label: 'Warrants Extra Scrutiny', 
    colour: 'bg-red-100 text-red-700',
    barColour: 'bg-red-500'
  },
  UNAVAILABLE: { 
    label: 'Assessment Unavailable', 
    colour: 'bg-gray-100 text-gray-500',
    barColour: 'bg-gray-400'
  }
};

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'Super Administrator',
  WELFARE_OFFICER: 'Welfare Officer',
  SECURITY_OFFICER: 'Security Officer',
  FACILITY_MANAGER: 'Facility Manager',
  ACADEMIC_AFFAIRS: 'Academic Affairs',
  COUNSELLOR: 'Counsellor'
};

export const MANDATORY_AI_DISCLAIMER = 
  'This assessment analyses linguistic and structural patterns only. ' +
  'It cannot determine whether described events occurred. ' +
  'All formal actions require independent human corroboration.';

export const CORROBORATION_MIN_LENGTH = 50;
