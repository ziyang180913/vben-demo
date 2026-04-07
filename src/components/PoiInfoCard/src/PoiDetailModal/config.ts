export interface InfoLabelItem {
  label: string;
  value: string;
}

export interface DetailData {
  name: string;
  id?: string | number;
  add?: string;
  [key: string]: any;
}

export const defaultInfoLabels: InfoLabelItem[] = [
  { label: '经营评分', value: 'score_rank' },
  { label: '开业时间', value: 'open_date' },
  { label: '经纬度', value: 'p_loc' },
  { label: '商业面积', value: 'area' },
  { label: '商业楼层', value: 'floor' },
  { label: '营业状态', value: 'business_status' },
  { label: '营业时间', value: 'open_hour' },
  { label: '招商状态', value: 'investment_status' },
];
