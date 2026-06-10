export interface User {
  user_id: number;
  user_name: string;
  user_email: string;
  user_password: string;
  user_role: string;
  status: string;
  comp_id: number | null;
  company?: {
    comp_id: number;
    comp_name: string;
    comp_email: string;
    status: string;
    subscription: {
      subs_id: number;
      subs_status: string;
      plan: {
        plan_id: number;
        plan_name: string;
      };
    } | null;
  } | null;
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  compId: number | null;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    user_id: number;
    user_name: string;
    user_email: string;
    user_role: string;
    comp_id: number | null;
  };
}

export interface RegisterResponse {
  message: string;
  company: {
    comp_id: number;
    comp_name: string;
    comp_email: string;
  };
  subscription: {
    subs_id: number;
    subs_status: string;
  };
}
