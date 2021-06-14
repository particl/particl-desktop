import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { StatusBarComponent } from './status-bar/status-bar.component';

import { NightingalesRoseChartComponent } from './charts/NightingalesRoseChart/chart.component';

import { NgxEchartsModule } from 'ngx-echarts';

// Import the echarts core module, which provides the necessary interfaces for using echarts.
// import * as echarts from 'echarts/core';
import * as echarts from 'echarts';
// // Import specific chart types, all with Chart suffix
// import {
//     PieChart
// } from 'echarts/charts';
// import {
//   TitleComponent,
//   TooltipComponent,
//   GridComponent
// } from 'echarts/components';
// // Import the Canvas renderer, note that introducing the CanvasRenderer or SVGRenderer is a required step
// import {
//   CanvasRenderer
// } from 'echarts/renderers';


// // define components for echarts to use: allows for treeshaking and importing of only the specific charts used
// echarts.use(
//   [TitleComponent, TooltipComponent, GridComponent, PieChart, CanvasRenderer]
// );


@NgModule({
  imports: [
    CommonModule,
    CoreUiModule,
    NgxEchartsModule.forRoot({ echarts }),
  ],
  exports: [
    StatusBarComponent,
    NightingalesRoseChartComponent,
  ],
  declarations: [
    StatusBarComponent,
    NightingalesRoseChartComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GovernanceSharedModule { }
