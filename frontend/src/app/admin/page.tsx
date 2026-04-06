"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { ITicket, IUser } from "@/types";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function AdminPanelPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<Record<number, boolean>>({});
  const [closing, setClosing] = useState<Record<number, boolean>>({});
  const [deleting, setDeleting] = useState<Record<number, boolean>>({});
  const [userNameFilter, setUserNameFilter] = useState("");
  const [agentNameFilter, setAgentNameFilter] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [user]);

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

  const handleAssignTicket = async (ticketId: number, agentIdStr: string) => {
    if (!agentIdStr) return;
    const agentId = parseInt(agentIdStr, 10);
    
    setAssigning(prev => ({ ...prev, [ticketId]: true }));
    try {
      await api.put("/admin/assign-ticket", { ticketId, agentId });
      await fetchAdminData(); 
    } catch (error) {
      console.error("Failed to assign ticket", error);
      alert("Failed to assign ticket. Check console for details.");
    } finally {
      setAssigning(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    try {
      await api.put(`/admin/update-role`, { userId, role: newRole });
      await fetchAdminData();
      alert(`User #${userId} role updated successfully to ${newRole}`);
    } catch (error) {
      console.error("Role update failed:", error);
      alert("Failed to update user role.");
    }
  };

  const handleForceClose = async (ticketId: number) => {
    if (!confirm("Are you sure you want to force close this ticket?")) return;
    
    setClosing(prev => ({ ...prev, [ticketId]: true }));
    try {
      await api.put(`/tickets/${ticketId}/status`, { status: "CLOSED" });
      await fetchAdminData();
    } catch (error) {
      console.error("Failed to force close ticket", error);
      alert("Failed to force close ticket.");
    } finally {
      setClosing(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Delete user "${userName}"? This will also delete all their tickets and comments. This cannot be undone.`)) return;
    setDeleting(prev => ({ ...prev, [userId]: true }));
    try {
      await api.delete(`/admin/users/${userId}`);
      await fetchAdminData();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to delete user.");
    } finally {
      setDeleting(prev => ({ ...prev, [userId]: false }));
    }
  };

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <svg className="w-16 h-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-2xl font-bold text-[#111827]">Access Denied</h2>
        <p className="text-[#6b7280] mt-2">Administrator privileges required.</p>
      </div>
    );
  }

  const assignableUsers = users.filter(u => u.role === "AGENT" || u.role === "ADMIN");

  const filteredTickets = tickets.filter(t => {
    const matchUser = !userNameFilter || (t.userName || "").toLowerCase().includes(userNameFilter.toLowerCase());
    const matchAgent = !agentNameFilter || (t.assignedAgentName || "").toLowerCase().includes(agentNameFilter.toLowerCase());
    return matchUser && matchAgent;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Admin Console</h1>
        <p className="text-sm text-[#6b7280] mt-1 font-medium">Manage system users, roles, and global ticket assignments.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* System Users */}
        <Card title={`Identity Management (${users.length})`} className="min-h-[500px]">
          <div className="max-h-[600px] overflow-y-auto">
            <Table headers={["ID", "Name", "Access Level", "Role", "Delete"]} className="border-0 rounded-none">
              {users.map(u => (
                <tr key={u.id} className="border-t border-[#e5e7eb] first:border-0 hover:bg-[#f9fafb] transition-colors duration-150">
                  <td className="px-6 py-4 text-sm text-[#6b7280] font-medium">#{u.id}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-bold text-[#111827]">{u.name}</div>
                    <div className="text-xs text-[#6b7280] font-medium mt-0.5">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <Badge variant={u.role === "ADMIN" ? "dark-gray" : u.role === "AGENT" ? "amber" : "gray"}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      className="text-xs font-semibold border border-[#e5e7eb] rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] transition-all shadow-sm cursor-pointer"
                      value={u.role}
                      onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                    >
                      <option value="USER">User (Standard)</option>
                      <option value="AGENT">Support Agent</option>
                      <option value="ADMIN">System Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {u.role !== "ADMIN" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={deleting[u.id]}
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="text-xs py-1.5 text-red-600 border-red-200 hover:bg-red-50 font-semibold"
                      >
                        {deleting[u.id] ? 'Deleting...' : 'Delete'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        </Card>

        {/* Ticket Assignment & Management */}
        <Card title={`Central Dispatch Queue (${filteredTickets.length}/${tickets.length})`} className="min-h-[500px]">
          {/* Filters */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <input
              type="text"
              placeholder="Filter by user name..."
              value={userNameFilter}
              onChange={e => setUserNameFilter(e.target.value)}
              className="flex-1 min-w-[150px] px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] bg-white"
            />
            <input
              type="text"
              placeholder="Filter by agent name..."
              value={agentNameFilter}
              onChange={e => setAgentNameFilter(e.target.value)}
              className="flex-1 min-w-[150px] px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] bg-white"
            />
          </div>
          <div className="max-h-[520px] overflow-y-auto">
            <Table headers={["Ticket", "Current Delegate", "Assign To", "Action"]} className="border-0 rounded-none">
              {filteredTickets.map(t => (
                <tr key={t.id} className="border-t border-[#e5e7eb] first:border-0 hover:bg-[#f9fafb] transition-colors duration-150">
                  <td className="px-6 py-4 text-sm font-bold text-[#111827]">
                    #{t.id} <span className="text-[#6b7280] font-normal tracking-tight ml-1">{t.subject.substring(0, 15)}{t.subject.length > 15 ? '...' : ''}</span>
                    <div className="mt-2">
                      <Badge variant={t.status === "CLOSED" ? "dark-gray" : t.status === "RESOLVED" ? "green" : t.status === "IN_PROGRESS" ? "amber" : "gray"}>
                        {t.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#4b5563] font-medium">{t.assignedAgentName || <span className="text-gray-400 italic">Unassigned</span>}</td>
                  <td className="px-6 py-4">
                    <select 
                      className="text-xs font-semibold border border-[#e5e7eb] rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] shadow-sm disabled:opacity-50 transition-all cursor-pointer"
                      disabled={assigning[t.id] || t.status === "CLOSED"}
                      onChange={(e) => handleAssignTicket(t.id, e.target.value)}
                      value=""
                    >
                      <option value="" disabled>Delegate...</option>
                      {assignableUsers.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {t.status !== "CLOSED" && (
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="text-xs py-1.5 bg-white font-semibold"
                        disabled={closing[t.id]}
                        onClick={() => handleForceClose(t.id)}
                      >
                        Force Close
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
