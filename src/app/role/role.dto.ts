export class RoleDto {
  role_id: number;
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface FindAllDto {
  pageSize: number;
  pageIndex: number;
}
