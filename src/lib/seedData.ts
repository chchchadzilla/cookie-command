
import { User, CookieType, COOKIE_TYPES, AllInventory, CookieRecord, BoothSignup } from './types';

function genPin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function genUsername(name: string): string {
  const clean = name.trim().toLowerCase().replace(/[^a-z\s]/g, '');
  const parts = clean.split(/\s+/);
  if (parts.length === 0) return 'unknown';
  const first = parts[0];
  const lastInitial = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return `${first}${lastInitial}`;
}

interface SeedGirl {
  name: string;
  level: string;
  inventory: Record<string, number>;
  totalDue: number;
  paid: number;
}

const GIRLS_DATA: SeedGirl[] = [
  { name: 'Abigail Newman', level: 'Cadette', inventory: { C4C:19, Advf:50, LmUp:15, Tre:12, 'D-S-D':14, Sam:79, Tags:45, TMint:88, Exp:41, Toff:11 }, totalDue: 2255, paid: 457 },
  { name: 'Abigail Orbach', level: 'Junior', inventory: { C4C:5, Advf:12, LmUp:12, Tre:12, 'D-S-D':12, Sam:24, Tags:12, TMint:24, Exp:24, Toff:0 }, totalDue: 822, paid: 72 },
  { name: 'Alice Ann Hardy', level: 'Brownie', inventory: { C4C:0, Advf:12, LmUp:12, Tre:12, 'D-S-D':12, Sam:12, Tags:12, TMint:12, Exp:12, Toff:0 }, totalDue: 576, paid: 0 },
  { name: 'Anna Rodriguez', level: 'Senior', inventory: { C4C:0, Advf:24, LmUp:12, Tre:24, 'D-S-D':12, Sam:72, Tags:36, TMint:120, Exp:36, Toff:12 }, totalDue: 2100, paid: 139 },
  { name: 'Avery Eichenstein', level: 'Junior', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Brooklyn Engelhart', level: 'Junior', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Camila Bermudez', level: 'Junior', inventory: { C4C:0, Advf:26, LmUp:25, Tre:26, 'D-S-D':14, Sam:62, Tags:40, TMint:62, Exp:26, Toff:0 }, totalDue: 1686, paid: 330 },
  { name: 'Elisa Friedman', level: 'Cadette', inventory: { C4C:10, Advf:13, LmUp:14, Tre:16, 'D-S-D':15, Sam:35, Tags:17, TMint:60, Exp:11, Toff:0 }, totalDue: 1146, paid: 545 },
  { name: 'Emma Gelber', level: 'Daisy', inventory: { C4C:6, Advf:14, LmUp:12, Tre:12, 'D-S-D':12, Sam:14, Tags:13, TMint:14, Exp:14, Toff:12 }, totalDue: 750, paid: 90 },
  { name: 'Emma Sisk', level: 'Ambassador', inventory: { C4C:1, Advf:15, LmUp:15, Tre:14, 'D-S-D':15, Sam:45, Tags:16, TMint:37, Exp:12, Toff:0 }, totalDue: 1020, paid: 271 },
  { name: 'Janie Louise Hardy', level: 'Brownie', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Lilliana Hart Cain', level: 'Cadette', inventory: { C4C:0, Advf:25, LmUp:13, Tre:13, 'D-S-D':12, Sam:48, Tags:26, TMint:49, Exp:38, Toff:12 }, totalDue: 1428, paid: 72 },
  { name: 'Valentina Bermudez', level: 'Junior', inventory: { C4C:0, Advf:13, LmUp:13, Tre:27, 'D-S-D':13, Sam:50, Tags:28, TMint:48, Exp:14, Toff:3 }, totalDue: 1257, paid: 189 },
  { name: 'Yaretzi Lucena', level: 'Junior', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:2, Tags:8, TMint:12, Exp:3, Toff:1 }, totalDue: 157, paid: 0 },
  { name: 'Yoltzin Tlazohtzin Lucena', level: 'Junior', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:12, Tags:0, TMint:12, Exp:0, Toff:0 }, totalDue: 144, paid: 0 },
  { name: 'Zara Andrews-Patel', level: 'Junior', inventory: { C4C:2, Advf:13, LmUp:12, Tre:12, 'D-S-D':12, Sam:38, Tags:15, TMint:51, Exp:12, Toff:12 }, totalDue: 1086, paid: 465 },
  { name: 'Abril Taina Alvarez', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Ava Simlak', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Avia Aframian', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Brixton Hampton', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Camila Alvarez', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Dylan Spector', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Ellie Basharzad', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Ellie LaMotte', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Eva Oberman', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Hanna Nicole Danho', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Hartley Gavigan', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Iva Matea Mustac', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Jolene Danho', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Leila Basharzad', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Maisie Maddux Scarlata', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Myah Aframian', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Paige Scarlata', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Peyton Slater', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Sawyer Scarlata', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Violet Gebelin', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Viviana Zazueta', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
  { name: 'Zoe Box', level: 'Daisy', inventory: { C4C:0, Advf:0, LmUp:0, Tre:0, 'D-S-D':0, Sam:0, Tags:0, TMint:0, Exp:0, Toff:0 }, totalDue: 0, paid: 0 },
];

export function generateSeedUsers(): User[] {
  const admin: User = {
    id: 'u_courtneys',
    username: 'courtneys',
    name: 'Courtney S',
    level: 'OrderCzar',
    isAdmin: true,
    isOnline: true,
    pin: 'Whatismypassword2!'
  };

  const girls: User[] = GIRLS_DATA.map(g => {
    const un = genUsername(g.name);
    return {
      id: `u_${un}`,
      username: un,
      name: g.name,
      level: g.level as any,
      isOnline: false,
      isAdmin: false,
      pin: genPin()
    };
  });

  const seen = new Set<string>();
  const deduped: User[] = [];
  for (const g of girls) {
    let un = g.username;
    if (seen.has(un)) {
      const parts = g.name.trim().toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
      un = parts[0] + (parts.length > 1 ? parts[parts.length - 1].substring(0, 3) : '2');
      g.username = un;
      g.id = `u_${un}`;
    }
    seen.add(un);
    deduped.push(g);
  }

  return [admin, ...deduped];
}

export function generateSeedInventory(users: User[]): AllInventory {
  const inv: AllInventory = {};
  for (const user of users) {
    if (user.isAdmin) continue;
    const girl = GIRLS_DATA.find(g => {
      const un = genUsername(g.name);
      return user.username.startsWith(un.substring(0, 4));
    });
    if (!girl) continue;

    const userInv: Record<string, CookieRecord> = {};
    for (const ct of COOKIE_TYPES) {
      const total = girl.inventory[ct] || 0;
      userInv[ct] = { starting: total, additional: 0, sold: 0 };
    }
    inv[user.id] = userInv;
  }
  return inv;
}

export function generateSeedInventoryForUser(userData: SeedGirl): Record<string, CookieRecord> {
  const inv: Record<string, CookieRecord> = {};
  for (const ct of COOKIE_TYPES) {
    inv[ct] = { starting: 0, additional: 0, sold: 0 };
  }
  return inv;
}

export const BOOTH_SIGNUPS: BoothSignup[] = [
  { id: 'b1', business: "Lowe's (Woodland Hills SU)", location: '8383 Topanga Cyn. Blvd. Woodland Hills, CA 91364', notes: 'Please check in with manager prior to set up.', date: '2026-02-06', startTime: '3:00pm', endTime: '4:30pm', duration: '01:30' },
  { id: 'b2', business: 'Ralphs (Canyon Star SU)', location: '10901 Ventura Studio City, CA 91604', notes: '', date: '2026-02-06', startTime: '4:00pm', endTime: '6:00pm', duration: '02:00' },
  { id: 'b3', business: 'Ralphs (Magnolia SU)', location: '14440 Burbank Blvd. Sherman Oaks, CA 91401', notes: '', date: '2026-02-07', startTime: '8:00am', endTime: '10:00am', duration: '02:00' },
  { id: 'b4', business: 'Bookstar (Canyon Star SU)', location: '12136 Ventura Blvd Studio City, CA 91604', notes: '', date: '2026-02-07', startTime: '12:00pm', endTime: '2:00pm', duration: '02:00' },
  { id: 'b5', business: 'Ralphs (Magnolia SU)', location: '14440 Burbank Blvd. Sherman Oaks, CA 91401', notes: '', date: '2026-02-07', startTime: '2:00pm', endTime: '4:00pm', duration: '02:00' },
  { id: 'b6', business: 'Home Goods (Burbank SU)', location: '683 N Victory Blvd Burbank, CA 91502', notes: 'Pop ups ok when raining', date: '2026-02-07', startTime: '4:00pm', endTime: '6:00pm', duration: '02:00' },
  { id: 'b7', business: 'Menchies (Canyon Star SU)', location: '13369 Ventura Blvd Sherman Oaks, CA 91423', notes: '', date: '2026-02-07', startTime: '4:00pm', endTime: '6:00pm', duration: '02:00' },
  { id: 'b8', business: 'Amazon Fresh (Twin Oaks SU)', location: '16325 Ventura Blvd Encino, CA 91346', notes: 'ONLY use the main entrance. Please check in with manager.', date: '2026-02-07', startTime: '6:00pm', endTime: '8:00pm', duration: '02:00' },
  { id: 'b9', business: 'Ralphs (Canyon Star SU)', location: '12842 Ventura Studio City, CA 91604', notes: '', date: '2026-02-07', startTime: '6:00pm', endTime: '8:00pm', duration: '02:00' },
  { id: 'b10', business: 'Ralphs (Canyon Star SU)', location: '12842 Ventura Studio City, CA 91604', notes: '', date: '2026-02-08', startTime: '8:00am', endTime: '10:00am', duration: '02:00' },
  { id: 'b11', business: 'Bookstar (Canyon Star SU)', location: '12136 Ventura Blvd Studio City, CA 91604', notes: '', date: '2026-02-08', startTime: '2:00pm', endTime: '4:00pm', duration: '02:00' },
  { id: 'b12', business: 'Bristol Farms (Woodland Hills SU)', location: '23379 Mulholland Dr. Woodland Hills, CA 91364', notes: 'Please do not block doorway', date: '2026-02-08', startTime: '3:00pm', endTime: '5:00pm', duration: '02:00' },
  { id: 'b13', business: 'Ralphs (Magnolia SU)', location: '14440 Burbank Blvd. Sherman Oaks, CA 91401', notes: '', date: '2026-02-08', startTime: '6:00pm', endTime: '8:00pm', duration: '02:00' },
  { id: 'b14', business: 'Ventura Woodley Building (Twin Oaks SU)', location: '16055 Ventura Blvd Encino, CA 91436', notes: 'Juniors and above only. Set up in lobby. Max 2 scouts.', date: '2026-02-10', startTime: '2:00pm', endTime: '5:00pm', duration: '03:00' },
  { id: 'b15', business: 'Ralphs (Canyon Star SU)', location: '14049 Ventura Blvd Sherman Oaks, CA 91423', notes: '', date: '2026-02-10', startTime: '6:00pm', endTime: '8:00pm', duration: '02:00' },
  { id: 'b16', business: 'Coral Café (Burbank SU)', location: '3321 Burbank Blvd Burbank, CA 91505', notes: 'Front of Restaurant on Burbank. Do not block Door', date: '2026-02-12', startTime: '4:00pm', endTime: '6:00pm', duration: '02:00' },
  { id: 'b17', business: 'Ralphs (Canyon Star SU)', location: '12842 Ventura Studio City, CA 91604', notes: '', date: '2026-02-12', startTime: '4:00pm', endTime: '6:00pm', duration: '02:00' },
  { id: 'b18', business: "Wendy's (Woodland Hills SU)", location: '22611 Ventura Blvd. Woodland Hills, CA 91364', notes: 'Please check in with manager', date: '2026-02-12', startTime: '4:00pm', endTime: '6:00pm', duration: '02:00' },
  { id: 'b19', business: 'House of Secrets (Burbank SU)', location: '1930 W Olive Ave Burbank, CA 91506', notes: '', date: '2026-02-13', startTime: '3:00pm', endTime: '5:00pm', duration: '02:00' },
  { id: 'b20', business: 'Menchies (Canyon Star SU)', location: '13369 Ventura Blvd Sherman Oaks, CA 91423', notes: '', date: '2026-02-13', startTime: '4:00pm', endTime: '6:00pm', duration: '02:00' },
  { id: 'b21', business: 'Portos (Burbank SU)', location: '3614 W Magnolia Blvd Burbank, Ca 91601', notes: 'No Pop Ups. Large Umbrellas and Clear Plastic Covers only on Rainy Days', date: '2026-02-15', startTime: '10:00am', endTime: '12:00pm', duration: '02:00' },
  { id: 'b22', business: "Lowe's (Heart of the Valley)", location: '19601 Nordoff Street Northridge, CA 91324', notes: 'Check in with Manager', date: '2026-02-15', startTime: '4:00pm', endTime: '6:00pm', duration: '02:00' },
  { id: 'b23', business: 'Ralphs (Canyon Star SU)', location: '12842 Ventura Studio City, CA 91604', notes: '', date: '2026-02-16', startTime: '4:00pm', endTime: '6:00pm', duration: '02:00' },
  { id: 'b24', business: 'Walmart Supercenter (Burbank SU)', location: '1301 N Victory Pl Burbank, CA 91502', notes: '', date: '2026-02-20', startTime: '2:00pm', endTime: '4:00pm', duration: '02:00' },
  { id: 'b25', business: 'Ralphs (Canyon Star SU)', location: '12921 Magnolia Blvd Sherman Oaks, CA 91423', notes: '', date: '2026-02-21', startTime: '10:00am', endTime: '12:00pm', duration: '02:00' },
  { id: 'b26', business: "Lowe's (Heart of the Valley)", location: '19601 Nordoff Street Northridge, CA 91324', notes: 'Check in with Manager', date: '2026-02-21', startTime: '2:00pm', endTime: '4:00pm', duration: '02:00' },
  { id: 'b27', business: 'Ralphs (Magnolia SU)', location: '14440 Burbank Blvd. Sherman Oaks, CA 91401', notes: '', date: '2026-02-22', startTime: '10:00am', endTime: '12:00pm', duration: '02:00' },
];
