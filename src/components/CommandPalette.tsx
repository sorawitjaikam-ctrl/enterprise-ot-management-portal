import React, { useState, useEffect, useRef } from "react";
import { Search, ArrowRight, FileText, Settings, LayoutDashboard, Calendar } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (action: string, payload?: any) => void;
}

export default function CommandPalette({ isOpen, onClose, onSelectOption }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const options = [
    { id: "goto-dashboard", icon: LayoutDashboard, label: "ไปที่ Dashboard (Executive)", category: "Navigation", action: () => onSelectOption("navigate", "dashboard") },
    { id: "goto-shift", icon: Calendar, label: "ไปที่ ตารางจัดกะ (Shift Matrix)", category: "Navigation", action: () => onSelectOption("navigate", "shift") },
    { id: "goto-ot", icon: FileText, label: "ไปที่ อนุมัติล่วงเวลา (OT)", category: "Navigation", action: () => onSelectOption("navigate", "ot_request") },
    { id: "action-export", icon: FileText, label: "Export รายงาน OT (CSV)", category: "Actions", action: () => onSelectOption("export_csv") },
    { id: "action-dark", icon: Settings, label: "สลับ ธีมมืด/สว่าง", category: "Settings", action: () => onSelectOption("toggle_theme") },
    { id: "action-compact", icon: Settings, label: "สลับ โหมดตารางแน่น (Compact Mode)", category: "Settings", action: () => onSelectOption("toggle_compact") }
  ];

  const filtered = query 
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()) || o.category.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-[20vh] px-4">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-[#0B1120] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-[#1E3A5F] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-[#1E3A5F]">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-lg"
            placeholder="พิมพ์เพื่อค้นหาพนักงาน, เมนู, หรือคำสั่ง..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter" && filtered.length > 0) {
                filtered[0].action();
                onClose();
              }
            }}
          />
          <div className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-[#162032] px-2 py-1 rounded border border-slate-200 dark:border-[#1E3A5F]">ESC</div>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">ไม่พบคำสั่งที่ตรงกับ "{query}"</div>
          ) : (
            filtered.map((opt, i) => (
              <button
                key={opt.id}
                onClick={() => { opt.action(); onClose(); }}
                className="w-full flex items-center justify-between p-3 hover:bg-blue-50 dark:hover:bg-[#162032] rounded-xl transition-colors group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#162032] group-hover:bg-blue-100 dark:group-hover:bg-[#1E3A5F] text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-[#9FCEE8] flex items-center justify-center transition-colors">
                    <opt.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-[#9FCEE8]">{opt.label}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide uppercase">{opt.category}</div>
                  </div>
                </div>
                {i === 0 && query && <ArrowRight className="w-4 h-4 text-blue-500 opacity-50 group-hover:opacity-100" />}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
