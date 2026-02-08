/**
 * CookieCommand — Supabase Seed Script
 * 
 * Populates a Supabase database with:
 *   - 38 Girl Scouts + 1 Admin account (Troop 04326)
 *   - Inventory data from the GOT Reconciliation spreadsheet
 *   - 27 booth signups with real LA-area locations
 * 
 * Usage:
 *   1. Fill in your .env file with Supabase credentials
 *   2. Run: npm run seed   (or: npx tsx scripts/seed-supabase.ts)
 * 
 * This script uses the SERVICE_ROLE_KEY (not the anon key) so it can
 * bypass RLS and insert data directly.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TROOP_ID = process.env.VITE_TROOP_ID || '04326';

if (!SUPABASE_URL || SUPABASE_URL.includes('YOUR_PROJECT_ID')) {
  console.error('❌ VITE_SUPABASE_URL is not configured in .env');
  process.exit(1);
}
if (!SERVICE_ROLE_KEY || SERVICE_ROLE_KEY.includes('your-service-role')) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not configured in .env');
  console.error('   Get it from: Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ============================================================
// SEED DATA — Girl Scouts of Troop 04326
// ============================================================

const COOKIE_TYPES = ['Advf','LmUp','Tre','D-S-D','Sam','Tags','TMint','Exp','Toff','C4C'] as const;

interface SeedGirl {
  name: string;
  level: string;
  inventory: Record<string, number>;
}

const GIRLS_DATA: SeedGirl[] = [
  { name: 'Abigail Newman', level: 'Cadette', inventory: { C4C:19, Advf:50, LmUp:15, Tre:12, 'D-S-D':14, Sam:79, Tags:45, TMint:88, Exp:41, Toff:11 } },
  { name: 'Abigail Orbach', level: 'Junior', inventory: { C4C:5, Advf:12, LmUp:12, Tre:12, 'D-S-D':12, Sam:24, Tags:12, TMint:24, Exp:24, Toff:0 } },
  { name: 'Alice Ann Hardy', level: 'Brownie', inventory: { C4C:0, Advf:12, LmUp:12, Tre:12, 'D-S-D':12, Sam:12, Tags:12, TMint:12, Exp:12, Toff:0 } },
  { name: 'Anna Rodriguez', level: 'Senior', inventory: { C4C:0, Advf:24, LmUp:12, Tre:24, 'D-S-D':12, Sam:72, Tags:36, TMint:120, Exp:36, Toff:12 } },
  { name: 'Avery Eichenstein', level: 'Junior', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Brooklyn Engelhart', level: 'Junior', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Camila Bermudez', level: 'Junior', inventory: { C4C:0, Advf:26, LmUp:25, Tre:26, 'D-S-D':14, Sam:62, Tags:40, TMint:62, Exp:26, Toff:0 } },
  { name: 'Elisa Friedman', level: 'Cadette', inventory: { C4C:10, Advf:13, LmUp:14, Tre:16, 'D-S-D':15, Sam:35, Tags:17, TMint:60, Exp:11, Toff:0 } },
  { name: 'Emma Gelber', level: 'Daisy', inventory: { C4C:6, Advf:14, LmUp:12, Tre:12, 'D-S-D':12, Sam:14, Tags:13, TMint:14, Exp:14, Toff:12 } },
  { name: 'Emma Sisk', level: 'Ambassador', inventory: { C4C:1, Advf:15, LmUp:15, Tre:14, 'D-S-D':15, Sam:45, Tags:16, TMint:37, Exp:12, Toff:0 } },
  { name: 'Janie Louise Hardy', level: 'Brownie', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Lilliana Hart Cain', level: 'Cadette', inventory: { C4C:0, Advf:25, LmUp:13, Tre:13, 'D-S-D':12, Sam:48, Tags:26, TMint:49, Exp:38, Toff:12 } },
  { name: 'Valentina Bermudez', level: 'Junior', inventory: { C4C:0, Advf:13, LmUp:13, Tre:27, 'D-S-D':13, Sam:50, Tags:28, TMint:48, Exp:14, Toff:3 } },
  { name: 'Yaretzi Lucena', level: 'Junior', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:2, Tags:8, TMint:12, Exp:3, Toff:1 } },
  { name: 'Yoltzin Tlazohtzin Lucena', level: 'Junior', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:12, Tags:0, TMint:12, Exp:0, Toff:0 } },
  { name: 'Zara Andrews-Patel', level: 'Junior', inventory: { C4C:2, Advf:13, LmUp:12, Tre:12, 'D-S-D':12, Sam:38, Tags:15, TMint:51, Exp:12, Toff:12 } },
  { name: 'Abril Taina Alvarez', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Ava Simlak', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Avia Aframian', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Brixton Hampton', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Camila Alvarez', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Dylan Spector', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Ellie Basharzad', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Ellie LaMotte', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Eva Oberman', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Hanna Nicole Danho', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Hartley Gavigan', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Iva Matea Mustac', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Jolene Danho', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Leila Basharzad', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Maisie Maddux Scarlata', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Myah Aframian', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Paige Scarlata', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Peyton Slater', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Sawyer Scarlata', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Violet Gebelin', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Viviana Zazueta', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
  { name: 'Zoe Box', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 } },
];

const BOOTH_SIGNUPS = [
  { business: "Lowe's (Woodland Hills SU)", location: '8383 Topanga Cyn. Blvd. Woodland Hills, CA 91364', notes: 'Please check in with manager prior to set up.', date: '2026-02-06', start_time: '3:00pm', end_time: '4:30pm', duration: '01:30' },
  { business: 'Ralphs (Canyon Star SU)', location: '10901 Ventura Studio City, CA 91604', notes: '', date: '2026-02-06', start_time: '4:00pm', end_time: '6:00pm', duration: '02:00' },
  { business: 'Ralphs (Magnolia SU)', location: '14440 Burbank Blvd. Sherman Oaks, CA 91401', notes: '', date: '2026-02-07', start_time: '8:00am', end_time: '10:00am', duration: '02:00' },
  { business: 'Bookstar (Canyon Star SU)', location: '12136 Ventura Blvd Studio City, CA 91604', notes: '', date: '2026-02-07', start_time: '12:00pm', end_time: '2:00pm', duration: '02:00' },
  { business: 'Ralphs (Magnolia SU)', location: '14440 Burbank Blvd. Sherman Oaks, CA 91401', notes: '', date: '2026-02-07', start_time: '2:00pm', end_time: '4:00pm', duration: '02:00' },
  { business: 'Home Goods (Burbank SU)', location: '683 N Victory Blvd Burbank, CA 91502', notes: 'Pop ups ok when raining', date: '2026-02-07', start_time: '4:00pm', end_time: '6:00pm', duration: '02:00' },
  { business: 'Menchies (Canyon Star SU)', location: '13369 Ventura Blvd Sherman Oaks, CA 91423', notes: '', date: '2026-02-07', start_time: '4:00pm', end_time: '6:00pm', duration: '02:00' },
  { business: 'Amazon Fresh (Twin Oaks SU)', location: '16325 Ventura Blvd Encino, CA 91346', notes: 'ONLY use the main entrance. Please check in with manager.', date: '2026-02-07', start_time: '6:00pm', end_time: '8:00pm', duration: '02:00' },
  { business: 'Ralphs (Canyon Star SU)', location: '12842 Ventura Studio City, CA 91604', notes: '', date: '2026-02-07', start_time: '6:00pm', end_time: '8:00pm', duration: '02:00' },
  { business: 'Ralphs (Canyon Star SU)', location: '12842 Ventura Studio City, CA 91604', notes: '', date: '2026-02-08', start_time: '8:00am', end_time: '10:00am', duration: '02:00' },
  { business: 'Bookstar (Canyon Star SU)', location: '12136 Ventura Blvd Studio City, CA 91604', notes: '', date: '2026-02-08', start_time: '2:00pm', end_time: '4:00pm', duration: '02:00' },
  { business: 'Bristol Farms (Woodland Hills SU)', location: '23379 Mulholland Dr. Woodland Hills, CA 91364', notes: 'Please do not block doorway', date: '2026-02-08', start_time: '3:00pm', end_time: '5:00pm', duration: '02:00' },
  { business: 'Ralphs (Magnolia SU)', location: '14440 Burbank Blvd. Sherman Oaks, CA 91401', notes: '', date: '2026-02-08', start_time: '6:00pm', end_time: '8:00pm', duration: '02:00' },
  { business: 'Ventura Woodley Building (Twin Oaks SU)', location: '16055 Ventura Blvd Encino, CA 91436', notes: 'Juniors and above only. Set up in lobby. Max 2 scouts.', date: '2026-02-10', start_time: '2:00pm', end_time: '5:00pm', duration: '03:00' },
  { business: 'Ralphs (Canyon Star SU)', location: '14049 Ventura Blvd Sherman Oaks, CA 91423', notes: '', date: '2026-02-10', start_time: '6:00pm', end_time: '8:00pm', duration: '02:00' },
  { business: 'Coral Café (Burbank SU)', location: '3321 Burbank Blvd Burbank, CA 91505', notes: 'Front of Restaurant on Burbank. Do not block Door', date: '2026-02-12', start_time: '4:00pm', end_time: '6:00pm', duration: '02:00' },
  { business: 'Ralphs (Canyon Star SU)', location: '12842 Ventura Studio City, CA 91604', notes: '', date: '2026-02-12', start_time: '4:00pm', end_time: '6:00pm', duration: '02:00' },
  { business: "Wendy's (Woodland Hills SU)", location: '22611 Ventura Blvd. Woodland Hills, CA 91364', notes: 'Please check in with manager', date: '2026-02-12', start_time: '4:00pm', end_time: '6:00pm', duration: '02:00' },
  { business: 'House of Secrets (Burbank SU)', location: '1930 W Olive Ave Burbank, CA 91506', notes: '', date: '2026-02-13', start_time: '3:00pm', end_time: '5:00pm', duration: '02:00' },
  { business: 'Menchies (Canyon Star SU)', location: '13369 Ventura Blvd Sherman Oaks, CA 91423', notes: '', date: '2026-02-13', start_time: '4:00pm', end_time: '6:00pm', duration: '02:00' },
  { business: 'Portos (Burbank SU)', location: '3614 W Magnolia Blvd Burbank, Ca 91601', notes: 'No Pop Ups. Large Umbrellas and Clear Plastic Covers only on Rainy Days', date: '2026-02-15', start_time: '10:00am', end_time: '12:00pm', duration: '02:00' },
  { business: "Lowe's (Heart of the Valley)", location: '19601 Nordoff Street Northridge, CA 91324', notes: 'Check in with Manager', date: '2026-02-15', start_time: '4:00pm', end_time: '6:00pm', duration: '02:00' },
  { business: 'Ralphs (Canyon Star SU)', location: '12842 Ventura Studio City, CA 91604', notes: '', date: '2026-02-16', start_time: '4:00pm', end_time: '6:00pm', duration: '02:00' },
  { business: 'Walmart Supercenter (Burbank SU)', location: '1301 N Victory Pl Burbank, CA 91502', notes: '', date: '2026-02-20', start_time: '2:00pm', end_time: '4:00pm', duration: '02:00' },
  { business: 'Ralphs (Canyon Star SU)', location: '12921 Magnolia Blvd Sherman Oaks, CA 91423', notes: '', date: '2026-02-21', start_time: '10:00am', end_time: '12:00pm', duration: '02:00' },
  { business: "Lowe's (Heart of the Valley)", location: '19601 Nordoff Street Northridge, CA 91324', notes: 'Check in with Manager', date: '2026-02-21', start_time: '2:00pm', end_time: '4:00pm', duration: '02:00' },
  { business: 'Ralphs (Magnolia SU)', location: '14440 Burbank Blvd. Sherman Oaks, CA 91401', notes: '', date: '2026-02-22', start_time: '10:00am', end_time: '12:00pm', duration: '02:00' },
];

// ============================================================
// HELPERS
// ============================================================

function genUsername(name: string): string {
  const clean = name.trim().toLowerCase().replace(/[^a-z\s]/g, '');
  const parts = clean.split(/\s+/);
  const first = parts[0];
  const lastInitial = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return `${first}${lastInitial}`;
}

function genPin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// ============================================================
// MAIN SEED FUNCTION
// ============================================================

async function seed() {
  console.log('🍪 CookieCommand — Supabase Seed Script');
  console.log(`   Troop: ${TROOP_ID}`);
  console.log(`   Target: ${SUPABASE_URL}`);
  console.log('');

  // 1. Check if data already exists
  const { data: existingUsers } = await supabase
    .from('users')
    .select('id')
    .eq('troop_id', TROOP_ID)
    .limit(1);

  if (existingUsers && existingUsers.length > 0) {
    console.log('⚠️  Data already exists for this troop. Clearing old data first...');
    await supabase.from('audit_log').delete().eq('troop_id', TROOP_ID);
    await supabase.from('notifications').delete().eq('troop_id', TROOP_ID);
    await supabase.from('messages').delete().eq('troop_id', TROOP_ID);
    await supabase.from('trades').delete().eq('troop_id', TROOP_ID);
    await supabase.from('inventory').delete().eq('troop_id', TROOP_ID);
    await supabase.from('meetings').delete().eq('troop_id', TROOP_ID);
    await supabase.from('booths').delete().eq('troop_id', TROOP_ID);
    await supabase.from('users').delete().eq('troop_id', TROOP_ID);
    console.log('   Old data cleared.');
    console.log('');
  }

  // 2. Create admin user
  console.log('[1/3] Creating users...');
  const adminId = randomUUID();
  const adminUser = {
    id: adminId,
    username: 'courtneys',
    name: 'Courtney S',
    level: 'OrderCzar',
    is_admin: true,
    is_online: false,
    pin: 'Whatismypassword2!',
    troop_id: TROOP_ID,
  };

  // 3. Create scout users with deduplication
  const seen = new Set<string>();
  const scoutUsers: any[] = [];
  const inventoryRows: any[] = [];

  for (const girl of GIRLS_DATA) {
    let username = genUsername(girl.name);
    if (seen.has(username)) {
      const parts = girl.name.trim().toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
      username = parts[0] + (parts.length > 1 ? parts[parts.length - 1].substring(0, 3) : '2');
    }
    seen.add(username);

    const userId = randomUUID();
    scoutUsers.push({
      id: userId,
      username,
      name: girl.name,
      level: girl.level,
      is_admin: false,
      is_online: false,
      pin: genPin(),
      troop_id: TROOP_ID,
    });

    // Create inventory rows for this scout
    for (const ct of COOKIE_TYPES) {
      inventoryRows.push({
        id: randomUUID(),
        user_id: userId,
        cookie_type: ct,
        starting: girl.inventory[ct] || 0,
        additional: 0,
        sold: 0,
        troop_id: TROOP_ID,
      });
    }
  }

  // Insert all users
  const allUsers = [adminUser, ...scoutUsers];
  const { error: userError } = await supabase.from('users').insert(allUsers);
  if (userError) {
    console.error('❌ Failed to insert users:', userError.message);
    process.exit(1);
  }
  console.log(`   ✅ Created ${allUsers.length} users (1 admin + ${scoutUsers.length} scouts)`);

  // 4. Insert inventory
  console.log('[2/3] Creating inventory...');
  // Insert in batches of 100
  for (let i = 0; i < inventoryRows.length; i += 100) {
    const batch = inventoryRows.slice(i, i + 100);
    const { error } = await supabase.from('inventory').insert(batch);
    if (error) {
      console.error(`❌ Failed to insert inventory batch ${i}:`, error.message);
      process.exit(1);
    }
  }
  console.log(`   ✅ Created ${inventoryRows.length} inventory records`);

  // 5. Insert booths
  console.log('[3/3] Creating booth signups...');
  const boothRows = BOOTH_SIGNUPS.map(b => ({
    id: randomUUID(),
    ...b,
    troop_id: TROOP_ID,
  }));
  const { error: boothError } = await supabase.from('booths').insert(boothRows);
  if (boothError) {
    console.error('❌ Failed to insert booths:', boothError.message);
    process.exit(1);
  }
  console.log(`   ✅ Created ${boothRows.length} booth signups`);

  // 6. Print login credentials
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('  🍪 SEED COMPLETE — Login Credentials');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log('  ADMIN:');
  console.log(`    Username: courtneys`);
  console.log(`    Password: Whatismypassword2!`);
  console.log('');
  console.log('  SCOUTS:');
  console.log('  ─────────────────────────────────────────────');
  for (const scout of scoutUsers) {
    console.log(`    ${scout.name.padEnd(28)} → ${scout.username.padEnd(16)} PIN: ${scout.pin}`);
  }
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('  Ready! Run `npm run dev` to start the app.');
  console.log('═══════════════════════════════════════════════════');
}

seed().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
