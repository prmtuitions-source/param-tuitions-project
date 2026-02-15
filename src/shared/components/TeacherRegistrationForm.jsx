import React, { useState, useEffect, useMemo } from 'react';
import { Formik, Form, Field, FieldArray, ErrorMessage, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../utils/supabaseClient';
import SignedImg from './SignedImg';
import getSignedUrl from '../utils/getSignedUrl';
import uiNotify from '../utils/uiNotify';

/**
 * Teacher Registration Form
 * 
 * Implements the NCTE/NEP 2020 aligned specification.
 * Features:
 * - Multi-section layout
 * - Dynamic Education Rows (Pre-populated Class 10/12)
 * - File Uploads with Preview & Validation
 * - Draft Saving to LocalStorage
 * - Supabase Integration
 */

// --- Validation Schema ---
const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png', 'application/pdf'];
const BOARD_OPTIONS = ["UP", "CBSE", "ICSE", "Bihar", "Jharkhand", "Bengal", "Chattisgarh", "Maharashtra", "Delhi", "Madhya Pradesh", "Others"];
const YEAR_OPTIONS = Array.from({ length: 2025 - 1985 + 1 }, (_, i) => (1985 + i).toString());
const MARKS_OPTIONS = Array.from({ length: (100 - 40) / 5 + 1 }, (_, i) => (40 + i * 5).toString());
const SUBJECT_OPTIONS = [
  "All (For Lower Grades)", "Accountancy", "Arts and Humanities", "Auditing", "Biology", "Business and Management",
  "Business Studies", "Chemistry", "Chess", "Civics", "Commerce", "Computer Aided Design ( CAD)", "Computer Science",
  "Computing and IT", "Creative Arts", "Creative Writing", "Current Affair", "Dance", "Drawing", "Drums", "Economics",
  "Engineering", "English", "Essay", "Finance", "Fine Arts", "Flute", "French", "General Knowledge", "Geography",
  "Guitar", "Harmonium", "Hindi", "History", "Indian Polity", "Karate", "Kathak", "Languages", "Marketing",
  "Mathematics", "Music", "Numerical Ability", "Nursing and Healthcare", "Painting", "Philosophy", "Physical Education",
  "Physics", "Piano", "Poetry", "Political Science", "Politics", "Psychology", "Reasoning", "Religious Studies",
  "Sanskrit", "Science", "Singing", "Social Studies", "Sociology", "Statistics", "Stories", "Tabla", "Urdu", "Violin"
];
const SCHOOL_OPTIONS = [
  "Ambition School", "Annie Besant School", "Army Public School", "Arya Mahila", "Aryan International School",
  "Bal Vidhyalaya", "BNS English School", "Care And Career", "Central Hindu Boys School", "Central Hindu Girls School",
  "Children Academy", "Crimson World", "DAV Public School", "Delhi Public School Varanasi", "Divine Sainik School",
  "GD Goenka Public School", "Glenhill School", "Green valley", "Guru Nanak English School", "Gyandeep School",
  "Happy Model", "Hari Bandhu", "Harsewanand School", "Hermann Gmeiner School", "Holy Mother Teresa",
  "Ideal New Star", "Imperial Public", "International Hindu School", "Ishita Public School", "Jagaran Public School",
  "Jawahar Navodaya Vidyalaya", "Jeevan Deep", "Jeevan Jyoti", "Kasturba Gandhi", "Kendriya Vidyalaya",
  "Little Flower House", "Little Millennium School", "M P Memorial", "Mahatma JF Public School", "MBS Convent School",
  "Mukularanyam English School", "Muni Public School", "O Grove School", "Others", "PD Convent", 
  "Polymath Public School", "PR International", "Prathmik Vidhyalaya", "R.S. Convent Sainik school Ledhupur",
  "Raj English School", "Rajghat Besant School", "Rising India School Susuwahi", "RS Convent", "S S Public School Babatpur",
  "Sant Atulanand Convent School", "Seth MR Jaipuria Schools Padao", "SS Mission", "SSV English School",
  "St Francis School Ramnagar", "St Francis Xavier", "St John's", "St Joseph", "St Lawrence School",
  "St Mary's Cant", "St Paul's", "St Thomas International School", "Sunbeam School", "Swami Harsewanand School",
  "Tulsi Vidya Niketan", "Uday Pratap Public School", "Unique Academy", "UP College", "Vanita Public School",
  "Varanasi Public School", "Vasant Academy", "WH Smith"
];
const CLASS_12_SUBJECTS = [
  "PCM", "PCB", "PCMB", "Commerce", "Commerce with Maths", "Humanities", "Other"
];
const DIPLOMA_SUBJECTS = [
  "ANM (Auxiliary Nursing Midwifery)", "D.Pharm (Pharmacy)", "DCA (Computer Applications)",
  "Diploma in Agriculture", "Diploma in Animation & VFX", "Diploma in Automobile Engg",
  "Diploma in Aviation/Cabin Crew", "Diploma in Beautician & Wellness", "Diploma in Business Management",
  "Diploma in Chemical Engg", "Diploma in Civil Engg", "Diploma in Computer Science",
  "Diploma in Cyber Security", "Diploma in Digital Marketing", "Diploma in Electrical Engg",
  "Diploma in Electronics & Comm.", "Diploma in Event Management", "Diploma in Fashion Designing",
  "Diploma in Financial Accounting", "Diploma in Graphic Designing", "Diploma in Hardware & Networking",
  "Diploma in Hotel Management", "Diploma in Interior Designing", "Diploma in Journalism/Mass Comm",
  "Diploma in Mechanical Engg", "Diploma in Nursery Teacher Training (NTT)", "Diploma in Nutrition & Dietetics",
  "Diploma in Ophthalmic Tech", "Diploma in Photography", "Diploma in Physiotherapy (DPT)",
  "Diploma in Travel & Tourism", "Diploma in Web Designing", "Diploma in X-Ray / Radiography",
  "DMLT (Medical Lab Technology)", "GNM (General Nursing & Midwifery)"
];
const GRADUATION_STATUS_OPTIONS = ["Completed", "I Year", "II Year", "III Year", "IV Year"];
const COLLEGE_OPTIONS = [
  "Agrasen Kanya PG College", "Asha Pharmacy College", "Banaras Hindu University", "CSJM University, Prayagraj",
  "DAV PG College", "Dr APJ Abdul Kalam University", "Dr B R Ambedkar University, Agra", "Ewing Christian College, Prayagraj",
  "Ghanshyam PG College", "Harishchandra PG College", "Indian Institute Of Technology", "Indian Institute Of Technology Online",
  "Mahatma Gandhi Kashi Vidyapeeth", "Microtek College", "National Institute Of Technology", "Others",
  "Rajju Bhaiya University, Prayagraj", "SHEPA College", "Shri Krishna Ayurvedic Medical College & Hospital",
  "SMS, Varanasi", "Sudhakar Mahila PG College", "Uday Pratap Autonomus College", "Veer Bahadur Singh Purvanchal University"
];
const GRADUATION_SUBJECT_OPTIONS = [
  "B.A. Economics", "B.A. English", "B.A. Geography", "B.A. History", "B.A. Journalism & Mass Comm",
  "B.A. Political Science", "B.A. Psychology", "B.A. Sociology",
  "B.Des (Fashion Design)", "B.Des (Graphic Design)", "B.Des (Interior Design)", "B.Des (Product Design)",
  "BCA (Computer Applications)", "BFA (Fine Arts)",
  "B.Com (Accounting & Finance)", "B.Com (General/Hons)",
  "BBA (Business Admin)", "BBA (Digital Marketing)", "BHM (Hotel Management)", "BMS (Management Studies)",
  "B.Sc Agriculture", "B.Sc Animation & Multimedia", "B.Sc Biotechnology", "B.Sc Botany", "B.Sc Chemistry",
  "B.Sc Computer Science", "B.Sc Forensic Science", "B.Sc Hospitality & Hotel Admin", "B.Sc IT (Information Tech)",
  "B.Sc Mathematics", "B.Sc Nursing", "B.Sc Physics", "B.Sc Statistics", "B.Sc Zoology",
  "B.Arch (Architecture) (5 Years)",
  "B.Tech Aeronautical / Aerospace", "B.Tech Biotechnology", "B.Tech Chemical Engineering", "B.Tech Civil Engineering",
  "B.Tech Computer Science (CSE)", "B.Tech Electrical Engineering (EEE)", "B.Tech Electronics & Comm. (ECE)",
  "B.Tech Information Technology (IT)", "B.Tech Mechanical Engineering",
  "B.Pharm (Pharmacy)", "BAMS (Ayurvedic Medicine)", "BDS (Dental Surgery)", "BHMS (Homeopathic Medicine)",
  "BPT (Physiotherapy)", "MBBS (Medicine & Surgery)", "B.V.Sc & AH (Veterinary)",
  "LL.B (General)", "B.A. LL.B (Integrated)", "BBA LL.B (Integrated)"
];
const POST_GRADUATION_SUBJECT_OPTIONS = [
  "LL.M. (Corporate Law)", "LL.M. (Criminal Law)", "LL.M. (Intellectual Property)",
  "M.A. Economics", "M.A. English", "M.A. History", "M.A. Political Science", "M.A. Psychology", "M.A. Sociology",
  "M.Com (Banking & Finance)", "M.Com (General)",
  "M.Ed (Master of Education)", "M.P.Ed (Physical Education)", "M.Pharm",
  "M.Sc Agriculture", "M.Sc Agronomy", "M.Sc Analytical Chemistry", "M.Sc Anatomy", "M.Sc Animation and Multimedia",
  "M.Sc Anthropology", "M.Sc Applied Mathematics", "M.Sc Artificial Intelligence", "M.Sc Astronomy / Astrophysics",
  "M.Sc Audiology", "M.Sc Biochemistry", "M.Sc Bioinformatics", "M.Sc Biology", "M.Sc Biotechnology", "M.Sc Botany",
  "M.Sc Chemistry", "M.Sc Clinical Psychology", "M.Sc Computer Science", "M.Sc Cyber Security", "M.Sc Dairy Science",
  "M.Sc Data Science", "M.Sc Economics", "M.Sc Electronics", "M.Sc Environmental Science", "M.Sc Fashion Design / Textile Science",
  "M.Sc Food Science and Nutrition", "M.Sc Food Technology", "M.Sc Forensic Science", "M.Sc Forestry", "M.Sc Genetics",
  "M.Sc Geography", "M.Sc Geology / Applied Geology", "M.Sc Geophysics", "M.Sc Horticulture", "M.Sc Hotel Management",
  "M.Sc Industrial Chemistry", "M.Sc Information Technology (IT)", "M.Sc Inorganic Chemistry", "M.Sc IT (Information Tech)",
  "M.Sc Life Sciences", "M.Sc Marine Biology", "M.Sc Material Science", "M.Sc Mathematics", "M.Sc Medical Lab Technology (MLT)",
  "M.Sc Microbiology", "M.Sc Molecular Biology", "M.Sc Nanotechnology", "M.Sc Nursing", "M.Sc Nutrition and Dietetics",
  "M.Sc Operational Research", "M.Sc Optometry", "M.Sc Organic Chemistry", "M.Sc Pharmacology", "M.Sc Physical Chemistry",
  "M.Sc Physics", "M.Sc Physiology", "M.Sc Polymer Science", "M.Sc Psychology", "M.Sc Public Health", "M.Sc Remote Sensing and GIS",
  "M.Sc Renewable Energy", "M.Sc Sericulture", "M.Sc Soil Science", "M.Sc Speech-Language Pathology", "M.Sc Statistics",
  "M.Sc Visual Communication", "M.Sc Wildlife Biology", "M.Sc Zoology",
  "M.Tech Computer Science", "M.Tech Data Science", "M.Tech Power Systems", "M.Tech Structural Engg.", "M.Tech Thermal Engineering",
  "M.Tech VLSI & Embedded Sys.",
  "Masters in Social Work (MSW)",
  "MBA in Business Analytics", "MBA in Finance", "MBA in Human Resources (HR)", "MBA in International Business", "MBA in Marketing", "MBA in Operations",
  "MCA (Master of Comp. App.)", "MD (Doctor of Medicine)", "MDS (Dental)", "MPH (Public Health)", "MS (Master of Surgery)"
];
const EXTRA_QUALIFICATION_OPTIONS = [
  "D.El.Ed", "D.El.Ed I Year", "D.El.Ed II Year",
  "B.Ed", "B.Ed I Year", "B.Ed II Year",
  "M.Ed", "M.Ed I Year", "M.Ed II Year"
];
const BOARD_TEACHING_OPTIONS = [
  "UP", "CBSE", "ICSE", "IGCSE/Cambridge"
];
const TEACHING_MODE_OPTIONS = [
  "Student's Home", "Online", "School", "Coaching", "At Home"
];
const ENGLISH_PROFICIENCY_OPTIONS = ["Fluent English", "Hindi English Mix", "Hindi Only"];
const TRAVEL_MODE_OPTIONS = ["Foot/Auto", "Bike/Scooty", "Car"];
const PREFERRED_CLASSES_OPTIONS = [
  "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
  "Graduation", "JEE", "NEET", "NDA / Defence Exam", "CUET", "Olympiads",
  "School Entrance Exam", "At Home", "Sainik School Exam Preparation"
];

const formSchema = Yup.object().shape({
  full_name: Yup.string().required('Full Name is required'),
  father_name: Yup.string().required("Father's Name is required"),
  religion: Yup.string().required('Religion is required'),
  whatsapp_number: Yup.string()
    .matches(/^(\+91|0)?[6-9]\d{9}$/, 'Invalid Indian mobile number')
    .required('WhatsApp Number is required'),
  alternate_mobile: Yup.string()
    .matches(/^(\+91|0)?[6-9]\d{9}$/, 'Invalid Indian mobile number')
    .nullable(),
  date_of_birth: Yup.date()
    .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)), 'Must be at least 18 years old')
    .required('Date of Birth is required'),
  marital_status: Yup.string().required('Marital Status is required'),
  gender: Yup.string().required('Gender is required'),
  
  // Addresses
  temporary_address: Yup.string().required('Temporary Address is required'),
  permanent_address: Yup.string().required('Permanent Address is required'),
  main_location: Yup.string().required('Main Location (Area) is required'),

  
  // Structured Education Validation
  class_10_board: Yup.string().required('Class 10th Board is required'),
  class_10_school: Yup.string().required('Class 10th School is required'),
  class_10_year: Yup.string().required('Class 10th Year is required'),
  class_10_marks: Yup.string().required('Class 10th Marks are required'),

  has_class_12: Yup.string().required('Please select if you have Class 12th'),

  class_12_board: Yup.string().when('has_class_12', {
    is: 'yes',
    then: (schema) => schema.required('Class 12th Board is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  class_12_school: Yup.string().when('has_class_12', {
    is: 'yes',
    then: (schema) => schema.required('Class 12th School is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  class_12_year: Yup.string().when('has_class_12', {
    is: 'yes',
    then: (schema) => schema.required('Class 12th Year is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  class_12_marks: Yup.string().when('has_class_12', {
    is: 'yes',
    then: (schema) => schema.required('Class 12th Marks are required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  class_12_subject: Yup.string().when('has_class_12', {
    is: 'yes',
    then: (schema) => schema.required('Class 12th Subject is required'),
    otherwise: (schema) => schema.notRequired(),
  }),

  has_diploma: Yup.string().required('Please select if you have a Diploma'),

  diploma_board: Yup.string().when('has_diploma', {
    is: 'yes',
    then: (schema) => schema.required('Diploma Board is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  diploma_year: Yup.string().when('has_diploma', {
    is: 'yes',
    then: (schema) => schema.required('Diploma Year is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  diploma_marks: Yup.string().when('has_diploma', {
    is: 'yes',
    then: (schema) => schema.required('Diploma Marks are required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  diploma_subject: Yup.string().when('has_diploma', {
    is: 'yes',
    then: (schema) => schema.required('Diploma Subject is required'),
    otherwise: (schema) => schema.notRequired(),
  }),

  // Graduation Validation
  has_graduation: Yup.string().required('Please select if you have Graduation'),

  graduation_status: Yup.string().when('has_graduation', {
    is: 'yes',
    then: (schema) => schema.required('Graduation Status is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  graduation_college: Yup.string().when('has_graduation', {
    is: 'yes',
    then: (schema) => schema.required('College/University is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  graduation_subject: Yup.string().when('has_graduation', {
    is: 'yes',
    then: (schema) => schema.required('Graduation Subject is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  graduation_year: Yup.string().when('has_graduation', {
    is: 'yes',
    then: (schema) => schema.required('Year is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  graduation_marks: Yup.string().when(['has_graduation', 'graduation_status'], {
    is: (hasGrad, status) => hasGrad === 'yes' && status === 'Completed',
    then: (schema) => schema.required('Marks are required'),
    otherwise: (schema) => schema.notRequired(),
  }),

  // Post Graduation Validation
  has_post_graduation: Yup.string().required('Please select if you have Post Graduation'),

  post_graduation_status: Yup.string().when('has_post_graduation', {
    is: 'yes',
    then: (schema) => schema.required('PG Status is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  post_graduation_college: Yup.string().when('has_post_graduation', {
    is: 'yes',
    then: (schema) => schema.required('PG College/University is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  post_graduation_subject: Yup.string().when('has_post_graduation', {
    is: 'yes',
    then: (schema) => schema.required('PG Subject is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  post_graduation_year: Yup.string().when(['has_post_graduation', 'post_graduation_status'], {
    is: (hasPG, status) => hasPG === 'yes' && status === 'Completed',
    then: (schema) => schema.required('PG Year is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  post_graduation_marks: Yup.string().when(['has_post_graduation', 'post_graduation_status'], {
    is: (hasPG, status) => hasPG === 'yes' && status === 'Completed',
    then: (schema) => schema.required('Marks are required'),
    otherwise: (schema) => schema.notRequired(),
  }),

  // Extra Qualification Validation
  has_extra_qualification: Yup.string().required('Please select if you have Extra Qualification'),

  extra_qualification_name: Yup.string().when('has_extra_qualification', {
    is: 'yes',
    then: (schema) => schema.required('Qualification is required'),
    otherwise: (schema) => schema.notRequired(),
  }),

  professional: Yup.object().shape({
    years_of_experience: Yup.string().required('Experience is required'),
    preferred_classes: Yup.array().min(1, 'Select at least one class'),
    boards_can_teach: Yup.array().min(1, 'Select at least one board'),
    teaching_mode: Yup.array().min(1, 'Select at least one mode'),
    teaching_in_school: Yup.string().required('Teaching in school status is required'),
    school_name: Yup.string().nullable(),
    english_proficiency: Yup.string().required('English proficiency is required'),
    travel_mode: Yup.array().min(1, 'Select at least one travel mode'),
    other_bureau_registered: Yup.string().required('Bureau registration status is required'),
  }),
});

const docsSchema = Yup.object().shape({
  // Documents
  photo_url: Yup.string().required('Photo is required'),
  id_proof_type: Yup.string().required('ID Proof Type is required'),
  class_10_certificate_url: Yup.string().required('Class 10 Certificate is required'),
  highest_qualification_marksheet_url: Yup.string().when(['has_diploma', 'has_graduation', 'has_post_graduation'], {
    is: (has_diploma, has_graduation, has_post_graduation) => has_diploma === 'yes' || has_graduation === 'yes' || has_post_graduation === 'yes',
    then: (schema) => schema.required('Highest Qualification Marksheet is required for higher education.'),
    otherwise: (schema) => schema.nullable(),
  }),
  
  // Conditional Validation for ID Proof
  id_proof_url: Yup.string().nullable().when('id_proof_type', {
    is: (val) => val !== 'Aadhaar',
    then: (schema) => schema.required('ID Proof document is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  aadhaar_front_image: Yup.string().nullable().when('id_proof_type', {
    is: 'Aadhaar',
    then: (schema) => schema.required('Front image is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  aadhaar_back_image: Yup.string().nullable().when('id_proof_type', {
    is: 'Aadhaar',
    then: (schema) => schema.required('Back image is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const agreementSchema = Yup.object().shape({
  // Consent
  consent_personal_data: Yup.boolean().oneOf([true], 'You must consent to data processing'),
  agree_terms: Yup.boolean().oneOf([true], 'You must agree to the terms'),
});

const initialValues = {
  full_name: '',
  preferred_name: '',
  whatsapp_number: '',
  alternate_mobile: '',
  father_name: '',
  date_of_birth: '',
  marital_status: '',
  gender: '',
  religion: '',
  category: '',
  temporary_address: '',
  permanent_address: '',
  main_location: '',
  same_as_temp: false,
  areas_served: [], // Changed to array for multi-select
  id_proof_type: 'Aadhaar',
  id_proof_number: '',
  id_proof_url: '',
  aadhaar_single_file: '',
  aadhaar_front_image: '',
  aadhaar_back_image: '',
  class_10_certificate_url: '',
  highest_qualification_marksheet_url: '',
  // New Structured Education Fields
  photo_url: '',
  class_10_board: '',
  class_10_school: '',
  class_10_year: '',
  class_10_marks: '',
  has_class_12: 'no',
  class_12_board: '',
  class_12_school: '',
  class_12_year: '',
  class_12_marks: '',
  class_12_subject: '',
  has_diploma: 'no',
  diploma_board: '',
  diploma_year: '',
  diploma_marks: '',
  diploma_subject: '',
  has_graduation: 'no',
  graduation_status: '',
  graduation_college: '',
  graduation_year: '',
  graduation_subject: '',
  graduation_marks: '',
  has_post_graduation: 'no',
  post_graduation_status: '',
  post_graduation_college: '',
  post_graduation_year: '',
  post_graduation_subject: '',
  post_graduation_marks: '',
  has_extra_qualification: 'no',
  extra_qualification_name: '',
  professional: {
    years_of_experience: '',
    subjects_can_teach: [],
    boards_can_teach: [],
    teaching_mode: [],
    preferred_classes: [],
    teaching_in_school: 'no',
    school_name: '',
    english_proficiency: '',
    travel_mode: [],
    other_bureau_registered: ''
  },
  criminal_record: 'No',
  consent_personal_data: false,
  agree_terms: false,
  setup_completed: false,
  student_name: '',
  tuition_no: '',
  demo_date: '',
  discount_percentage: 0
};

// --- Helper Components ---

const FileUpload = ({ label, name, setFieldValue, value, accept, supportedFormats, onUploadStart, onUploadEnd }) => {
  const [uploading, setUploading] = useState(false);
  const [viewUrl, setViewUrl] = useState(null);
  const allowedFormats = supportedFormats || SUPPORTED_FORMATS;
  const acceptAttribute = accept || ".jpg,.jpeg,.png,.pdf";

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!allowedFormats.includes(file.type)) {
      uiNotify.alert('Unsupported file format.');
      return;
    }
    if (file.size > FILE_SIZE_LIMIT) {
      uiNotify.alert('File size too large. Max 5MB.');
      return;
    }

    setUploading(true);
    if (onUploadStart) onUploadStart();
    try {
      const fileExt = file.name.split('.').pop();
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id || `anon_${Math.random().toString(36).substring(7)}`;
      const fileName = `${Math.random().toString(36).substring(7)}_${Date.now()}.${fileExt}`;
      const filePath = `registration-docs/${uid}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('teacher-verification')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Store object path; signed URL creation will be handled when displaying/downloading
      setFieldValue(name, filePath);
    } catch (error) {
      // Upload error
      uiNotify.alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (onUploadEnd) onUploadEnd();
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!value) { if (mounted) setViewUrl(null); return; }
      if (String(value).startsWith('http')) { if (mounted) setViewUrl(value); return; }
      try {
        const signed = await getSignedUrl(value);
        if (mounted) setViewUrl(signed || null);
      } catch (e) {
        if (mounted) setViewUrl(null);
      }
    })();
    return () => { mounted = false; };
  }, [value]);

  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>
      <div className="flex items-center gap-4">
        <input 
          type="file" 
          accept={acceptAttribute}
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={uploading}
        />
        {uploading && <span className="text-xs text-blue-600 animate-pulse">Uploading...</span>}
      </div>
      {value && (
        <div className="mt-2 text-xs text-green-600 font-bold flex items-center gap-3">
          <span>✓ Uploaded</span>
          <a href={viewUrl || '#'} target="_blank" rel="noopener noreferrer" className="underline ml-1">View</a>
          <div className="w-8 h-8 rounded overflow-hidden">
            <SignedImg path={value} className="w-8 h-8 object-cover" alt="preview" />
          </div>
        </div>
      )}
      <ErrorMessage name={name} component="div" className="text-red-500 text-xs mt-1" />
    </div>
  );
};

const AddressHandler = () => {
  const { values, setFieldValue } = useFormikContext();
  
  useEffect(() => {
    if (values.same_as_temp) {
      setFieldValue('permanent_address', values.temporary_address);
    }
  }, [values.same_as_temp, values.temporary_address, setFieldValue]);

  return null;
};

const AutoSave = () => {
  const { values } = useFormikContext();
  useEffect(() => {
    localStorage.setItem('teacher_reg_draft', JSON.stringify(values));
  }, [values]);
  return null;
};

// --- Main Component ---

const TeacherRegistrationForm = ({ onSubmitSuccess, activeSection = 'form', submitLabel }) => {
  const [loadedDraft, setLoadedDraft] = useState(null);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [myApplications, setMyApplications] = useState([]);
  const [activeUploads, setActiveUploads] = useState(0);
  const [locations, setLocations] = useState([]);
  const [areaSearch, setAreaSearch] = useState('');
  const [mainLocationSearch, setMainLocationSearch] = useState('');

  const handleUploadStart = () => setActiveUploads(prev => prev + 1);
  const handleUploadEnd = () => setActiveUploads(prev => Math.max(0, prev - 1));

  // Dynamic Validation Schema based on active section
  const currentValidationSchema = useMemo(() => {
    switch (activeSection) {
      case 'form': return formSchema;
      case 'docs': return docsSchema;
      case 'agreement': return agreementSchema;
      default: return Yup.object();
    }
  }, [activeSection]);

  // Fetch Locations
  useEffect(() => {
    const fetchLocations = async () => {
      const { data } = await supabase.from('locations').select('*').order('location_name');
      if (data) setLocations(data);
    };
    fetchLocations();
  }, []);

  // Fetch existing data from DB to populate form
  useEffect(() => {
    const fetchExistingData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const { data: details } = await supabase.from('teacher_details').select('*').eq('id', user.id).single();

      if (details || profile) {
        const mergedData = {
          ...initialValues,
          ...profile,
          ...details,
          // Robust fallbacks for critical fields to prevent "Incomplete" errors
          class_10_board: details?.class_10_board || details?.class_x_board || '',
          temporary_address: details?.temporary_address || details?.main_location || '',
          main_location: details?.main_location || '',
          whatsapp_number: details?.whatsapp_number || profile?.phone_number || '',
          areas_served: details?.areas_served ? details.areas_served.split(', ') : [],
          photo_url: details?.photo_url || '', // Ensure photo is loaded if saved previously
          
          id_proof_type: details?.id_proof_type || 'Aadhaar',
          // Reconstruct nested professional object
          professional: {
            years_of_experience: details?.years_of_experience || '',
            subjects_can_teach: details?.subjects_can_teach ? details.subjects_can_teach.split(', ') : [],
            boards_can_teach: details?.boards_can_teach ? details.boards_can_teach.split(', ') : [],
            teaching_mode: details?.teaching_mode ? details.teaching_mode.split(', ') : [],
            preferred_classes: details?.preferred_classes ? details.preferred_classes.split(', ') : [],
            teaching_in_school: details?.teaching_in_school || 'no',
            school_name: details?.school_name || '',
            english_proficiency: details?.english_proficiency || '',
            travel_mode: details?.travel_mode ? details.travel_mode.split(', ') : [],
            other_bureau_registered: details?.other_bureau_registered || ''
          }
        };
        
        // Ensure date format is YYYY-MM-DD
        if (mergedData.date_of_birth) mergedData.date_of_birth = mergedData.date_of_birth.split('T')[0];
        
        setLoadedDraft(mergedData);
      }
    };
    fetchExistingData();
  }, []);

  useEffect(() => {
    if (activeSection === 'agreement') {
      const fetchApps = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('applications')
            .select('tuition:tuitions(tuition_no, subject, student_class)')
            .eq('teacher_id', user.id);
          
          if (data) {
            const apps = data.map(d => d.tuition).filter(t => t && t.tuition_no);
            const uniqueApps = [...new Map(apps.map(item => [item['tuition_no'], item])).values()];
            setMyApplications(uniqueApps);
          }
        }
      };
      fetchApps();
    }
  }, [activeSection]);

  useEffect(() => {
    const draft = localStorage.getItem('teacher_reg_draft');
    if (draft) {
      try {
        setLoadedDraft(JSON.parse(draft));
      } catch (e) { /* Draft load error */ }
    }
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      
      // Flatten professional details for DB storage
      const professionalData = values.professional || {};
      
      // DERIVE HIGHEST QUALIFICATION (Matches DB Column 'highest_qualification')
      let highestQual = 'Class 10';
      if (values.has_class_12 === 'yes') highestQual = 'Class 12';
      if (values.has_diploma === 'yes') highestQual = 'Diploma';
      if (values.has_graduation === 'yes') highestQual = 'Graduation';
      if (values.has_post_graduation === 'yes') highestQual = 'Post Graduation';
      if (values.has_extra_qualification === 'yes') highestQual += ' + ' + values.extra_qualification_name;

      // Logic to consolidate ID proof URL
      let finalIdProofUrl = values.id_proof_url;
      if (values.id_proof_type === 'Aadhaar') {
          finalIdProofUrl = values.aadhaar_front_image || values.aadhaar_single_file;
      }

      // Check completeness: Ensure ALL documents are uploaded before marking as complete
      const hasValidIdProof = values.id_proof_type === 'Aadhaar' 
          ? ((!!values.aadhaar_front_image && !!values.aadhaar_back_image) || !!values.aadhaar_single_file)
          : !!values.id_proof_url;

      const hasHigherEducation = values.has_diploma === 'yes' || values.has_graduation === 'yes' || values.has_post_graduation === 'yes';

      const isProfileComplete = 
          !!highestQual && 
          !!values.class_10_board && 
          !!values.temporary_address && 
          !!values.whatsapp_number && 
          !!values.photo_url &&
          !!values.class_10_certificate_url &&
          // Conditionally check for the marksheet only if they have higher education
          (hasHigherEducation ? !!values.highest_qualification_marksheet_url : true) &&
          hasValidIdProof;

      if (activeSection === 'docs' && !isProfileComplete) {
          const missingFields = [];
          if (!highestQual) missingFields.push("Highest Qualification (from Education section)");
          if (!values.class_10_board) missingFields.push("Class 10 Board (from Education section)");
          if (!values.temporary_address) missingFields.push("Temporary Address (from Address section)");
          if (!values.whatsapp_number) missingFields.push("WhatsApp Number (from Basic Profile section)");
          if (!values.photo_url) missingFields.push("Profile Photo (from Identification section)");
          
          // Document checks
          if (!values.class_10_certificate_url) missingFields.push("Class 10 Certificate");
          if (hasHigherEducation && !values.highest_qualification_marksheet_url) missingFields.push("Highest Qualification Marksheet");
          if (!hasValidIdProof) missingFields.push("ID Proof (Aadhaar/Voter ID/etc)");

          const alertMessage = "Cannot Mark as Complete: Your profile is missing required information. Please go back to the 'Profile' and 'Documents' tabs and fill in the following fields:\n\n- " + missingFields.join("\n- ");
          
          uiNotify.alert(alertMessage);
          setSubmitting(false); // Re-enable button
          return; // IMPORTANT: Stop the submission
      }

      // CONSTRUCT SAFE DB PAYLOAD (Whitelist Approach)
      // This ensures we ONLY send columns that we intend to exist in the DB
      const teacherDetailsPayload = {
        id: user?.id,
        updated_at: new Date(),
        setup_completed: isProfileComplete, // Mark as complete if Profile & Docs are done (Agreement is optional for verification)
        agreement_signed: values.agree_terms === true, // Sync legacy column for backward compatibility
        documentation_status: isProfileComplete ? 'Under Review' : 'Pending',

        // 1. Personal Details
        full_name: values.full_name,
        preferred_name: values.preferred_name,
        father_name: values.father_name,
        whatsapp_number: values.whatsapp_number,
        alternate_mobile: values.alternate_mobile,
        date_of_birth: values.date_of_birth,
        marital_status: values.marital_status,
        gender: values.gender,
        religion: values.religion,
        category: values.category,
        
        // 2. Address & Location
        temporary_address: values.temporary_address,
        permanent_address: values.permanent_address,
        main_location: values.main_location,
        areas_served: values.areas_served.join(', '),

        // 3. Documents & Identity
        photo_url: values.photo_url,
        id_proof_type: values.id_proof_type,
        id_proof_number: values.id_proof_number,
        id_proof_url: finalIdProofUrl,
        aadhaar_single_file: values.aadhaar_single_file,
        aadhaar_front_image: values.aadhaar_front_image,
        aadhaar_back_image: values.aadhaar_back_image,
        class_10_certificate_url: values.class_10_certificate_url,
        highest_qualification_marksheet_url: values.highest_qualification_marksheet_url,
        
        // 4. Education
        class_x_board: values.class_10_board, // Mapped from class_10_board
        highest_qualification: highestQual,
        qualification_details: highestQual, // Redundant backup for safety
        
        class_10_board: values.class_10_board,
        class_10_school: values.class_10_school,
        class_10_year: values.class_10_year,
        class_10_marks: values.class_10_marks,

        has_class_12: values.has_class_12,
        class_12_board: values.class_12_board,
        class_12_school: values.class_12_school,
        class_12_subject: values.class_12_subject,
        class_12_year: values.class_12_year,
        class_12_marks: values.class_12_marks,

        has_diploma: values.has_diploma,
        diploma_board: values.diploma_board,
        diploma_subject: values.diploma_subject,
        diploma_year: values.diploma_year,
        diploma_marks: values.diploma_marks,

        has_graduation: values.has_graduation,
        graduation_status: values.graduation_status,
        graduation_college: values.graduation_college,
        graduation_subject: values.graduation_subject,
        graduation_year: values.graduation_year,
        graduation_marks: values.graduation_marks,

        has_post_graduation: values.has_post_graduation,
        post_graduation_status: values.post_graduation_status,
        post_graduation_college: values.post_graduation_college,
        post_graduation_subject: values.post_graduation_subject,
        post_graduation_year: values.post_graduation_year,
        post_graduation_marks: values.post_graduation_marks,

        has_extra_qualification: values.has_extra_qualification,
        extra_qualification_name: values.extra_qualification_name,

        // 5. Professional Details
        years_of_experience: professionalData.years_of_experience,
        subjects_can_teach: Array.isArray(professionalData.subjects_can_teach) ? professionalData.subjects_can_teach.join(', ') : professionalData.subjects_can_teach,
        boards_can_teach: Array.isArray(professionalData.boards_can_teach) ? professionalData.boards_can_teach.join(', ') : professionalData.boards_can_teach,
        teaching_mode: Array.isArray(professionalData.teaching_mode) ? professionalData.teaching_mode.join(', ') : professionalData.teaching_mode,
        preferred_classes: Array.isArray(professionalData.preferred_classes) ? professionalData.preferred_classes.join(', ') : professionalData.preferred_classes,
        teaching_in_school: professionalData.teaching_in_school,
        school_name: professionalData.school_name,
        english_proficiency: professionalData.english_proficiency,
        travel_mode: Array.isArray(professionalData.travel_mode) ? professionalData.travel_mode.join(', ') : professionalData.travel_mode,
        other_bureau_registered: professionalData.other_bureau_registered,

        // 6. Legal & Misc
        criminal_record: values.criminal_record,
        consent_personal_data: values.consent_personal_data,
        agree_terms: values.agree_terms,
      };

      // Extract Agreement Fields (Not for teacher_details)
      const { student_name, tuition_no, demo_date, discount_percentage } = values;

      const { error: detailsError } = await supabase
        .from('teacher_details')
        .upsert(teacherDetailsPayload);

      if (detailsError) throw detailsError;

      // Update Profile if name/phone are present (Sync with main profile)
      if (values.full_name || values.whatsapp_number) {
          const profileUpdates = {};
          if (values.full_name) profileUpdates.full_name = values.full_name;
          if (values.whatsapp_number) profileUpdates.phone_number = values.whatsapp_number;
          await supabase.from('profiles').update(profileUpdates).eq('id', user?.id);
      }

      // Save Agreement Data separately
      if (student_name || tuition_no) {
        const { error: agreementError } = await supabase
          .from('agreements')
          .insert({
            teacher_id: user?.id,
            student_name,
            tuition_no,
            demo_date: demo_date || null,
            discount_percentage
          });

        if (agreementError) throw agreementError;
      }

      localStorage.removeItem('teacher_reg_draft');
      uiNotify.alert('Registration submitted successfully!');
      if (onSubmitSuccess) onSubmitSuccess();

    } catch (error) {
      // Submission Error
      uiNotify.alert('Submission failed: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const experienceOptions = [
    "0 Months", "3 Months", "6 Months", "9 Months",
    ...Array.from({length: 20}, (_, i) => `${i + 1}`),
    "20+"
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-lg border-2 border-slate-400">
      <div className="mb-8 border-b pb-4">
        <h2 className="text-2xl font-black text-slate-800 uppercase italic">Teacher Registration</h2>
        <p className="text-sm text-slate-500">Join Varanasi's premier tuition network. Please fill all details carefully.</p>
      </div>

      <Formik
        initialValues={loadedDraft || initialValues}
        validationSchema={currentValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, isSubmitting, errors }) => (
          <Form className="space-y-8">
            <AutoSave />
            <AddressHandler />

            {activeSection === 'form' && (
            <>
            {/* 1. Primary Details */}
            <section>
              <h3 className="text-lg font-bold text-blue-900 mb-4 border-l-4 border-blue-500 pl-3">1. Basic Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label-text">Full Name *</label>
                  <Field name="full_name" className="input-field" placeholder="First Middle Last" />
                  <ErrorMessage name="full_name" component="div" className="error-text" />
                </div>
                <div>
                  <label className="label-text">Father's Name *</label>
                  <Field name="father_name" className="input-field" placeholder="Father's Name" />
                  <ErrorMessage name="father_name" component="div" className="error-text" />
                </div>
                <div>
                  <label className="label-text">WhatsApp Number *</label>
                  <Field name="whatsapp_number" className="input-field" placeholder="+91" />
                  <ErrorMessage name="whatsapp_number" component="div" className="error-text" />
                </div>
                <div>
                  <label className="label-text">Alternate Mobile Number</label>
                  <Field name="alternate_mobile" className="input-field" placeholder="+91 (Optional)" />
                  <ErrorMessage name="alternate_mobile" component="div" className="error-text" />
                </div>
                <div>
                  <label className="label-text">Date of Birth *</label>
                  <Field name="date_of_birth" type="date" className="input-field" />
                  <ErrorMessage name="date_of_birth" component="div" className="error-text" />
                </div>
                <div>
                  <label className="label-text">Marital Status *</label>
                  <Field as="select" name="marital_status" className="input-field">
                    <option value="">Select...</option>
                    <option value="Married">Married</option>
                    <option value="Unmarried">Unmarried</option>
                  </Field>
                  <ErrorMessage name="marital_status" component="div" className="error-text" />
                </div>
                <div>
                  <label className="label-text">Gender *</label>
                  <Field as="select" name="gender" className="input-field">
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </Field>
                  <ErrorMessage name="gender" component="div" className="error-text" />
                </div>
                <div>
                  <label className="label-text">Religion *</label>
                  <Field as="select" name="religion" className="input-field">
                    <option value="">Select...</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Christian">Christian</option>
                    <option value="Sikh">Sikh</option>
                    <option value="Jain">Jain</option>
                    <option value="Other">Other</option>
                  </Field>
                  <ErrorMessage name="religion" component="div" className="error-text" />
                </div>
                <div>
                  <label className="label-text">Category</label>
                  <Field as="select" name="category" className="input-field">
                    <option value="">Select...</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </Field>
                </div>
              </div>
            </section>

            {/* 2. Addresses */}
            <section>
              <h3 className="text-lg font-bold text-blue-900 mb-4 border-l-4 border-blue-500 pl-3">2. Address Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="label-text">Temporary / Current Address *</label>
                  <Field as="textarea" name="temporary_address" className="input-field h-24" placeholder="Full address with pincode" />
                  <ErrorMessage name="temporary_address" component="div" className="error-text" />
                </div>

                <div>
                  <label className="label-text">Main Location (Your Area) *</label>
                  <input 
                    type="text" 
                    placeholder="Search location..." 
                    className="w-full p-2 mb-2 bg-slate-50 border border-slate-200 rounded text-xs"
                    value={mainLocationSearch}
                    onChange={(e) => setMainLocationSearch(e.target.value)}
                  />
                  <Field as="select" name="main_location" className="input-field">
                    <option value="">Select Location...</option>
                    {locations.filter(l => l.location_name.toLowerCase().includes(mainLocationSearch.toLowerCase())).map(l => <option key={l.id} value={l.location_name}>{l.location_name}</option>)}
                  </Field>
                  <ErrorMessage name="main_location" component="div" className="error-text" />
                </div>

                <div className="md:col-span-2">
                  <label className="label-text">Areas You Can Serve (Multi-Select) *</label>
                  <input type="text" placeholder="Search areas..." className="w-full p-2 mb-2 bg-slate-50 border border-slate-200 rounded text-xs" value={areaSearch} onChange={(e) => setAreaSearch(e.target.value)} />
                  <div className="input-field h-32 overflow-y-auto grid grid-cols-2 gap-2 p-2 bg-white">
                    {locations.filter(l => l.location_name.toLowerCase().includes(areaSearch.toLowerCase())).map(l => (
                      <label key={l.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                        <Field type="checkbox" name="areas_served" value={l.location_name} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300" />
                        <span className="text-xs text-slate-700">{l.location_name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Select all areas where you can travel for home tuition.</p>
                </div>
                
                <div className="flex items-center gap-2 my-2">
                  <Field type="checkbox" name="same_as_temp" id="same_as_temp" className="w-4 h-4 text-blue-600" />
                  <label htmlFor="same_as_temp" className="text-sm font-bold text-slate-600">Permanent address is same as temporary</label>
                </div>

                <div>
                  <label className="label-text">Permanent Address *</label>
                  <Field as="textarea" name="permanent_address" className="input-field h-24" disabled={values.same_as_temp} />
                  <ErrorMessage name="permanent_address" component="div" className="error-text" />
                </div>
              </div>
            </section>
            </>
            )}

            {activeSection === 'docs' && (
            <>
            {/* 3. Documents */}
            <section>
              <h3 className="text-lg font-bold text-blue-900 mb-4 border-l-4 border-blue-500 pl-3">3. Identification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUpload 
                  label="Profile Photo *" name="photo_url" setFieldValue={setFieldValue} value={values.photo_url} 
                  onUploadStart={handleUploadStart} onUploadEnd={handleUploadEnd}
                />
                
                <div>
                  <label className="label-text">ID Proof Type *</label>
                  <Field as="select" name="id_proof_type" className="input-field mb-4">
                    <option value="Aadhaar">Aadhaar Card</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Passport">Passport</option>
                  </Field>
                  
                  {values.id_proof_type === 'Aadhaar' ? (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <label className="label-text mb-2 text-blue-800">Upload Aadhaar Photos</label>
                      <p className="text-[10px] text-slate-500 mb-4 italic font-medium">
                        Upload front and back photos separately. Ensure all details are clearly visible.
                      </p>

                      <div className="grid grid-cols-1 gap-4">
                        <FileUpload 
                          label="Aadhaar Front Side *" name="aadhaar_front_image" setFieldValue={setFieldValue} value={values.aadhaar_front_image} 
                          accept=".jpg,.jpeg,.png" supportedFormats={['image/jpg', 'image/jpeg', 'image/png']}
                          onUploadStart={handleUploadStart} onUploadEnd={handleUploadEnd}
                        />
                        <FileUpload 
                          label="Aadhaar Back Side *" name="aadhaar_back_image" setFieldValue={setFieldValue} value={values.aadhaar_back_image} 
                          accept=".jpg,.jpeg,.png" supportedFormats={['image/jpg', 'image/jpeg', 'image/png']}
                          onUploadStart={handleUploadStart} onUploadEnd={handleUploadEnd}
                        />
                      </div>
                    </div>
                  ) : (
                    <FileUpload 
                      label="Upload ID Proof *" name="id_proof_url" setFieldValue={setFieldValue} value={values.id_proof_url} 
                      onUploadStart={handleUploadStart} onUploadEnd={handleUploadEnd}
                    />
                  )}
                </div>
              </div>
            </section>

            <section className="mt-8">
              <h3 className="text-lg font-bold text-blue-900 mb-4 border-l-4 border-blue-500 pl-3">Academic Documents</h3>
              {(() => {
                const hasHigherEducation = values.has_diploma === 'yes' || values.has_graduation === 'yes' || values.has_post_graduation === 'yes';
                return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUpload 
                  label="Class X Certificate *" name="class_10_certificate_url" setFieldValue={setFieldValue} value={values.class_10_certificate_url} 
                  onUploadStart={handleUploadStart} onUploadEnd={handleUploadEnd}
                />
                <FileUpload 
                  label={`Highest Qualification Marksheet ${hasHigherEducation ? '*' : '(Optional)'}`}
                  name="highest_qualification_marksheet_url" setFieldValue={setFieldValue} value={values.highest_qualification_marksheet_url} 
                  onUploadStart={handleUploadStart} onUploadEnd={handleUploadEnd}
                />
              </div>
                );
              })()}
            </section>
            </>
            )}

            {activeSection === 'form' && (
            <>
            {/* 4. Education History */}
            <section>
              <h3 className="text-lg font-bold text-blue-900 mb-4 border-l-4 border-blue-500 pl-3">4. Education History</h3>
              
              {/* SECTION 1: Class 10th (Mandatory) */}
              <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-400 mb-6">
                <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">SECTION 1: Class 10th (Mandatory)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Class</label>
                    <input type="text" value="Class 10th" disabled className="input-field bg-slate-100 text-slate-500" />
                  </div>
                  <div>
                    <label className="label-text">Board of Examination *</label>
                    <Field as="select" name="class_10_board" className="input-field">
                      <option value="">Select Board...</option>
                      {BOARD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </Field>
                    <ErrorMessage name="class_10_board" component="div" className="error-text" />
                  </div>
                  <div>
                    <label className="label-text">School Name *</label>
                    <Field as="select" name="class_10_school" className="input-field">
                      <option value="">Select School...</option>
                      {SCHOOL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </Field>
                    <ErrorMessage name="class_10_school" component="div" className="error-text" />
                  </div>
                  <div>
                    <label className="label-text">Year of Passing *</label>
                    <Field as="select" name="class_10_year" className="input-field">
                      <option value="">Select Year...</option>
                      {YEAR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </Field>
                    <ErrorMessage name="class_10_year" component="div" className="error-text" />
                  </div>
                  <div>
                    <label className="label-text">Marks (%) *</label>
                    <Field as="select" name="class_10_marks" className="input-field">
                      <option value="">Select %...</option>
                      {MARKS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}%</option>)}
                    </Field>
                    <ErrorMessage name="class_10_marks" component="div" className="error-text" />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Class 12th (Optional) */}
              <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-400 mb-6">
                <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">SECTION 2: Class 12th Details</h4>
                <label className="label-text mb-2">Do you have Class 12th Qualification?</label>
                <div className="flex gap-6 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Field type="radio" name="has_class_12" value="yes" className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-slate-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Field type="radio" name="has_class_12" value="no" className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-slate-700">No</span>
                  </label>
                </div>

                {values.has_class_12 === 'yes' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-in fade-in">
                    <div>
                      <label className="label-text">Qualification</label>
                      <input type="text" value="Class 12th" disabled className="input-field bg-slate-100 text-slate-500" />
                    </div>
                    <div>
                      <label className="label-text">Board / Authority *</label>
                      <Field as="select" name="class_12_board" className="input-field">
                        <option value="">Select Board...</option>
                        {BOARD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </Field>
                      <ErrorMessage name="class_12_board" component="div" className="error-text" />
                    </div>
                    <div>
                      <label className="label-text">School Name *</label>
                      <Field as="select" name="class_12_school" className="input-field">
                        <option value="">Select School...</option>
                        {SCHOOL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </Field>
                      <ErrorMessage name="class_12_school" component="div" className="error-text" />
                    </div>
                    <div>
                      <label className="label-text">Stream / Subject *</label>
                      <Field as="select" name="class_12_subject" className="input-field">
                        <option value="">Select Stream...</option>
                        {CLASS_12_SUBJECTS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </Field>
                      <ErrorMessage name="class_12_subject" component="div" className="error-text" />
                    </div>
                    <div>
                      <label className="label-text">Year of Passing *</label>
                      <Field as="select" name="class_12_year" className="input-field">
                        <option value="">Select Year...</option>
                        {YEAR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </Field>
                      <ErrorMessage name="class_12_year" component="div" className="error-text" />
                    </div>
                    <div>
                      <label className="label-text">Marks (%) *</label>
                      <Field as="select" name="class_12_marks" className="input-field">
                        <option value="">Select %...</option>
                        {MARKS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}%</option>)}
                      </Field>
                      <ErrorMessage name="class_12_marks" component="div" className="error-text" />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: Diploma (Optional) */}
              <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-400 mb-6">
                <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">SECTION 3: Diploma Details</h4>
                <label className="label-text mb-2">Do you have a Diploma?</label>
                <div className="flex gap-6 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Field type="radio" name="has_diploma" value="yes" className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-slate-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Field type="radio" name="has_diploma" value="no" className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-slate-700">No</span>
                  </label>
                </div>

                {values.has_diploma === 'yes' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-in fade-in">
                    <div>
                      <label className="label-text">Qualification</label>
                      <input type="text" value="Diploma" disabled className="input-field bg-slate-100 text-slate-500" />
                    </div>
                    <div>
                      <label className="label-text">Board / Authority *</label>
                      <Field as="select" name="diploma_board" className="input-field">
                        <option value="">Select Board...</option>
                        {BOARD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </Field>
                      <ErrorMessage name="diploma_board" component="div" className="error-text" />
                    </div>
                    <div>
                      <label className="label-text">Course / Subject *</label>
                      <Field as="select" name="diploma_subject" className="input-field">
                        <option value="">Select Course...</option>
                        {DIPLOMA_SUBJECTS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </Field>
                      <ErrorMessage name="diploma_subject" component="div" className="error-text" />
                    </div>
                    <div>
                      <label className="label-text">Year of Passing *</label>
                      <Field as="select" name="diploma_year" className="input-field">
                        <option value="">Select Year...</option>
                        {YEAR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </Field>
                      <ErrorMessage name="diploma_year" component="div" className="error-text" />
                    </div>
                    <div>
                      <label className="label-text">Marks (%) *</label>
                      <Field as="select" name="diploma_marks" className="input-field">
                        <option value="">Select %...</option>
                        {MARKS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}%</option>)}
                      </Field>
                      <ErrorMessage name="diploma_marks" component="div" className="error-text" />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 4: Graduation Details */}
              <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-400 mb-6">
                <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">SECTION 4: Graduation Details</h4>
                <label className="label-text mb-2">Do you have Graduation?</label>
                <div className="flex gap-6 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Field type="radio" name="has_graduation" value="yes" className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-slate-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Field type="radio" name="has_graduation" value="no" className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-slate-700">No</span>
                  </label>
                </div>

                {values.has_graduation === 'yes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Status *</label>
                    <Field as="select" name="graduation_status" className="input-field">
                      <option value="">Select Status...</option>
                      {GRADUATION_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </Field>
                    <ErrorMessage name="graduation_status" component="div" className="error-text" />
                  </div>
                  
                  <div>
                    <label className="label-text">College/University *</label>
                    <Field as="select" name="graduation_college" className="input-field">
                      <option value="">Select College...</option>
                      {COLLEGE_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </Field>
                    <ErrorMessage name="graduation_college" component="div" className="error-text" />
                  </div>

                  <div>
                    <label className="label-text">Subject/Stream *</label>
                    <Field as="select" name="graduation_subject" className="input-field">
                      <option value="">Select Subject...</option>
                      {GRADUATION_SUBJECT_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </Field>
                    <ErrorMessage name="graduation_subject" component="div" className="error-text" />
                  </div>

                  <div>
                    <label className="label-text">Year of Passing *</label>
                    <Field as="select" name="graduation_year" className="input-field">
                      <option value="">Select Year...</option>
                      {YEAR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </Field>
                    <ErrorMessage name="graduation_year" component="div" className="error-text" />
                  </div>

                  {values.graduation_status === 'Completed' && (
                      <div>
                        <label className="label-text">Marks (%) *</label>
                        <Field as="select" name="graduation_marks" className="input-field">
                          <option value="">Select %...</option>
                          {MARKS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}%</option>)}
                        </Field>
                        <ErrorMessage name="graduation_marks" component="div" className="error-text" />
                      </div>
                  )}
                </div>
                )}
              </div>

              {/* SECTION 5: Post Graduation Details */}
              <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-400 mb-6">
                <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">SECTION 5: Post Graduation Details</h4>
                <label className="label-text mb-2">Do you have Post Graduation?</label>
                <div className="flex gap-6 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Field type="radio" name="has_post_graduation" value="yes" className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-slate-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Field type="radio" name="has_post_graduation" value="no" className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-slate-700">No</span>
                  </label>
                </div>

                {values.has_post_graduation === 'yes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Status *</label>
                    <Field as="select" name="post_graduation_status" className="input-field">
                      <option value="">Select Status...</option>
                      {GRADUATION_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </Field>
                    <ErrorMessage name="post_graduation_status" component="div" className="error-text" />
                  </div>
                  
                  <div>
                    <label className="label-text">College/University *</label>
                    <Field as="select" name="post_graduation_college" className="input-field">
                      <option value="">Select College...</option>
                      {COLLEGE_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </Field>
                    <ErrorMessage name="post_graduation_college" component="div" className="error-text" />
                  </div>

                  <div>
                    <label className="label-text">Subject/Stream *</label>
                    <Field as="select" name="post_graduation_subject" className="input-field">
                      <option value="">Select Subject...</option>
                      {POST_GRADUATION_SUBJECT_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </Field>
                    <ErrorMessage name="post_graduation_subject" component="div" className="error-text" />
                  </div>

                  {values.post_graduation_status === 'Completed' && (
                    <>
                      <div>
                        <label className="label-text">Year of Passing *</label>
                        <Field as="select" name="post_graduation_year" className="input-field">
                          <option value="">Select Year...</option>
                          {YEAR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </Field>
                        <ErrorMessage name="post_graduation_year" component="div" className="error-text" />
                      </div>
                      <div>
                        <label className="label-text">Marks (%) *</label>
                        <Field as="select" name="post_graduation_marks" className="input-field">
                          <option value="">Select %...</option>
                          {MARKS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}%</option>)}
                        </Field>
                        <ErrorMessage name="post_graduation_marks" component="div" className="error-text" />
                      </div>
                    </>
                  )}
                </div>
                )}
              </div>
            </section>
            
            {/* SECTION 6: Extra Qualification */}
            <section>
              <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-400 mb-6">
                <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">SECTION 6: Extra Qualification</h4>
                <label className="label-text mb-2">Do you have any Extra Qualification?</label>
                <div className="flex gap-6 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Field type="radio" name="has_extra_qualification" value="yes" className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-slate-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Field type="radio" name="has_extra_qualification" value="no" className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-slate-700">No</span>
                  </label>
                </div>

                {values.has_extra_qualification === 'yes' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label-text">Qualification *</label>
                      <Field as="select" name="extra_qualification_name" className="input-field">
                        <option value="">Select Qualification...</option>
                        {EXTRA_QUALIFICATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </Field>
                      <ErrorMessage name="extra_qualification_name" component="div" className="error-text" />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 7. Professional Details */}
            <section>
              <h3 className="text-lg font-bold text-blue-900 mb-4 border-l-4 border-blue-500 pl-3">7. Professional Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="label-text">Experience *</label>
                    <Field as="select" name="professional.years_of_experience" className="input-field">
                        <option value="">Select...</option>
                        {experienceOptions.map(o => <option key={o} value={o}>{o}</option>)}
                    </Field>
                    <ErrorMessage name="professional.years_of_experience" component="div" className="error-text" />
                </div>

                <div className="md:col-span-2">
                  <label className="label-text">Subjects You Can Teach (Multi-Select) *</label>
                  <input 
                    type="text" 
                    placeholder="Search subjects..." 
                    className="w-full p-2 mb-2 bg-slate-50 border border-slate-200 rounded text-xs"
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                  />
                  <div className="input-field h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-white">
                    {SUBJECT_OPTIONS.filter(s => s.toLowerCase().includes(subjectSearch.toLowerCase())).map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                        <Field type="checkbox" name="professional.subjects_can_teach" value={opt} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300" />
                        <span className="text-xs text-slate-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Select all subjects you are confident in teaching.</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="label-text">Classes You Can Teach (Multi-Select) *</label>
                  <div className="input-field grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 bg-white h-auto max-h-48 overflow-y-auto">
                    {PREFERRED_CLASSES_OPTIONS.map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                        <Field type="checkbox" name="professional.preferred_classes" value={opt} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300" />
                        <span className="text-xs text-slate-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                  <ErrorMessage name="professional.preferred_classes" component="div" className="error-text" />
                </div>

                <div className="md:col-span-2">
                  <label className="label-text">Boards You Can Teach (Multi-Select) *</label>
                  <div className="input-field grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 bg-white h-auto">
                    {BOARD_TEACHING_OPTIONS.map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                        <Field type="checkbox" name="professional.boards_can_teach" value={opt} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300" />
                        <span className="text-xs text-slate-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="label-text">Teaching Mode (Multi-Select) *</label>
                  <div className="input-field grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 bg-white h-auto">
                    {TEACHING_MODE_OPTIONS.map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                        <Field type="checkbox" name="professional.teaching_mode" value={opt} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300" />
                        <span className="text-xs text-slate-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="label-text mb-2 text-blue-800">Are you currently teaching in a school?</label>
                    <div className="flex gap-6 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <Field type="radio" name="professional.teaching_in_school" value="yes" className="w-5 h-5 text-blue-600" />
                            <span className="font-bold text-slate-700">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <Field type="radio" name="professional.teaching_in_school" value="no" className="w-5 h-5 text-blue-600" />
                            <span className="font-bold text-slate-700">No</span>
                        </label>
                    </div>
                    {values.professional.teaching_in_school === 'yes' && (
                        <div>
                            <label className="label-text">School Name (Optional)</label>
                            <Field name="professional.school_name" className="input-field" placeholder="Enter School Name" />
                            <ErrorMessage name="professional.school_name" component="div" className="error-text" />
                        </div>
                    )}
                </div>

                <div>
                    <label className="label-text">Speaking English *</label>
                    <Field as="select" name="professional.english_proficiency" className="input-field">
                        <option value="">Select Proficiency...</option>
                        {ENGLISH_PROFICIENCY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </Field>
                    <ErrorMessage name="professional.english_proficiency" component="div" className="error-text" />
                </div>

                <div>
                    <label className="label-text">Registered in Other Tuition Bureau *</label>
                    <Field as="select" name="professional.other_bureau_registered" className="input-field">
                        <option value="">Select...</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </Field>
                    <ErrorMessage name="professional.other_bureau_registered" component="div" className="error-text" />
                </div>

                <div className="md:col-span-2">
                  <label className="label-text">How Do you Travel (Multi-Select) *</label>
                  <div className="input-field grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 bg-white h-auto">
                    {TRAVEL_MODE_OPTIONS.map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                        <Field type="checkbox" name="professional.travel_mode" value={opt} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300" />
                        <span className="text-xs text-slate-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                  <ErrorMessage name="professional.travel_mode" component="div" className="error-text" />
                </div>
              </div>
            </section>
            </>
            )}

            {activeSection === 'agreement' && (
            <>
            {/* New Section: Tuition Agreement Details */}
            <section className="mb-8">
              <h3 className="text-lg font-bold text-blue-900 mb-4 border-l-4 border-blue-500 pl-3">Tuition Agreement Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label-text">Student Name</label>
                  <Field name="student_name" className="input-field" placeholder="Enter Student Name" />
                </div>
                <div>
                  <label className="label-text">Tuition No</label>
                  <Field as="select" name="tuition_no" className="input-field">
                    <option value="">Select Tuition...</option>
                    {myApplications.map(app => (
                      <option key={app.tuition_no} value={app.tuition_no}>
                        {app.tuition_no} - {app.subject} ({app.student_class})
                      </option>
                    ))}
                  </Field>
                </div>
                <div>
                  <label className="label-text">Date of Demo</label>
                  <Field name="demo_date" type="date" className="input-field" />
                </div>
                <div>
                  <label className="label-text">Discount (%) <span className="text-[10px] text-slate-400">(Admin Only)</span></label>
                  <Field name="discount_percentage" type="number" className="input-field bg-slate-100 text-slate-500 cursor-not-allowed" disabled />
                </div>
              </div>
            </section>

            {/* 8. Declarations */}
            <section className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
              <h3 className="text-lg font-bold text-yellow-800 mb-4">Declaration</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Field type="checkbox" name="consent_personal_data" className="w-5 h-5 mt-1 text-blue-600" />
                  <span className="text-sm text-slate-700">I consent to the verification of my details and storage of my documents for recruitment purposes. I understand that background checks may be conducted.</span>
                </label>
                <ErrorMessage name="consent_personal_data" component="div" className="error-text ml-8" />

                <label className="flex items-start gap-3 cursor-pointer">
                  <Field type="checkbox" name="agree_terms" className="w-5 h-5 mt-1 text-blue-600" />
                  <span className="text-sm text-slate-700">Declaration: I hereby declare that I am filling this form voluntarily and in a sound state of mind. All the information provided above is true and correct to the best of my knowledge and belief. In case any information is found to be false or misleading, I understand and agree that Param Tuition Bureau reserves the right to deny me any tuition opportunity without any claim or objection from my side.</span>
                </label>
                <ErrorMessage name="agree_terms" component="div" className="error-text ml-8" />
              </div>
            </section>
            </>
            )}

            {Object.keys(errors).length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold animate-pulse">
                ⚠️ Cannot Save: Please fix errors in {Object.keys(errors).join(', ')}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button 
                type="button" 
                className="flex-1 py-4 border-2 border-slate-200 text-slate-500 font-bold rounded-xl uppercase tracking-widest hover:bg-slate-50"
                onClick={() => uiNotify.alert('Draft saved locally!')}
              >
                Save Draft
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || activeUploads > 0}
                className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-xl uppercase tracking-widest shadow-lg hover:bg-blue-700 disabled:opacity-70"
              >
                {activeUploads > 0 ? `Uploading ${activeUploads} file(s)...` : isSubmitting ? 'Saving...' : (submitLabel || 'Submit Registration')}
              </button>
            </div>

          </Form>
        )}
      </Formik>

      <style>{`
        .label-text { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 0.25rem; }
        .input-field { width: 100%; padding: 0.75rem; background-color: #eff6ff; border: 1px solid #cbd5e1; border-radius: 0.5rem; outline: none; font-size: 0.875rem; font-weight: 500; transition: all 0.2s; }
        .input-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f6; }
        .error-text { color: #ef4444; font-size: 0.75rem; font-weight: 700; margin-top: 0.25rem; }
      `}</style>
    </div>
  );
};

export default TeacherRegistrationForm;