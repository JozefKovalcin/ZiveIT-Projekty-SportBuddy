import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create test venues
  const venues = [
    {
      name: "Štadión Lokomotíva",
      description: "Moderný futbalový štadión s umelým povrchom",
      address: "Rastislavova 23",
      city: "Košice",
      latitude: 48.7164,
      longitude: 21.2611,
      sportTypes: ["FOOTBALL", "RUNNING"],
      amenities: ["parking", "showers", "lockers"],
      priceRange: "10-15€/hod",
      phone: "+421 55 123 4567",
    },
    {
      name: "Steel Aréna",
      description: "Multifunkčná športová hala",
      address: "Moldavská cesta 10",
      city: "Košice",
      latitude: 48.6975,
      longitude: 21.2422,
      sportTypes: ["BASKETBALL", "VOLLEYBALL", "BADMINTON"],
      amenities: ["parking", "showers", "lockers", "cafe"],
      priceRange: "15-20€/hod",
      phone: "+421 55 234 5678",
    },
    {
      name: "Tenisové kurty Anička",
      description: "Vonkajšie a kryte tenisové kurty",
      address: "Anička 12",
      city: "Košice",
      latitude: 48.7372,
      longitude: 21.2599,
      sportTypes: ["TENNIS"],
      amenities: ["parking", "showers"],
      priceRange: "12-18€/hod",
      phone: "+421 55 345 6789",
    },
    {
      name: "FitClub Gym",
      description: "Moderná posilňovňa s najnovším vybavením",
      address: "Hlavná 45",
      city: "Košice",
      latitude: 48.7214,
      longitude: 21.2581,
      sportTypes: ["GYM"],
      amenities: ["showers", "lockers", "sauna"],
      priceRange: "5-10€/vstup",
      phone: "+421 55 456 7890",
    },
    {
      name: "Plavecká hala Košice",
      description: "50m bazén s tribunou",
      address: "Trieda SNP 30",
      city: "Košice",
      latitude: 48.7098,
      longitude: 21.2451,
      sportTypes: ["SWIMMING"],
      amenities: ["parking", "showers", "lockers", "cafe"],
      priceRange: "3-5€/vstup",
      phone: "+421 55 567 8901",
    },
  ];

  for (const venue of venues) {
    const existing = await prisma.venue.findFirst({
      where: { name: venue.name },
    });

    if (!existing) {
      const created = await prisma.venue.create({
        data: venue as any,
      });
      console.log(`✓ Created venue: ${created.name}`);
    } else {
      console.log(`⊘ Skipped existing venue: ${venue.name}`);
    }
  }

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
