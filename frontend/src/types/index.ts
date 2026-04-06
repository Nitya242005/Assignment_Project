export type Role = "USER" | "ADMIN" | "AGENT";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface IUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface ITicket {
  id: number;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  userName: string;
  assignedAgentName?: string;
  comments?: IComment[];
  rating?: number;
  attachmentPath?: string;
}

export interface IComment {
  id: number;
  message: string;
  userName: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  id: number;
  name: string;
  email: string;
  role: string;
}
