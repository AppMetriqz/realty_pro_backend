export interface CurrentPaymentPendingViewDto {
  payment_plan_detail_id: number;
  payment_plan_id: number;
  project_id: number;
  unit_id: number;
  sale_id: number;
  sale_type: string;
  payment_amount: number;
  payment_number: number;
  amount_paid: number;
  total_amount_paid: number;
  payment_date: string;
  currency_type: string;
  paid_at: Date;
  payment_made_at: Date;
  status: string;
  notes: string;
  is_active: boolean;
  create_by: number;
  update_by: number;
}
