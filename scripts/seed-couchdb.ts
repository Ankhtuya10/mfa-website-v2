import { articles, collections, designers } from "../lib/mockData";
import { createContentRepository } from "../lib/couchdb/repository";

async function main() {
  const repo = createContentRepository();

  console.log("CouchDB өгөгдлийн сан болон индекс бэлдэж байна...");
  await repo.ensureReady();

  console.log(`${designers.length} дизайнер seed хийж байна...`);
  for (const designer of designers) {
    await repo.upsertDesigner(designer as unknown as Record<string, unknown>);
  }

  console.log(`${collections.length} цуглуулга seed хийж байна...`);
  for (const collection of collections) {
    await repo.upsertCollection(collection as unknown as Record<string, unknown>);
  }

  console.log(`${articles.length} нийтлэл seed хийж байна...`);
  for (const article of articles) {
    await repo.upsertArticle(article as unknown as Record<string, unknown>);
  }

  console.log("CouchDB content seed дууслаа.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
