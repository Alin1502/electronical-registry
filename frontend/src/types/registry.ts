export type RegisterType =
  | "contracte"
  | "intrari/iesiri"
  | "decizii/hotarari"
  | "facturi"
  | "jurnal"
  | "inventar"
  | "casa"
  | "unic de control"
  | "evidenta a salariatilor";


export interface HistoryEvent {
  id: number;
  entry_id: number;
  status: string;
  note: string | null;
  created_at: string;
}  
export interface UserClaims {
  sub: string;
  id: number;
  company_name: string;
  is_owner: boolean;
  permission_level: string;
  exp: number;
}

export interface AuthResponse {
  access_token?: string;
  token_type?: string;
  detail?: string;
  message?: string;
}

export interface UploadedFile {
  id: number;
  filename: string;
  uploaded_at: string;
  register_type: string;
  size_bytes: number;
  user_id: number;
}

export interface DocumentEntry {
  id: number;
  user_id: number;
  register_type: string;
  created_at: string;
  nr_inregistrare: string;
  cod: string;
  iesire_intrare: string;
  nr_data_emitent: string;
  nr_data_destinator: string;
  rezumat: string;
  repartizare_dpt: string;
  mod_rezolvare: string;
  nr_pag_anexe: string;
  file_id?: number | null;
  status: string;
}

export interface EntryPayload {
  register_type: string;
  nr_inregistrare: string;
  cod: string;
  iesire_intrare: string;
  nr_data_emitent: string;
  nr_data_destinator: string;
  rezumat: string;
  repartizare_dpt: string;
  mod_rezolvare: string;
  nr_pag_anexe: string;
  file_id?: number | null;
}

export interface NextNumberResponse {
  nr_inregistrare: string;
  cod: string;
}

export interface AdminStats {
  total_entries: number;
  recent_entries_last_7_days: number;
  pending_validation: number;
  registry_count: number;
  operator_count: number;
  department_count: number;
  total_storage_bytes: number;
  recent_activity: Array<{
    nr_inregistrare: string;
    register_type: string;
    rezumat: string;
    timestamp: string;
  }>;
}

export interface NamedEntity {
  id: number;
  name: string;
}

export interface RoleEntity extends NamedEntity {
  permission_level: "full_access" | "read_write" | "read";
}

export interface User {
  id: number;
  email: string;
  username: string;
  permission_level: "full_access" | "read_write" | "read";
  is_owner: boolean;
}

export type DownloadResponse = {
  download_url: string;
};

export interface SecureDocumentUploadResponse {
  file_id: number;
  filename: string;
  access_code: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string | null;
  avatar_url: string | null;
  is_owner: boolean;
  company_name: string;
}

