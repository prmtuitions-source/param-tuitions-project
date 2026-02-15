import fs from 'fs';
import XLSX from 'xlsx';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

dotenv.config();

// Allow env overrides via CLI flags: --file=, --url=, --key=, --sheet=
let SUPABASE_URL = process.env.SUPABASE_URL;
let SUPABASE_KEY = process.env.SUPABASE_KEY;
let EXCEL_FILE = process.env.EXCEL_FILE || './data.xlsx';
let SHEET_NAME = process.env.SHEET_NAME || 'Sheet1';

const cliFile = process.argv.find(a => a.startsWith('--file='))?.split('=')[1];
const cliUrl = process.argv.find(a => a.startsWith('--url='))?.split('=')[1];
const cliKey = process.argv.find(a => a.startsWith('--key='))?.split('=')[1];
const cliSheet = process.argv.find(a => a.startsWith('--sheet='))?.split('=')[1];

const dryRun = process.argv.includes('--dry-run');

if (cliFile) EXCEL_FILE = cliFile;
if (cliUrl) SUPABASE_URL = cliUrl;
if (cliKey) SUPABASE_KEY = cliKey;
if (cliSheet) SHEET_NAME = cliSheet;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_KEY in .env or pass via --url/--key');
  process.exit(1);
}

// Allow an explicit override when testing with anon keys
const allowAnon = process.argv.includes('--allow-anon');

function isServiceRoleKey(key) {
  try {
    const parts = key.split('.');
    if (parts.length < 2) return false;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    if (payload && (payload.role === 'service_role')) return true;
    if (payload && Array.isArray(payload.roles) && payload.roles.includes('service_role')) return true;
    if (payload && payload.app_metadata && payload.app_metadata.role === 'service_role') return true;
    return false;
  } catch (e) {
    return false;
  }
}

if (!isServiceRoleKey(SUPABASE_KEY)) {
  if (dryRun) {
    console.warn('Running in --dry-run; skipping service_role key requirement.');
  } else if (!allowAnon) {
    console.error('ERROR: The SUPABASE_KEY provided does not appear to be a service_role key.');
    console.error('This import requires a Service Role key to bypass RLS and perform upserts.');
    process.exit(1);
  } else {
    console.warn('Warning: running import with a non-service-role key because --allow-anon was passed. This may fail due to RLS.');
  }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function formatError(err) {
  if (!err) return null;
  try {
    return JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)));
  } catch (e) {
    try { return Object.assign({}, err); } catch (_) { return String(err); }
  }
}

// Single mapping updated to match your Supabase columns exactly
const TEACHER_MAPPING = {
  'Full Name': 'full_name',
  'Fathers Name': 'father_name',
  'Mobile Number': 'phone_number',
  'Whatsapp Number': 'whatsapp_number',
  'Email Address': 'email',
  'Date Of Birth': 'date_of_birth',
  'Marital Status': 'marital_status',
  'Gender': 'gender',
  'Religion': 'religion',
  'Category': 'category',
  'Temporary Address': 'temporary_address',
  'Permanent Address': 'permanent_address',
  'Class X Board': 'class_10_board',
  'Name Of School in Class 10': 'class_10_school',
  'Passing Year Class 10': 'class_10_year',
  'Marks Obtained In Class 10 ( approx )': 'class_10_marks',
  'Class 12 Stream': 'class_12_subject',
  'Name School in Class 12': 'class_12_school',
  'Passing Year Class 12': 'class_12_year',
  'Marks Obtained In Class 12 ( approx )': 'class_12_marks',
  'Graduation': 'graduation_subject',
  'Graduation Status': 'graduation_status',
  'Graduation College': 'graduation_college',
  'Passing Year Graduation': 'graduation_year',
  'Post-Graduation': 'post_graduation_subject',
  'Post-Graduation Status': 'post_graduation_status',
  'D.El.Ed/B.Ed/M.Ed': 'highest_qualification',
  'Experience': 'years_of_experience',
  'Subjects You Can Take': 'subjects_can_teach',
  'Boards You Can Take?': 'boards_can_teach',
  'Teaching Mode': 'teaching_mode',
  'Classes You Can Take': 'preferred_classes',
  'Speaking English?': 'english_proficiency',
  'How do you usually travel?': 'travel_mode',
  'Teaching in School?': 'teaching_in_school',
  'Aadhar Number': 'id_proof_number'
};

// Updated Tuition mapping to match your Supabase columns exactly
// Only map the exact columns requested by the user — ignore others
const TUITION_MAPPING = {
  'Tuition No': 'tuition_no',
  'Status': 'status',
  'Main Location': 'location_name',
  'Near By': 'nearby_landmark',
  'School': 'school_name',
  'Medium': 'medium',
  'Grade': 'student_class',
  'Subjects': 'subject',
  'Class/Week': 'classes_per_week',
  'Classes Per Week': 'classes_per_week',
  'classes_per_week': 'classes_per_week',
  'Duration in hr': 'duration_hours',
  'Timing': 'timing',
  'Teacher Gender': 'teacher_gender',
  'Fee': 'fee_amount',
  'Mode': 'teaching_mode',
  'Demands': 'specific_demands',
  'Name': 'name',
  'Source': 'source',
  //'Current Location' deliberately ignored per request
  'Date': 'preferred_demo_date',
  'Mobile Number': 'phone_number',
  'Referred To': 'referred_to',
  'Cancle Reason': 'cancel_reason',
  // Extra Excel headers mapped (we will ignore `Fraud` and `password_hash`):
  'Related TN': 'related_tn',
  'Allotted To': 'allotted_to',
  'link': 'link',
  'Contact Name': 'contact_name'
};

const IGNORE_HEADERS = [
  'Whatsapp Name',
  'Column 4',
  'Resul',
  'Current Location',
  'Aadhar Number',
  'Timestamp',
  'Declaration',
  'Column 49',
  'Profile Pic',
  'password_hash',
  'Fraud'
].map(h => h.trim().toLowerCase());

function sheetToObjects(filePath, sheetName) {
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[sheetName] || wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return rows;
}

function mapRow(row, mapping, mode = 'teacher') {
  const out = {};
  const normMap = {};
  for (const [k, v] of Object.entries(mapping)) {
    normMap[String(k).trim().toLowerCase()] = v;
  }
  for (const [header, valRaw] of Object.entries(row)) {
    const headerNorm = String(header || '').trim().toLowerCase();
    if (IGNORE_HEADERS.includes(headerNorm)) continue;
    let col = mapping[header] || normMap[headerNorm] || null;
    // Fallback: handle common header variants that may contain invisible
    // characters or slightly different wording. For safety, only "guess"
    // tuition-related columns when we're actually running in tuition mode.
    if (!col) {
      if (mode === 'tuition') {
        if (/\btuition\b|\btn\b/.test(headerNorm)) col = 'tuition_no';
        else if (/\bgrade\b|\bclass\b/.test(headerNorm)) col = 'student_class';
        else if (/\bsubject(s)?\b/.test(headerNorm)) col = 'subject';
        else if (/\bfee\b/.test(headerNorm)) col = 'fee_amount';
        else if (/\bmode\b/.test(headerNorm)) col = 'teaching_mode';
        else if (/\bdemand(s)?\b|\brequirement(s)?\b|\brequirement\b/.test(headerNorm)) col = 'specific_demands';
        else if (/\bdate\b/.test(headerNorm)) col = 'preferred_demo_date';
        else if ((headerNorm === 'status') || headerNorm.includes('tuition status') || headerNorm.includes('tuition_status')) col = 'status';
        else if (/\bmain location\b|\blocation\b/.test(headerNorm)) col = 'location_name';
        else if (/\bnear\b|\bnearby\b|\bnear by\b/.test(headerNorm)) col = 'nearby_landmark';
        else if (/\bschool\b/.test(headerNorm)) col = 'school_name';
      }
    }
    if (!col) continue;

    if (col === 'phone_number' || col === 'secondary_phone' || col === 'whatsapp_number') {
      const v = valRaw === null || valRaw === undefined ? '' : String(valRaw);
      const cleaned = v.replace(/[^0-9]/g, '');
      out[col] = cleaned === '' ? null : cleaned;
      continue;
    }

    if (col === 'years_of_experience') {
      if (valRaw === null || valRaw === undefined || valRaw === '') {
        out[col] = null;
      } else {
        out[col] = String(valRaw);
      }
      continue;
    }

    if (col === 'date_of_birth') {
      if (!valRaw) {
        out[col] = null;
      } else {
        const d = new Date(valRaw);
        if (!isNaN(d.getTime())) {
          out[col] = d.toISOString().split('T')[0];
        } else {
          out[col] = String(valRaw);
        }
      }
      continue;
    }

    if (col === 'subjects_can_teach') {
      if (!valRaw && valRaw !== 0) {
        out[col] = null;
      } else {
        const s = String(valRaw);
        const parts = s.split(/[,;\n]/).map(p => p.trim()).filter(Boolean);
        out[col] = parts.join(', ');
      }
      continue;
    }

    out[col] = valRaw === '' ? null : valRaw;
  }
  // If Excel provides only a Mobile Number, treat it as whatsapp_number too
  if (out.phone_number && !out.whatsapp_number) {
    out.whatsapp_number = out.phone_number;
  }
  return out;
}

async function upsertProfile(profile, details = null) {
  try {
    let useWhatsappColumn = true;
    let existing = null;
    if (profile.whatsapp_number) {
      const { data: wData, error: wErr } = await supabase.from('profiles').select('id').eq('whatsapp_number', profile.whatsapp_number).maybeSingle();
      if (wErr) {
        if (wErr.code === '42703' || (wErr.message && wErr.message.includes('whatsapp_number'))) {
          useWhatsappColumn = false;
          console.warn('`profiles.whatsapp_number` column not found; falling back to phone_number/email.');
        } else {
          return { ok:false, error: formatError(wErr) };
        }
      } else if (wData) {
        existing = wData;
      }
    }

    if (!existing && profile.phone_number) {
      const { data: pData, error: pErr } = await supabase.from('profiles').select('id').eq('phone_number', profile.phone_number).maybeSingle();
      if (pErr) return { ok:false, error: formatError(pErr) };
      if (pData) existing = pData;
    }
    if (!existing && profile.email) {
      const { data: eData, error: eErr } = await supabase.from('profiles').select('id').eq('email', profile.email).maybeSingle();
      if (eErr) return { ok:false, error: formatError(eErr) };
      if (eData) existing = eData;
    }

    const conflict = (useWhatsappColumn && profile.whatsapp_number) ? ['whatsapp_number'] : (profile.phone_number ? ['phone_number'] : (profile.email ? ['email'] : null));
    console.log('upsertProfile: useWhatsappColumn=', useWhatsappColumn, 'conflict=', conflict);
    console.log('upsertProfile: profile keys=', Object.keys(profile));
    if (!conflict) throw new Error('No unique key (whatsapp_number/phone/email) in row');

    // Ensure we don't attempt to write a column that doesn't exist in the DB,
    // and don't send empty/null whatsapp_number values to PostgREST (they
    // cause schema-cache lookup errors when the column is absent).
    const sanitizedProfile = { ...profile };
    // Ensure we never send an explicit id/profile_id (may be present accidentally)
    if (Object.prototype.hasOwnProperty.call(sanitizedProfile, 'id')) delete sanitizedProfile.id;
    if (Object.prototype.hasOwnProperty.call(sanitizedProfile, 'profile_id')) delete sanitizedProfile.profile_id;
    if (!useWhatsappColumn && Object.prototype.hasOwnProperty.call(sanitizedProfile, 'whatsapp_number')) {
      delete sanitizedProfile.whatsapp_number;
    }
    if (!sanitizedProfile.whatsapp_number) {
      delete sanitizedProfile.whatsapp_number;
    }

    let profileId;
    // Build explicit payloads to avoid accidentally sending an `id:null`
    const allowed = ['full_name','whatsapp_number','phone_number','email','user_role','admin_zone','updated_at'];
    const buildPayload = (src) => {
      const p = {};
      for (const k of allowed) {
        if (Object.prototype.hasOwnProperty.call(src, k)) {
          const v = src[k];
          if (v !== null && v !== undefined) p[k] = v;
        }
      }
      return p;
    };

    if (existing && existing.id) {
      const updateData = buildPayload(sanitizedProfile);
        // Defensive: ensure no id/profile_id sneaks into update payload
        if (Object.prototype.hasOwnProperty.call(updateData, 'id')) {
          console.warn('Removing id from update payload');
          delete updateData.id;
        }
        if (Object.prototype.hasOwnProperty.call(updateData, 'profile_id')) {
          delete updateData.profile_id;
        }
        console.log('Updating profile with payload keys:', Object.keys(updateData));
      const { data: profData, error: profErr } = await supabase.from('profiles').update(updateData).eq('id', existing.id).select().single();
      if (profErr) return { ok:false, error: formatError(profErr) };
      profileId = profData.id;
    } else {
      let insertData = buildPayload(sanitizedProfile);
      // If DB requires a non-null id (no default), generate one here to ensure insert succeeds
      if (!insertData.id) {
        insertData.id = randomUUID();
      }
      if (Object.prototype.hasOwnProperty.call(insertData, 'profile_id')) delete insertData.profile_id;
      console.log('Inserting profile with payload keys:', Object.keys(insertData));
      const { data: profData, error: profErr } = await supabase.from('profiles').insert([insertData]).select().single();
      if (profErr) return { ok:false, error: formatError(profErr) };
      profileId = profData.id;
    }

    if (details && Object.keys(details).length > 0) {
      const detailsRow = { id: profileId, ...details, updated_at: new Date().toISOString() };
      if (detailsRow.profile_id) delete detailsRow.profile_id;
      console.log('Upserting teacher_details row for profile id', profileId, 'full_name:', detailsRow.full_name || '(n/a)');
      const { error: detErr } = await supabase.from('teacher_details').upsert([detailsRow], { onConflict: ['id'] });
      if (detErr) return { ok:false, error: formatError(detErr) };
    }
    return { ok:true, id: profileId };
  } catch (err) {
    return { ok:false, error: err.message || err };
  }
}

async function upsertTuition(tuitionRow) {
  try {
    const sanitizedTuition = normalizeTuitionRow(tuitionRow);

    console.log(`Upserting tuition: ${sanitizedTuition.tuition_no}`);
    const conflict = ['tuition_no'];

    // Try upsert; if PostgREST reports a missing column (PGRST204), remove
    // that column from payload and retry once. This handles optional columns
    // like `allotted_to` that may not exist in every DB schema.
    let attempts = 0;
    let lastErr = null;
    while (attempts < 3) {
      const { error } = await supabase
        .from('tuitions')
        .upsert([sanitizedTuition], { onConflict: conflict });
      if (!error) return { ok: true };
      lastErr = error;
      // Detect missing-column schema cache error and extract column name
      const msg = error.message || '';
      const m = msg.match(/Could not find the '([^']+)' column/);
      if (m && m[1]) {
        const missingCol = m[1];
        if (Object.prototype.hasOwnProperty.call(sanitizedTuition, missingCol)) {
          console.warn(`Schema missing column '${missingCol}'; removing from payload and retrying.`);
          delete sanitizedTuition[missingCol];
          attempts++;
          continue;
        }
      }
      break;
    }
    return { ok: false, error: formatError(lastErr) };
  } catch (err) {
    return { ok: false, error: err.message || err };
  }
}

function normalizeTuitionRow(tuitionRow) {
  const sanitizedTuition = { ...tuitionRow };

  // Choose a reliable tuition_no: prefer explicit tuition_no, then related_tn,
  // otherwise generate an AUTO id. Also validate common TN pattern.
  const candidate = (sanitizedTuition.tuition_no || sanitizedTuition.related_tn || '').toString().trim();
  const isValidTN = /^[Tt][Nn]\d+/.test(candidate);
  if (candidate && isValidTN) {
    sanitizedTuition.tuition_no = candidate;
  } else if (candidate && !isValidTN) {
    sanitizedTuition.tuition_no = `AUTO-${randomUUID()}`;
    console.warn('tuition_no present but does not match TN pattern, generated AUTO id instead:', candidate);
  } else {
    sanitizedTuition.tuition_no = `AUTO-${randomUUID()}`;
    console.warn('No tuition_no/related_tn found — generated', sanitizedTuition.tuition_no);
  }

  // 1. Convert "Demands" string into an Array for specific_demands column
  if (sanitizedTuition.specific_demands) {
    sanitizedTuition.specific_demands = String(sanitizedTuition.specific_demands)
      .split(/[,;\n]/)
      .map(p => p.trim())
      .filter(Boolean);
  }

  // 2. Ensure Date is in YYYY-MM-DD format
  if (sanitizedTuition.preferred_demo_date) {
    const pd = sanitizedTuition.preferred_demo_date;
    let parsedDate = null;
    if (typeof pd === 'number' || (/^\d+$/.test(String(pd)))) {
      const serial = Number(pd);
      if (!isNaN(serial) && serial > 2000) {
        const utcDays = serial - 25569;
        const utcMs = Math.round(utcDays * 86400 * 1000);
        parsedDate = new Date(utcMs);
      }
    }
    if (!parsedDate) {
      const d = new Date(pd);
      if (!isNaN(d.getTime())) parsedDate = d;
    }
    if (parsedDate && !isNaN(parsedDate.getTime())) {
      sanitizedTuition.preferred_demo_date = parsedDate.toISOString().split('T')[0];
    } else {
      sanitizedTuition.preferred_demo_date = pd;
    }
  }

  // 3. Status normalization — map various incoming values to the
  // database CHECK set (open, demo_allotted, confirmed, closed).
  if (sanitizedTuition.status) {
    const sRaw = String(sanitizedTuition.status).toLowerCase().trim();
    let mapped = 'open';
    if (/cancel|cancelled|closed|withdrawn|rejected/.test(sRaw)) mapped = 'closed';
    else if (/demo|demo_allotted|allot|allotted/.test(sRaw)) mapped = 'demo_allotted';
    else if (/confirm|confirmed/.test(sRaw)) mapped = 'confirmed';
    else if (/open|new|pending/.test(sRaw)) mapped = 'open';
    else mapped = 'open';
    sanitizedTuition.status = mapped;
  }

  // 4. Parse fee_amount into a numeric value (handle ranges, currency, commas)
  if (sanitizedTuition.fee_amount !== null && sanitizedTuition.fee_amount !== undefined) {
    try {
      const raw = String(sanitizedTuition.fee_amount).trim();
      // remove common currency symbols and commas
      const cleaned = raw.replace(/₹|\u20B9|,|\s+/g, '');
      // range like 4000-5000 or 4000 to 5000
      const rangeMatch = cleaned.match(/(-?\d+(?:\.\d+)?)[\-–to]+(-?\d+(?:\.\d+)?)/i);
      if (rangeMatch) {
        const a = parseFloat(rangeMatch[1]);
        const b = parseFloat(rangeMatch[2]);
        if (!isNaN(a) && !isNaN(b)) sanitizedTuition.fee_amount = (a + b) / 2;
        else sanitizedTuition.fee_amount = null;
      } else {
        const numMatch = cleaned.match(/-?\d+(?:\.\d+)?/);
        if (numMatch) {
          const n = parseFloat(numMatch[0]);
          sanitizedTuition.fee_amount = isNaN(n) ? null : n;
        } else {
          sanitizedTuition.fee_amount = null;
        }
      }
    } catch (e) {
      sanitizedTuition.fee_amount = null;
    }
  }

  // Move wa.me links from admin_zone to `link` if present
  if (sanitizedTuition.admin_zone && typeof sanitizedTuition.admin_zone === 'string') {
    const v = sanitizedTuition.admin_zone.trim();
    if (/https?:\/\/wa\.me\//i.test(v) || /wa\.me\//i.test(v)) {
      sanitizedTuition.link = v;
      delete sanitizedTuition.admin_zone;
    }
  }

  return sanitizedTuition;
}

async function importExcel(mode = 'teacher') {
  const rows = sheetToObjects(EXCEL_FILE, SHEET_NAME);
  console.log(`Read ${rows.length} rows from ${EXCEL_FILE}`);
  const results = [];
  for (const r of rows) {
    if (mode === 'teacher' || mode === 'parent') {
      const mapped = mapRow(r, TEACHER_MAPPING, mode);
      const profile = {
        full_name: mapped.full_name || null,
        whatsapp_number: mapped.whatsapp_number || null,
        phone_number: mapped.phone_number || null,
        email: mapped.email || null,
        user_role: (mode === 'teacher' ? 'teacher' : (mapped.user_role || 'parent')),
        admin_zone: mapped.admin_zone || 'Admin 1',
        updated_at: new Date().toISOString()
      };
      const details = { ...mapped };
      delete details.whatsapp_number;
      delete details.phone_number;
      delete details.email;
      // Remove tuition-only fields that don't belong on teacher_details
      if (Object.prototype.hasOwnProperty.call(details, 'fee_amount')) delete details.fee_amount;

      console.log('Processing teacher:', profile.full_name || profile.phone_number || profile.email || '(no id)');
      if (dryRun) {
        results.push({ profile: profile.full_name || profile.phone_number || profile.email, res: { ok: 'dry-run', profile, details } });
      } else {
        const res = await upsertProfile(profile, details);
        results.push({ profile: profile.full_name || profile.phone_number || profile.email, res });
      }
    } else if (mode === 'tuition') {
      // Updated Tuition logic
      const tuitionData = mapRow(r, TUITION_MAPPING, mode);
      const normalized = normalizeTuitionRow(tuitionData);
      if (dryRun) {
        results.push({ tuition_no: normalized.tuition_no || '(no id)', res: { ok: 'dry-run', tuitionData: normalized } });
      } else {
        const res = await upsertTuition(tuitionData);
        results.push({ tuition_no: normalized.tuition_no || '(no id)', res });
      }
    }
    await new Promise(s => setTimeout(s, 50));
  }
  return results;
}

const arg = process.argv.find(a => a.startsWith('--mode=')) || '--mode=teacher';
const mode = arg.split('=')[1];

// If mode is tuition and the user provided a separate tuition file via env,
// prefer it unless an explicit --file was passed on the CLI.
if (!cliFile && mode === 'tuition' && process.env.EXCEL_TUITION_FILE) {
  EXCEL_FILE = process.env.EXCEL_TUITION_FILE;
}

// Now validate the selected excel file exists
if (!fs.existsSync(EXCEL_FILE)) {
  console.error('Excel file not found:', EXCEL_FILE);
  process.exit(1);
}

importExcel(mode).then(res => {
  console.log('Done. Results sample:\n', JSON.stringify(res.slice(0,5), null, 2));
  // Allow pending handles to close cleanly on Windows (avoids libuv assertion)
  setTimeout(() => process.exit(0), 100);
}).catch(err => {
  console.error('Import error', formatError(err) || err);
  setTimeout(() => process.exit(1), 100);
});