"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [city, setCity] = useState("");

  return (
    <form
      className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/60 p-3 shadow-2xl shadow-cyan-950/20 backdrop-blur md:grid-cols-[1fr_220px_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        const params = new URLSearchParams();
        if (keyword) params.set("keyword", keyword);
        if (city) params.set("city", city);
        router.push(`/jobs?${params.toString()}`);
      }}
    >
      <div className="relative">
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Job title, skill, company"
          className="h-12 rounded-2xl border-0 bg-white/5 pl-10"
        />
      </div>
      <Input
        value={city}
        onChange={(event) => setCity(event.target.value)}
        placeholder="City or location"
        className="h-12 rounded-2xl border-0 bg-white/5"
      />
      <Button className="h-12 rounded-2xl px-6">Find Jobs</Button>
    </form>
  );
}
