export interface Asset {
  id: number;
  type: "photo" | "video";
  url: string;
  title: string;
  category: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Lead {
  id: number;
  name: string;
  contact: string;
  created_at: string;
}

export interface Settings {
  whatsapp?: string;
  logo_url?: string;
}
