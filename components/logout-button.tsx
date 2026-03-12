"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      onClick={handleSignOut}
      className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-400/5 px-0"
    >
      <LogOut size={16} />
      ログアウト
    </Button>
  );
}
