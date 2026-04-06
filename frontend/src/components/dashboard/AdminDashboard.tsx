"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { ITicket, IUser } from "@/types";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<IUser[]>([]);
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<Record<number, boolean>>({});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [userNameFilter, setUserNameFilter] = useState("");
  const [agentNameFilter, setAgentNameFilter] = useState("");

  const fetchAdminData = async () => {
    try {
      const [usersRes, ticketsRes] = await Promise.all([
        api.get<IUser[]>("/admin/users"),
        api.get<ITicket[]>("/tickets")
      ]);
      setUsers(usersRes.data);
      setTickets(ticketsRes.data);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAssignTicket = async (ticketId: number, agentIdStr: string) => {
    if (!agentIdStr) return;
    const agentId = parseInt(agentIdStr, 10);
    
    setAssigning(prev => ({ ...prev, [ticketId]: true }));
    try {
      await api.put("/admin/assign-ticket", { ticketId, agentId });
      await fetchAdminData(); 
    } catch (error) {
      console.error("Failed to assign ticket", error);
      alert("Failed to assign ticket.");
    } finally {
      setAssigning(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  const handleUpdateStatus = async (ticketId: number, status: string) => {
    try {
      await api.put(`/tickets/${ticketId}/status`, { status });
      await fetchAdminData();
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status.");
    }
  };

  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    try {
      await api.put(`/admin/update-role`, { userId, role: newRole });
      await fetchAdminData();
    } catch (error) {
      console.error("Role update failed:", error);
      alert("Failed to update user role.");
    }
  };

  const assignableUsers = users.filter(u => u.role === "AGENT" || u.role === "ADMIN");

  const total = tickets.length;
  const openCount = tickets.filter(t => t.status === "OPEN").length;
  const inProgressCount = tickets.filter(t => t.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter(t => t.status === "RESOLVED").length;
  const usersCount = users.length;

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
    const matchesUser = !userNameFilter || (t.userName || "").toLowerCase().includes(userNameFilter.toLowerCase());
    const matchesAgent = !agentNameFilter || (t.assignedAgentName || "").toLowerCase().includes(agentNameFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesPriority && matchesUser && matchesAgent;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Admin Control Panel</h1>
          <p className="text-sm text-[#6b7280] mt-1 font-medium">System-wide monitoring, assignment, and configuration.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-indigo-50 to-white shadow-md border-indigo-100 pb-4">
          <div className="flex justify-between items-start">
             <div>
               <div className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-2">Total Tickets</div>
               <div className="text-3xl font-extrabold text-[#111827]">{total}</div>
             </div>
          </div>
        </Card>
        <Card className="shadow-md pb-4 border-red-50">
          <div className="flex justify-between items-start">
             <div>
               <div className="text-[11px] font-bold text-red-500 uppercase tracking-wider mb-2">Open</div>
               <div className="text-3xl font-extrabold text-red-600">{openCount}</div>
             </div>
          </div>
        </Card>
        <Card className="shadow-md pb-4">
          <div className="flex justify-between items-start">
             <div>
               <div className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-2">In Progress</div>
               <div className="text-3xl font-extrabold text-[#111827]">{inProgressCount}</div>
             </div>
          </div>
        </Card>
        <Card className="shadow-md pb-4">
          <div className="flex justify-between items-start">
             <div>
               <div className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider mb-2">Resolved</div>
               <div className="text-3xl font-extrabold text-emerald-600">{resolvedCount}</div>
             </div>
          </div>
        </Card>
        <Card className="shadow-md pb-4 bg-gray-50 border-[#e5e7eb]">
          <div className="flex justify-between items-start">
             <div>
               <div className="text-[11px] font-bold text-[#4f46e5] uppercase tracking-wider mb-2">Active Users</div>
               <div className="text-3xl font-extrabold text-[#111827]">{usersCount}</div>
             </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
        
        {/* Ticket Management Panel */}
        <Card title="Global Ticket Management" className="shadow-md xl:col-span-1 min-h-[500px]">
          <div className="flex flex-col sm:flex-row gap-3 mb-4 mt-2 flex-wrap">
            <input 
              type="text" 
              placeholder="Search subjects..." 
              className="px-3 py-2 border border-[#e5e7eb] rounded-lg text-sm flex-1 min-w-[130px] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] text-[#111827] placeholder:text-[#9ca3af] shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Filter by user..." 
              className="px-3 py-2 border border-[#e5e7eb] rounded-lg text-sm flex-1 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] text-[#111827] placeholder:text-[#9ca3af]"
              value={userNameFilter}
              onChange={(e) => setUserNameFilter(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Filter by agent..." 
              className="px-3 py-2 border border-[#e5e7eb] rounded-lg text-sm flex-1 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] text-[#111827] placeholder:text-[#9ca3af]"
              value={agentNameFilter}
              onChange={(e) => setAgentNameFilter(e.target.value)}
            />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-[#e5e7eb] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 text-[#4b5563] shadow-sm cursor-pointer font-semibold"
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-[#e5e7eb] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 text-[#4b5563] shadow-sm cursor-pointer font-semibold"
            >
              <option value="ALL">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          
          <div className="max-h-[500px] overflow-y-auto border border-[#e5e7eb] rounded-lg">
            {loading ? (
               <div className="p-10 text-center text-[#6b7280] text-sm font-medium animate-pulse">Loading system array...</div>
            ) : filteredTickets.length === 0 ? (
               <div className="p-10 text-center text-[#6b7280] text-sm font-medium bg-[#f9fafb]">No tickets match the current filters.</div>
            ) : (
              <Table headers={["Ref", "Subject", "Status", "Priority", "Assignment", "Actions"]} className="border-0 rounded-none text-xs">
                {filteredTickets.map(t => (
                  <tr key={t.id} className="border-t border-[#e5e7eb] hover:bg-[#eef2ff]/30 transition-colors cursor-pointer group" onClick={() => router.push(`/tickets/${t.id}`)}>
                    <td className="px-4 py-3 font-bold text-[#6b7280]">#{t.id}</td>
                    <td className="px-4 py-3 font-bold text-[#111827]">{t.subject.substring(0,20)}{t.subject.length > 20 ? '...' : ''}</td>
                    <td className="px-4 py-3"><Badge variant={t.status === "CLOSED" ? "dark-gray" : t.status === "RESOLVED" ? "green" : t.status === "IN_PROGRESS" ? "amber" : "gray"}>{t.status}</Badge></td>
                    <td className="px-4 py-3 font-semibold text-xs text-[#6b7280]">{t.priority}</td>
                    <td className="px-4 py-3">
                      <select 
                        title="Assign"
                        className="text-[11px] font-semibold border border-[#e5e7eb] rounded py-1 px-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#4f46e5] cursor-pointer"
                        disabled={assigning[t.id] || t.status === "CLOSED"}
                        onChange={(e) => { e.stopPropagation(); handleAssignTicket(t.id, e.target.value); }}
                        value={t.assignedAgentName ? users.find(u => u.name === t.assignedAgentName)?.id : ""}
                      >
                        <option value="" disabled>Unassigned</option>
                        {assignableUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <select 
                        title="State"
                        className="text-[11px] font-semibold border border-[#e5e7eb] rounded py-1 px-2 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer text-emerald-700"
                        value={t.status}
                        onChange={(e) => { e.stopPropagation(); handleUpdateStatus(t.id, e.target.value); }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">Progress</option>
                        <option value="RESOLVED">Resolve</option>
                        <option value="CLOSED">Close</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </div>
        </Card>

        {/* Identity Panel */}
        <Card title="Identity Configuration" className="shadow-md xl:col-span-1 min-h-[500px]">
          <div className="max-h-[600px] overflow-y-auto">
            {loading ? (
               <div className="p-10 text-center text-[#6b7280] text-sm font-medium animate-pulse">Computing identities...</div>
            ) : (
              <Table headers={["ID", "Name/Email", "Role", "Elevate"]} className="border-0 rounded-none text-xs">
                {users.map(u => (
                  <tr key={u.id} className="border-t border-[#e5e7eb] hover:bg-[#f9fafb] transition-colors">
                    <td className="px-4 py-4 font-bold text-[#6b7280]">#{u.id}</td>
                    <td className="px-4 py-4">
                      <div className="font-extrabold text-[#111827]">{u.name}</div>
                      <div className="text-[11px] text-[#6b7280] mt-0.5 font-medium">{u.email}</div>
                    </td>
                    <td className="px-4 py-4"><Badge variant={u.role === "ADMIN" ? "dark-gray" : u.role === "AGENT" ? "amber" : "gray"}>{u.role}</Badge></td>
                    <td className="px-4 py-4">
                      <select 
                        title="Role"
                        className="text-[11px] font-semibold border border-[#e5e7eb] rounded py-1.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] cursor-pointer shadow-sm transition-all"
                        value={u.role}
                        onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                      >
                        <option value="USER">User (Standard)</option>
                        <option value="AGENT">Agent (Responder)</option>
                        <option value="ADMIN">Admin (Root)</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
