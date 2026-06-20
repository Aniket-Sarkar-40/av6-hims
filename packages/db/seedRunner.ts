import "dotenv/config";

console.log("🚀 Seed runner started");

const seedMap: Record<string, () => Promise<any>> = {
  core: async () => (await import("./src/seeder/core.seed")).runSeed(),
  pms: async () => (await import("./src/seeder/pharmacy.seed")).runSeed(),
  opd: async () => (await import("./src/seeder/opd.seed")).runSeed(),
  inv: async () => (await import("./src/seeder/inventory.seed")).runSeed(),
  acc: async () => (await import("./src/seeder/accounting.seed")).runSeed(),
};

async function run() {
  try {
    const seeds = process.argv.slice(2);

    if (!seeds.length) {
      console.log("❌ No seed provided");
      process.exit(1);
    }

    for (const seed of seeds) {
      const runner = seedMap[seed];

      if (!runner) {
        console.log(`❌ Unknown seed: ${seed}`);
        continue;
      }

      console.log(`🌱 Running ${seed.toUpperCase()} seed...`);
      await runner();
      console.log(`✅ ${seed.toUpperCase()} done\n`);
    }

    console.log("🎉 ALL SEEDS COMPLETED");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

run();
