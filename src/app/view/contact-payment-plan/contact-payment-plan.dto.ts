export interface ContactPaymentPlanViewDto {
  payment_plan_id: number;
  sale_id: number;
  project_id: number;
  unit_id: number;
  current_client_id: number;
  client_ids: string;
  sale_type: string;
  separation_amount: number;
  separation_date: string;
  payment_plan_numbers: number;
  separation_rate: number;
  total_amount: number;
  total_amount_paid?: number;
  status: string;
  paid_at: string | Date;
  notes: string;
  is_active: boolean;
  create_by: number;
  update_by: number;
}
