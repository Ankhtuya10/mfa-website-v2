"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  name: string | null;
  role: string | null;
  created_at: string;
  email: string;
}

interface UsersTableProps {
  initialUsers: Profile[];
  currentUserId: string | null;
  inviteOpen?: boolean;
}

const roleStyles: Record<string, string> = {
  admin: "bg-[#111111] text-white px-2.5 py-1",
  editor:
    "bg-[#F5F2ED] text-[#555555] border border-[rgba(0,0,0,0.1)] px-2.5 py-1",
  viewer: "border border-[rgba(0,0,0,0.1)] text-[#9B9590] px-2.5 py-1",
};

const roleLabels: Record<string, string> = {
  admin: "Админ",
  editor: "Редактор",
  viewer: "Уншигч",
};

export function UsersTable({
  initialUsers,
  currentUserId,
  inviteOpen = false,
}: UsersTableProps) {
  const router = useRouter();
  const [users, setUsers] = useState<Profile[]>(initialUsers);
  const [showInvite, setShowInvite] = useState(inviteOpen);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const closeInviteModal = () => {
    setShowInvite(false);
    setInviteError("");
    router.replace("/admin/users", { scroll: false });
  };

  async function updateRole(userId: string, newRole: string) {
    if (userId === currentUserId) return;
    const previousUsers = users;
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
    );

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error || "Эрх шинэчилж чадсангүй");
      }
    } catch (error) {
      setUsers(previousUsers);
      alert(error instanceof Error ? error.message : "Эрх шинэчилж чадсангүй");
    }
  }

  async function handleInvite() {
    if (!inviteEmail) return;
    setInviting(true);
    setInviteError("");
    try {
      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Урилга илгээж чадсангүй");
      }

      const newUser: Profile = payload.user;
      setUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id)]);
      closeInviteModal();
      setInviteEmail("");
      setInviteRole("viewer");
    } catch (err) {
      console.error("Урилга илгээхэд алдаа гарлаа:", err);
      setInviteError(
        err instanceof Error ? err.message : "Урилга илгээж чадсангүй",
      );
    } finally {
      setInviting(false);
    }
  }

  return (
    <>
      <div className="bg-white border border-[rgba(0,0,0,0.08)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(0,0,0,0.1)] bg-[#F5F2ED]">
              <th className="text-left py-3 px-5 font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590]">
                Гишүүн
              </th>
              <th className="text-left py-3 px-5 font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590] w-32">
                Эрх
              </th>
              <th className="text-left py-3 px-5 font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590] w-32">
                Нэгдсэн
              </th>
              <th className="text-left py-3 px-5 font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590] w-28">
                Төлөв
              </th>
              <th className="text-left py-3 px-5 font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590] w-24">
                Үйлдэл
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-[#9B9590] font-sans text-sm"
                >
                  Багийн гишүүн олдсонгүй
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[rgba(0,0,0,0.06)] hover:bg-[#FAFAF9]"
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#B7AEA9] flex items-center justify-center">
                        <span className="font-sans font-bold text-[10px] text-[#0A0A0A]">
                          {(user.name || user.email)[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-inter text-[13px] text-[#111111] font-medium">
                          {user.name || "-"}
                        </p>
                        <p className="font-inter text-[11px] text-[#9B9590]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span
                      className={`font-sans text-[9px] tracking-[1.5px] uppercase ${roleStyles[user.role || "viewer"]}`}
                    >
                      {roleLabels[user.role || "viewer"] || "Уншигч"}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-inter text-[12px] text-[#9B9590]">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString("mn-MN", {
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </td>
                  <td className="py-4 px-5">
                    <span className="flex items-center gap-1.5 font-inter text-[12px] text-[#16A34A]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />{" "}
                      Идэвхтэй
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <select
                      value={user.role || "viewer"}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                      disabled={user.id === currentUserId}
                      className="font-sans text-[10px] tracking-[1px] uppercase border border-[rgba(0,0,0,0.1)] bg-white px-2 py-1 outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      title={
                        user.id === currentUserId
                          ? "Өөрийн эрхийг эндээс өөрчлөх боломжгүй"
                          : undefined
                      }
                    >
                      <option value="viewer">Уншигч</option>
                      <option value="editor">Редактор</option>
                      <option value="admin">Админ</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showInvite && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={closeInviteModal}
        >
          <div
            className="bg-white max-w-sm p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-xl text-[#111111] mb-6">
              Багийн гишүүн урих
            </h3>
            <input
              type="email"
              placeholder="Имэйл хаяг"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full border-b border-[rgba(0,0,0,0.15)] bg-transparent py-3 font-inter text-[15px] text-[#111111] outline-none focus:border-[#111111] mb-4"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full border-b border-[rgba(0,0,0,0.15)] bg-transparent py-3 font-inter text-[15px] text-[#111111] outline-none mb-6"
            >
              <option value="viewer">Уншигч</option>
              <option value="editor">Редактор</option>
              <option value="admin">Админ</option>
            </select>
            {inviteError && (
              <p className="mb-4 font-sans text-[11px] text-red-600">
                {inviteError}
              </p>
            )}
            <button
              onClick={handleInvite}
              disabled={inviting || !inviteEmail}
              className="w-full bg-[#111111] text-white font-sans font-bold text-[10px] tracking-[2.5px] uppercase px-5 py-2.5 hover:bg-[#333] transition-colors disabled:opacity-50"
            >
              {inviting ? "Илгээж байна..." : "Урилга илгээх"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
