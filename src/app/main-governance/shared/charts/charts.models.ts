
export interface ChartDataItem {
  // properties here are defined at https://echarts.apache.org/en/option.html#series-pie.data.label (others can be added here as needed)
  name: string;
  value: number;
  itemStyle?: {
    color?: string;
  };
  label?: {
    show: boolean;
    position?: 'outside' | 'inside';
    color?: string;
    backgroundColor?: string;
  };
}
