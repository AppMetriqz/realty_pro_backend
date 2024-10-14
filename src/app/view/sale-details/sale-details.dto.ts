export interface SaleDetailsAttributes {
  sale_id: number;
  project_id: number;
  unit_id: number;
  client_id: number;
  seller_id: number;
  price: number;
  commission: number;
  amount_pending_sale?: number;
  notes: string;
  financed_at?: Date;
  separated_at?: Date;
  stage: string;
  is_active: boolean;
  create_by: number;
  update_by: number;
  created_at: string;
  currency_type: string;
}
