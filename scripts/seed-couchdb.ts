import { articles, collections, designers } from "../lib/mockData";
import { createContentRepository } from "../lib/couchdb/repository";

async function main() {
  const repo = createContentRepository();

  console.log("Preparing CouchDB database and indexes...");
  await repo.ensureReady();

  console.log(`Seeding ${designers.length} designers...`);
  for (const designer of designers) {
    await repo.upsertDesigner(designer as unknown as Record<string, unknown>);
  }

  console.log(`Seeding ${collections.length} collections...`);
  for (const collection of collections) {
    await repo.upsertCollection(collection as unknown as Record<string, unknown>);
  }

  console.log(`Seeding ${articles.length} articles...`);
  for (const article of articles) {
    await repo.upsertArticle(article as unknown as Record<string, unknown>);
  }

  console.log("CouchDB content seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
