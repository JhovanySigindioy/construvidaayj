import { Office } from "./office";

export interface User {
    id: number;
    username: string;
    role: string;
    offices: Office[];
    token: string;
  }
  