import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const routes = [
  {
    routeId: "R001",
    vesselType: "Container",
    fuelType: "HFO",
    year: 2024,
    ghgIntensity: 91.0,
    fuelConsumption: 5000,
    distance: 12000,
    totalEmissions: 4500,
    isBaseline: true,
  },
  {
    routeId: "R002",
    vesselType: "BulkCarrier",
    fuelType: "LNG",
    year: 2024,
    ghgIntensity: 88.0,
    fuelConsumption: 4800,
    distance: 11500,
    totalEmissions: 4200,
    isBaseline: false,
  },
  {
    routeId: "R003",
    vesselType: "Tanker",
    fuelType: "MGO",
    year: 2024,
    ghgIntensity: 93.5,
    fuelConsumption: 5100,
    distance: 12500,
    totalEmissions: 4700,
    isBaseline: false,
  },
  {
    routeId: "R004",
    vesselType: "RoRo",
    fuelType: "HFO",
    year: 2025,
    ghgIntensity: 89.2,
    fuelConsumption: 4900,
    distance: 11800,
    totalEmissions: 4300,
    isBaseline: false,
  },
  {
    routeId: "R005",
    vesselType: "Container",
    fuelType: "LNG",
    year: 2025,
    ghgIntensity: 90.5,
    fuelConsumption: 4950,
    distance: 11900,
    totalEmissions: 4400,
    isBaseline: false,
  },
];

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.poolMember.deleteMany();
  await prisma.pool.deleteMany();
  await prisma.bankEntry.deleteMany();
  await prisma.shipCompliance.deleteMany();
  await prisma.route.deleteMany();

  for (const route of routes) {
    await prisma.route.upsert({
      where: { routeId: route.routeId },
      update: route,
      create: route,
    });
  }

  // Seed some compliance data based on the routes
  const TARGET = 89.3368;
  const ENERGY_FACTOR = 41_000;

  for (const route of routes) {
    const energy = route.fuelConsumption * ENERGY_FACTOR;
    const cb = (TARGET - route.ghgIntensity) * energy;
    await prisma.shipCompliance.upsert({
      where: { shipId_year: { shipId: route.routeId, year: route.year } },
      update: { cbGco2eq: cb },
      create: { shipId: route.routeId, year: route.year, cbGco2eq: cb },
    });
  }

  console.log("Seeding complete!");
  console.log("Routes inserted:", routes.length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
