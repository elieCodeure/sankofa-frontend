// src/models/auth/AuthenticationResponse.ts
export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'CLIENT' | 'SELLER' | 'TRANSPORTER';
  status: string;
  profile?: any;
}

export interface AuthenticationResponse {
  user: UserProfile;
  tokens?: {
    access: string;
    refresh: string;
  };
}
