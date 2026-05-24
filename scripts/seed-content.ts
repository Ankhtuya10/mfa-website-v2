import { articles, collections, designers } from "../lib/mockData";
import { createContentRepository } from "../lib/couchdb/repository";

async function main() {
  const repo = createContentRepository();

  console.log("CouchDB өгөгдлийн сан болон индекс бэлдэж байна...");
  await repo.ensureReady();

  console.log(`\n${designers.length} дизайнер seed хийж байна...`);
  for (const designer of designers) {
    const result = await repo.upsertDesigner(designer as unknown as Record<string, unknown>);
    console.log(`  ✓ ${result.name}`);
  }

  console.log(`\n${collections.length} цуглуулга seed хийж байна...`);
  for (const collection of collections) {
    const result = await repo.upsertCollection(collection as unknown as Record<string, unknown>);
    console.log(`  ✓ ${result.title} (${result.season} ${result.year})`);
  }

  console.log(`\n${articles.length} нийтлэл seed хийж байна...`);
  for (const article of articles) {
    const result = await repo.upsertArticle(article as unknown as Record<string, unknown>);
    console.log(`  ✓ ${result.title} [${result.status}]`);
  }

  console.log("\nБүх Монгол seed content амжилттай орлоо.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
