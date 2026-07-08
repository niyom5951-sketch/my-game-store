"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type Donator = {
  user_id: string;
  name: string;
  total: number;
};

export default function TopDonate() {
  const [topDonators, setTopDonators] = useState<Donator[]>([]);
  const [loading, setLoading] = useState(true);

  // 🚀 1. ຟັງຊັນດຶງຂໍ້ມູນອັນດັບຈາກ View
  const fetchTopDonate = async () => {
    try {
      const { data, error } = await supabase
        .from("top_donators")
        .select("*")
        .order("total", { ascending: false });

      if (!error && data) {
        setTopDonators(data as Donator[]);
      }
    } catch (err) {
      console.error("Error fetching top donate:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopDonate();

    // 🚀 2. ລະບົບ Realtime ເມື່ອແອດມິນອັບເດດຍອດຝາກເງິນສຳເລັດ ໃຫ້ໂຫຼດອັນດັບໃໝ່ທັນທີ
    const channel = supabase
      .channel("top-donate-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "deposit_orders" },
        (payload: any) => {
          // ຖ້າມີການ INSERT ໃໝ່ແລ້ວສຳເລັດ ຫຼື UPDATE ຈາກ pending ເປັນ success
          if (payload.new && payload.new.status === "success") {
            fetchTopDonate();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return <div className="text-center py-6 text-sm text-slate-400 animate-pulse">ກຳລັງໂຫຼດອັນດັບ...</div>;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 font-custom">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-white p-2 rounded-xl text-sm shadow-sm">👑</div>
          <div>
            <h3 className="font-black text-slate-800 dark:text-white text-base">TOP DONATE</h3>
            <p className="text-[11px] text-slate-400">ອັນດັບເຕີມເງິນສູງສຸດ</p>
          </div>
        </div>

        {/* 🔴 ໄຟ Live ເພື່ອຄວາມເທ້ */}
        <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/40 px-2.5 py-0.5 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-[9px] font-black text-red-600 dark:text-red-400 tracking-wider">REALTIME</span>
        </div>
      </div>

      {/* 🏆 Podium ແທ່ນອັນດັບ */}
      <div className="grid grid-cols-3 items-end max-w-sm mx-auto gap-2 pt-8">
        
        {/* 🥈 ອັນດັບ 2 (Silver) */}
        <div className="text-center space-y-1">
          <div className="relative inline-block">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-sm font-black text-slate-700 dark:text-slate-200 border-2 border-white dark:border-slate-800 shadow mx-auto uppercase">
              {topDonators[1]?.name?.charAt(0) || "-"}
            </div>
            <span className="absolute -bottom-1 -right-1 bg-slate-400 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">2</span>
          </div>
          <div className="text-[11px] font-black text-slate-700 dark:text-slate-300 truncate max-w-[90px] mx-auto">
            {topDonators[1]?.name || "-"}
          </div>
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
            {topDonators[1]?.total ? `${topDonators[1].total.toLocaleString()} ₭` : "-"}
          </div>
          <div className="bg-gradient-to-t from-slate-100 to-slate-50 dark:from-slate-800/50 dark:to-slate-800/10 h-16 rounded-t-xl flex items-center justify-center text-[9px] font-black text-slate-400">
            SILVER
          </div>
        </div>

        {/* 🥇 ອັນດັບ 1 (Champion) */}
        <div className="text-center space-y-1 z-10 scale-105">
          <div className="relative inline-block">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-yellow-500 text-base animate-bounce">👑</div>
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-full flex items-center justify-center text-lg font-black text-white border-2 border-white dark:border-slate-800 shadow-md mx-auto uppercase">
              {topDonators[0]?.name?.charAt(0) || "-"}
            </div>
            <span className="absolute -bottom-1 -right-1 bg-amber-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">1</span>
          </div>
          <div className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[100px] mx-auto">
            {topDonators[0]?.name || "-"}
          </div>
          <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
            {topDonators[0]?.total ? `${topDonators[0].total.toLocaleString()} ₭` : "-"}
          </div>
          <div className="bg-gradient-to-t from-blue-600 to-blue-500 h-24 rounded-t-xl flex items-center justify-center text-[9px] font-black text-white shadow-md">
            CHAMPION
          </div>
        </div>

        {/* 🥉 ອັນ端ັບ 3 (Bronze) */}
        <div className="text-center space-y-1">
          <div className="relative inline-block">
            <div className="w-12 h-12 bg-amber-700/20 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-sm font-black text-amber-800 dark:text-amber-400 border-2 border-white dark:border-slate-800 shadow mx-auto uppercase">
              {topDonators[2]?.name?.charAt(0) || "-"}
            </div>
            <span className="absolute -bottom-1 -right-1 bg-amber-700 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">3</span>
          </div>
          <div className="text-[11px] font-black text-slate-700 dark:text-slate-300 truncate max-w-[90px] mx-auto">
            {topDonators[2]?.name || "-"}
          </div>
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
            {topDonators[2]?.total ? `${topDonators[2].total.toLocaleString()} ₭` : "-"}
          </div>
          <div className="bg-gradient-to-t from-amber-900/10 to-amber-900/5 dark:from-slate-800/30 dark:to-slate-800/5 h-12 rounded-t-xl flex items-center justify-center text-[9px] font-black text-amber-700/60 dark:text-amber-500/50">
            BRONZE
          </div>
        </div>

      </div>
    </div>
  );
}