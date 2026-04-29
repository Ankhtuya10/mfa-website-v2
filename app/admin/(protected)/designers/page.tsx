import Link from "next/link";
import { DesignersTable } from "./DesignersTable";
import { createContentRepository } from "@/lib/couchdb/repository";

export const dynamic = "force-dynamic";

export default async function DesignersAdminPage() {
  let designers: any[] = [];

  try {
    designers = await createContentRepository().getDesigners();
  } catch {
    designers = [];
  }

  return (
    <div className="w-full">
      <header className="flex justify-between items-center mb-8 w-full">
        <h1 className="font-serif text-2xl text-[#111111]">Designers</h1>
        <Link
          href="/admin/designers/new"
          className="bg-[#0E0E0D] text-white font-sans font-bold text-[10px] tracking-[2.5px] uppercase px-5 py-2.5 hover:bg-[#2A2522] transition-colors"
        >
          Add Designer
        </Link>
      </header>

      <DesignersTable initialDesigners={designers || []} />
    </div>
  );
}
