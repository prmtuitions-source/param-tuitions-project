#!/usr/bin/env node
import fs from 'fs';
import XLSX from 'xlsx';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const EXCEL_FILE = process.env.EXCEL_FILE || './data.xlsx';
const SHEET_NAME = process.env.SHEET_NAME || null; // null -> first sheet

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function readHeadersFromExcel(path, sheetName) {
  // Normalize and ensure the path is inside the repository to avoid traversal
  const repoRoot = process.cwd();
  const resolved = path.resolve(repoRoot, path);
  if (!resolved.startsWith(repoRoot)) throw new Error('Excel path is outside repository');
  if (!fs.existsSync(resolved)) throw new Error('Excel file not found: ' + resolved);
  const wb = XLSX.readFile(resolved);
  const sheet = sheetName ? wb.Sheets[sheetName] : wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (!rows || rows.length === 0) return [];
  const headers = rows[0].map(h => (h || '').toString().trim()).filter(Boolean);
  return headers;
}

async function getTableColumns(table) {
  // Attempt to fetch one row and derive column names
  try {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      // fallthrough
    }
    if (Array.isArray(data) && data.length > 0) {
      return Object.keys(data[0]);
    }
  } catch (e) {
    // ignore
  }

  // Fallback: try information_schema via direct SQL (requires service role key)
  try {
    const sql = `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='${table}' ORDER BY ordinal_position;`;
    const resp = await supabase.rpc('pg_execute', { p_sql: sql }).catch(() => null);
    // If custom RPC not available, return empty
    if (resp && resp.data) return resp.data.map(r => r.column_name);
  } catch (e) {
    // ignore
  }
  return [];
}

function normalize(s) {
  return (s || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function scoreMatch(header, col) {
  const h = normalize(header);
  const c = normalize(col);
  if (h === c) return 100;
  if (h.replace(/ /g, '_') === c.replace(/ /g, '_')) return 95;
  if (c.includes(h) || h.includes(c)) return 80;
  const hWords = h.split(' ').filter(Boolean);
  const cWords = c.split(' ').filter(Boolean);
  const common = hWords.filter(w => cWords.includes(w)).length;
  return Math.min(70 + common * 10, 90);
}

async function suggestMapping(excelPath, table) {
  const headers = readHeadersFromExcel(excelPath, SHEET_NAME);
  if (!headers.length) {
    console.error('No headers found in Excel file.');
    return;
  }
  console.log('Found headers:', headers);

  const cols = await getTableColumns(table);
  if (!cols || cols.length === 0) console.warn('Could not discover columns for table', table, '- please provide mapping manually.');
  else console.log(`Discovered ${cols.length} columns on table '${table}':`, cols);

  const mapping = {};
  for (const h of headers) {
    let best = null;
    if (cols && cols.length) {
      const scored = cols.map(c => ({ c, score: scoreMatch(h, c) }));
      scored.sort((a,b) => b.score - a.score);
      best = scored[0];
    }
    mapping[h] = best ? best.c : null;
  }

  const outFile = `mapping_${table}.json`;
  fs.writeFileSync(outFile, JSON.stringify({ table, mapping }, null, 2));
  console.log(`Wrote mapping suggestions to ${outFile}`);
  console.table(Object.entries(mapping).map(([k,v]) => ({ header:k, suggested:v })));
}

async function main() {
  const tableArg = process.argv.find(a => a.startsWith('--table=')) || '--table=profiles';
  const table = tableArg.split('=')[1];
  // Protect EXCEL_FILE input from environment misuse
  let excelPath = EXCEL_FILE;
  if (excelPath.includes('..') || path.isAbsolute(excelPath)) {
    console.error('Refusing to use unsafe EXCEL_FILE path. Use a relative path inside the repo.');
    process.exit(1);
  }
  try {
    await suggestMapping(excelPath, table);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}

main();
