export interface UnitSalePlanDetailsAttributes {
  project_id: number;
  unit_id: number;
  sale_id: number;
  sale_is_active: boolean;
  unit_status: string;
  payment_plan_id: number;
  stage: string;
  payment_status: string;
  amount: number;
  payment_separation: number;
  total_paid_amount: number;
  total_paid_amount_separation: number;
  total_due_amount: number;
  total_pending_amount: number;
  total_additional_amount: number;
  stat_payment_received: number;
  stat_payment_pending: number;
}
