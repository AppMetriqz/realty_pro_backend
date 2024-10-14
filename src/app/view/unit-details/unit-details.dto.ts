export interface UnitDetailsAttributes {
  unit_id: number;
  project_id: number;
  name: string;
  description: string;
  notes: string;
  type: string;
  condition: string;
  levels_qty: number;
  level: number;
  meters_of_land: number;
  meters_of_building: number;
  rooms: number;
  bathrooms: number;
  price_per_meter: number;
  price: number;
  cover_name: string;
  cover_path: string;
  status: string;
  is_active: boolean;
  create_by?: number;
  update_by?: number;
  currency_type: string;
}
