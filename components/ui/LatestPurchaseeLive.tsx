"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type Purchase = {
  id: string;
  order_type: "code" | "topup";
  item_name: string;
  image_url: string;
  buyer: string;
  price: number;
  status: string;
  created_at: string;
};

export default function LatestPurchasesLive({ limit = 12 }: { limit?: number }) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInitialPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from("recent_purchases")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!error && data) {
        setPurchases(data as Purchase[]);
      }
    } catch (err) {
      console.error("General Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAndPrepend = async (id: string) => {
    const { data, error } = await supabase
      .from("recent_purchases")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      setPurchases((prev) => {
        if (prev.some((p) => p.id === data.id)) return prev;
        return [data as Purchase, ...prev].slice(0, limit);
      });
    }
  };

  useEffect(() => {
    loadInitialPurchases();

    // ຈັບຕາເບິ່ງການປ່ຽນແປງຂໍ້ມູນ (Realtime)
    const channel = supabase
      .channel("purchases-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "code_orders" },
        (payload) => {
          if (payload.new.status === "success") fetchAndPrepend(payload.new.id as string);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "topup_orders" },
        (payload) => {
          if (payload.new.status === "success") fetchAndPrepend(payload.new.id as string);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "topup_orders" },
        (payload) => {
          if (payload.new.status === "success") fetchAndPrepend(payload.new.id as string);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[28px] p-4 my-6 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 w-24 rounded-full mb-4"></div>
        <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[28px] p-4 overflow-hidden relative select-none my-6 font-custom shadow-sm">
      
      {/* 📌 ສ່ວນຫົວຂໍ້ + 🔴 ປຸ່ມ LIVE ມຸມຂວາເທິງ */}
      <div className="w-full flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-3 flex-1">
          <span className="font-black text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">
            ລາຍການຊື້ລ່າສຸດ
          </span>
          <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/80"></div>
        </div>
        
        {/* 🔥 ປຸ່ມ Live ຂວາເທິງ */}
        <div className="flex items-center gap-1.5 ml-4 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/40 px-2.5 py-0.5 rounded-full shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-[10px] font-black text-red-600 dark:text-red-400 tracking-wider">LIVE</span>
        </div>
      </div>

      {purchases.length === 0 ? (
        <div className="w-full py-2 text-center text-xs text-slate-400 dark:text-slate-500">
          ຍັງບໍ່ມີລາຍການຊື້ໃນລະບົບ
        </div>
      ) : (
        /* 🚀 Marquee ແຖບເລື່ອນໄຫຼ */
        <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused] cursor-pointer">
          {[...purchases, ...purchases].map((item, index) => {
            
            // ປ່ຽນຄຳເວົ້າຕາມທີ່ເຈົ້າຕ້ອງການ: "ເຕີມ:" ຫຼື "ຊື້:"
            const displayPrefix = item.order_type === "topup" ? "<b>ເຕີມ:</b> " : "<b>ຊື້:</b> ";

            // ກຳນົດຮູບພາບ Default ຫາກບໍ່ມີໃນລະບົບ
            let finalImageUrl = item.image_url;
            if (!finalImageUrl || finalImageUrl === "") {
              finalImageUrl = item.order_type === "topup"
                ? "https://img.icons8.com/fluent/100/vanguard-card.png"
                : "https://img.icons8.com/fluent/100/game-controller.png";
            }

            return (
              <div
                key={`${item.id}-${index}`}
                className="inline-flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 px-4 py-2.5 rounded-2xl mx-2 shadow-sm min-w-[310px]"
              >
                <img
                  src={finalImageUrl}
                  alt="product"
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200/60 dark:border-slate-700 shrink-0 bg-slate-100 p-0.5 shadow-inner"
                  onError={(e) => {
                    e.currentTarget.src = "https://img.icons8.com/fluent/100/shopping-bag.png";
                  }}
                />

                <div className="flex flex-col text-left justify-center leading-tight">
                  <span className="text-[12px] font-bold text-slate-800 dark:text-slate-100 truncate max-w-[160px]">
                    <span
                      className="text-blue-600 dark:text-blue-400 font-medium mr-1"
                      dangerouslySetInnerHTML={{ __html: displayPrefix }}
                    />
                    {item.item_name}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1">
                    ທ່ານ: <span className="text-slate-600 dark:text-slate-300 font-semibold">{item.buyer}</span>
                  </span>
                </div>

                <div className="ml-auto flex flex-col items-end justify-center pl-3 border-l border-slate-200 dark:border-slate-700">
                  <span className="text-[12px] font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {Number(item.price).toLocaleString()} ₭
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium tracking-wide mt-1">
                    {new Date(item.created_at).toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=Noto+Sans+Lao:wght@400;700;900&display=swap');
        
        .font-custom {
          font-family: 'Inter', 'Noto Sans Lao', sans-serif !important;
        }
        
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        
        .animate-marquee {
          display: flex;
          animation: marquee 35s linear infinite;
        }
      `}</style>
    </div>
  );
}