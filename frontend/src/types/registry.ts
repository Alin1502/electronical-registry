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
  user_id: number;
}

export interface DocumentEntry {
  id: number;
  user_id: number;
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
  total_documents: number;
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
