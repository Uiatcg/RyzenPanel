export interface MetricPoint {
  label: string;
  value: number;
}

export interface ServerCardData {
  id: string;
  name: string;
  status: string;
  cpu: number;
  ram: number;
  disk: number;
  node: string;
  ip: string;
  port: number | null;
  backups: number;
  databases: number;
  createdAt: string;
  dockerImage: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  status: string;
  serverName: string | null;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  severity: "info" | "warning" | "critical";
}

export interface UserData {
  id: string;
  email: string;
  username: string;
  role: string;
  credits: number;
  emailVerified: boolean;
  plan?: { id: string; name: string } | null;
}

export interface ServerDetails {
  id: string;
  uuid: string;
  name: string;
  description: string | null;
  ownerId: string | null;
  nodeId: string;
  eggId: string;
  status: string;
  suspended: boolean;
  cpu: number;
  ram: number;
  disk: number;
  io: number;
  ip: string | null;
  port: number | null;
  dockerImage: string;
  startup: string;
  environment: any;
  containerId: string | null;
  node: { id: string; name: string; fqdn: string };
  egg: { id: string; name: string };
  allocations: any[];
  backups: any[];
  databases: any[];
  schedules: any[];
  createdAt: string;
}
