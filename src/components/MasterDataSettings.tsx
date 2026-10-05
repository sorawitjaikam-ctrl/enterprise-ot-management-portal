import React, { useState } from "react";
import { AppState, Department } from "../types";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";

interface MasterDataSettingsProps {
  state: AppState | null;
  setState: React.Dispatch<React.SetStateAction<AppState | null>>;
  showToastMsg: (msg: string) => void;
}

export default function MasterDataSettings({ state, setState, showToastMsg }: MasterDataSettingsProps) {
  const [activeTab, setActiveTab] = useState<"roles" | "departments">("roles");
  
  // Roles State
  const rolesList = state?.roles || [];
  const [newRole, setNewRole] = useState("");
  const [editingRole, setEditingRole] = useState<{ old: string, new: string } | null>(null);

  // Depts State
  const deptList = state?.departments || [];
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptId, setNewDeptId] = useState("");
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // --- Roles Handlers ---
  const handleAddRole = () => {
    if (!newRole.trim()) return;
    if (rolesList.includes(newRole.trim())) {
      showToastMsg("ตำแหน่งนี้มีอยู่ในระบบแล้ว");
      return;
    }
    setState(prev => prev ? ({ ...prev, roles: [...(prev.roles || []), newRole.trim()] }) : prev);
    setNewRole("");
    showToastMsg("เพิ่มตำแหน่งงานสำเร็จ");
  };

  const handleDeleteRole = (roleName: string) => {
    if (!window.confirm(`ยืนยันการลบตำแหน่ง ${roleName}?`)) return;
    setState(prev => prev ? ({ ...prev, roles: (prev.roles || []).filter(r => r !== roleName) }) : prev);
    showToastMsg("ลบตำแหน่งงานสำเร็จ");
  };

  const handleUpdateRole = () => {
    if (!editingRole || !editingRole.new.trim()) return;
    setState(prev => {
      if (!prev) return prev;
      const updatedRoles = (prev.roles || []).map(r => r === editingRole.old ? editingRole.new.trim() : r);
      
      // Also update employees who have this role
      const updatedEmps = prev.employees.map(emp => 
        emp.role === editingRole.old ? { ...emp, role: editingRole.new.trim() } : emp
      );

      return { ...prev, roles: updatedRoles, employees: updatedEmps };
    });
    setEditingRole(null);
    showToastMsg("แก้ไขตำแหน่งงานสำเร็จ");
  };

  // --- Depts Handlers ---
  const handleAddDept = () => {
    if (!newDeptName.trim() || !newDeptId.trim()) return;
    if (deptList.some(d => d.id === newDeptId.trim())) {
      showToastMsg("รหัสแผนกนี้มีอยู่ในระบบแล้ว");
      return;
    }
    const newDept: Department = {
      id: newDeptId.trim().toLowerCase(),
      name: newDeptName.trim(),
      nameTh: `แผนก ${newDeptName.trim()}`,
      manager: "ผู้จัดการใหม่",
      managerRole: "Section Manager",
      managerImg: "",
      employeesCount: 0,
      otHours: 0,
      budgetUsed: 0,
      budgetUsedChange: 0,
      budgetUsedChangePct: 0,
      budgetUtilization: 0,
      status: "On Track",
      icon: "business_center"
    };
    setState(prev => prev ? ({ ...prev, departments: [...prev.departments, newDept] }) : prev);
    setNewDeptName("");
    setNewDeptId("");
    showToastMsg("เพิ่มแผนกสำเร็จ");
  };

  const handleDeleteDept = (deptId: string) => {
    if (!window.confirm(`ยืนยันการลบแผนก ${deptId}? (พนักงานในแผนกนี้จะไม่ถูกลบ แต่จะไม่มีแผนกสังกัด)`)) return;
    setState(prev => prev ? ({ ...prev, departments: prev.departments.filter(d => d.id !== deptId) }) : prev);
    showToastMsg("ลบแผนกสำเร็จ");
  };

  const handleUpdateDept = () => {
    if (!editingDept || !editingDept.name.trim()) return;
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        departments: prev.departments.map(d => d.id === editingDept.id ? editingDept : d)
      };
    });
    setEditingDept(null);
    showToastMsg("แก้ไขแผนกสำเร็จ");
  };

  return (
    <div className="bg-white border border-[#DCE4EA] rounded p-5 space-y-4">
      <div>
        <h4 className="text-sm font-bold text-slate-800">จัดการข้อมูลโครงสร้างองค์กร (Master Data)</h4>
        <p className="text-xs text-slate-500">ตั้งค่ารายชื่อแผนกและตำแหน่งงานที่ใช้ในระบบ</p>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button
          className={`pb-2 text-xs font-bold transition-colors ${activeTab === "roles" ? "border-b-2 border-blue-600 text-blue-700" : "text-slate-500 hover:text-slate-700"}`}
          onClick={() => setActiveTab("roles")}
        >
          ตำแหน่งงาน (Positions / Roles)
        </button>
        <button
          className={`pb-2 text-xs font-bold transition-colors ${activeTab === "departments" ? "border-b-2 border-blue-600 text-blue-700" : "text-slate-500 hover:text-slate-700"}`}
          onClick={() => setActiveTab("departments")}
        >
          แผนก (Units / Departments)
        </button>
      </div>

      {activeTab === "roles" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="พิมพ์ชื่อตำแหน่งงานใหม่..." 
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              onKeyDown={(e) => e.key === 'Enter' && handleAddRole()}
            />
            <button 
              onClick={handleAddRole}
              className="px-4 py-2 bg-[#0E3A66] hover:bg-[#17538F] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              เพิ่มตำแหน่ง
            </button>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {rolesList.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-white transition-colors">
                {editingRole?.old === r ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input 
                      type="text"
                      value={editingRole.new}
                      onChange={(e) => setEditingRole({ ...editingRole, new: e.target.value })}
                      className="flex-1 px-2 py-1 text-xs border border-blue-300 rounded"
                      autoFocus
                    />
                    <button onClick={handleUpdateRole} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Save className="w-4 h-4" /></button>
                    <button onClick={() => setEditingRole(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <>
                    <span className="text-xs font-medium text-slate-700">{r}</span>
                    <div className="flex items-center gap-1 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingRole({ old: r, new: r })} className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteRole(r)} className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {rolesList.length === 0 && <div className="p-4 text-center text-xs text-slate-500">ไม่มีข้อมูลตำแหน่งงาน</div>}
          </div>
        </div>
      )}

      {activeTab === "departments" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="รหัสแผนก (เช่น hr, op)" 
              value={newDeptId}
              onChange={(e) => setNewDeptId(e.target.value)}
              className="w-1/3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <input 
              type="text" 
              placeholder="ชื่อแผนก (เช่น Human Resources)" 
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              onKeyDown={(e) => e.key === 'Enter' && handleAddDept()}
            />
            <button 
              onClick={handleAddDept}
              className="px-4 py-2 bg-[#0E3A66] hover:bg-[#17538F] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              เพิ่มแผนก
            </button>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {deptList.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-white transition-colors">
                {editingDept?.id === d.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 w-20 truncate">{d.id}</span>
                    <input 
                      type="text"
                      value={editingDept.name}
                      onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value, nameTh: `แผนก ${e.target.value}` })}
                      className="flex-1 px-2 py-1 text-xs border border-blue-300 rounded"
                      autoFocus
                    />
                    <button onClick={handleUpdateDept} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Save className="w-4 h-4" /></button>
                    <button onClick={() => setEditingDept(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-600 rounded font-mono">{d.id}</span>
                      <span className="text-xs font-medium text-slate-700">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingDept(d)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteDept(d.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {deptList.length === 0 && <div className="p-4 text-center text-xs text-slate-500">ไม่มีข้อมูลแผนก</div>}
          </div>
        </div>
      )}
    </div>
  );
}
