/**
 * eBuddie Import Utility
 * 
 * Handles importing Girl Scout eBuddie report data to sync cookie inventory.
 * eBuddie typically provides Excel (.xlsx) or CSV reports with girl names and cookie counts.
 */

import * as XLSX from 'xlsx';
import { COOKIE_TYPES, COOKIE_LABELS, CookieType } from '../lib/types';

export interface EbuddieRow {
  scoutName: string;
  username?: string;
  [cookieType: string]: number | string | undefined;
}

export interface ImportResult {
  success: boolean;
  message: string;
  data?: {
    scoutName: string;
    cookieType: CookieType;
    quantity: number;
  }[];
  errors?: string[];
}

/**
 * Parse an eBuddie report file (Excel or CSV)
 * Expected format:
 * - First column: Scout name or username
 * - Subsequent columns: Cookie types with quantities
 * - Header row with cookie names (can be full names or abbreviations)
 */
export async function parseEbuddieReport(file: File): Promise<ImportResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with header row
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: 0 });
    
    if (!jsonData || jsonData.length === 0) {
      return {
        success: false,
        message: 'No data found in file',
        errors: ['The uploaded file appears to be empty']
      };
    }

    // Parse the data
    const parsedData: { scoutName: string; cookieType: CookieType; quantity: number }[] = [];
    const errors: string[] = [];
    const headers = Object.keys(jsonData[0]);
    
    // Map eBuddie column names to our cookie types
    const cookieColumnMap = buildCookieColumnMap(headers);
    
    // Process each row (each scout)
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      // Get scout name from first column or specific name columns
      const scoutName = extractScoutName(row, headers);
      
      if (!scoutName) {
        errors.push(`Row ${i + 2}: Could not identify scout name`);
        continue;
      }
      
      // Extract cookie quantities for this scout
      for (const [column, cookieType] of Object.entries(cookieColumnMap)) {
        const value = row[column];
        const quantity = parseQuantity(value);
        
        if (quantity > 0) {
          parsedData.push({
            scoutName: scoutName.trim(),
            cookieType: cookieType as CookieType,
            quantity
          });
        }
      }
    }
    
    if (parsedData.length === 0) {
      return {
        success: false,
        message: 'No valid cookie data found in file',
        errors: ['Please check that the file contains scout names and cookie quantities']
      };
    }
    
    return {
      success: true,
      message: `Successfully parsed ${parsedData.length} inventory entries`,
      data: parsedData,
      errors: errors.length > 0 ? errors : undefined
    };
    
  } catch (error) {
    console.error('Error parsing eBuddie report:', error);
    return {
      success: false,
      message: 'Failed to parse file',
      errors: [error instanceof Error ? error.message : 'Unknown error occurred']
    };
  }
}

/**
 * Build a mapping from column headers to our cookie types
 */
function buildCookieColumnMap(headers: string[]): Record<string, CookieType> {
  const map: Record<string, CookieType> = {};
  
  // Common eBuddie column name variations
  const cookieAliases: Record<string, CookieType> = {
    // Full names
    'adventurefuls': 'Advf',
    'lemon-ups': 'LmUp',
    'lemonups': 'LmUp',
    'lemon ups': 'LmUp',
    'trefoils': 'Tre',
    'do-si-dos': 'D-S-D',
    'dosidos': 'D-S-D',
    'do si dos': 'D-S-D',
    'samoas': 'Sam',
    'caramel delites': 'Sam',
    'tagalongs': 'Tags',
    'peanut butter patties': 'Tags',
    'thin mints': 'TMint',
    'thinmints': 'TMint',
    'thin-mints': 'TMint',
    'explore mores': 'Exp',
    'exploremores': 'Exp',
    'toffee-tastic': 'Toff',
    'toffeetastic': 'Toff',
    'cookies for a cause': 'C4C',
    'cookies for cause': 'C4C',
    'donation': 'C4C',
    'donations': 'C4C',
    
    // Abbreviations
    'advf': 'Advf',
    'lmup': 'LmUp',
    'tre': 'Tre',
    'd-s-d': 'D-S-D',
    'dsd': 'D-S-D',
    'sam': 'Sam',
    'tags': 'Tags',
    'tmint': 'TMint',
    'tm': 'TMint',
    'exp': 'Exp',
    'toff': 'Toff',
    'c4c': 'C4C',
  };
  
  for (const header of headers) {
    const normalized = header.toLowerCase().trim();
    
    // Check if header matches any cookie alias
    if (cookieAliases[normalized]) {
      map[header] = cookieAliases[normalized];
    }
    
    // Also check if it matches our official labels
    for (const cookieType of COOKIE_TYPES) {
      const label = COOKIE_LABELS[cookieType].toLowerCase();
      if (normalized === label || normalized === cookieType.toLowerCase()) {
        map[header] = cookieType;
        break;
      }
    }
  }
  
  return map;
}

/**
 * Extract scout name from a row
 */
function extractScoutName(row: any, headers: string[]): string | null {
  // Try common name column variations
  const nameColumns = ['name', 'scout', 'scout name', 'girl', 'girl name', 'first name', 'username'];
  
  for (const col of nameColumns) {
    for (const header of headers) {
      if (header.toLowerCase().trim() === col) {
        const value = row[header];
        if (value && typeof value === 'string') {
          return value;
        }
      }
    }
  }
  
  // If no name column found, use first column
  const firstHeader = headers[0];
  if (firstHeader) {
    const value = row[firstHeader];
    if (value && typeof value === 'string') {
      return value;
    }
  }
  
  return null;
}

/**
 * Parse a value to a numeric quantity
 */
function parseQuantity(value: any): number {
  if (typeof value === 'number') {
    return Math.max(0, Math.floor(value));
  }
  
  if (typeof value === 'string') {
    const num = parseInt(value.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : Math.max(0, num);
  }
  
  return 0;
}

/**
 * Export to CSV format for template download
 */
export function generateTemplateCSV(): string {
  const headers = ['Scout Name', ...COOKIE_TYPES.map(ct => COOKIE_LABELS[ct])];
  return headers.join(',') + '\n';
}

/**
 * Validate that parsed data can be matched to existing scouts
 */
export function validateScoutMatches(
  parsedData: { scoutName: string; cookieType: CookieType; quantity: number }[],
  existingScouts: { id: string; name: string; username: string }[]
): { matched: Map<string, string>; unmatched: string[] } {
  const matched = new Map<string, string>(); // scoutName -> userId
  const unmatched: string[] = [];
  const uniqueNames = new Set(parsedData.map(d => d.scoutName));
  
  for (const name of uniqueNames) {
    const scout = existingScouts.find(s => 
      s.name.toLowerCase() === name.toLowerCase() ||
      s.username.toLowerCase() === name.toLowerCase()
    );
    
    if (scout) {
      matched.set(name, scout.id);
    } else {
      unmatched.push(name);
    }
  }
  
  return { matched, unmatched };
}
