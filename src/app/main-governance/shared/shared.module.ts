import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreUiModule } from 'app/core-ui/core-ui.module';

import { NightingalesRoseChartComponent } from './charts/NightingalesRoseChart/chart.component';

import { NgxEchartsModule } from 'ngx-echarts';

// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core';
// import * as echarts from 'echarts';
// Import specific chart types, all with Chart suffix
import {
    PieChart
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  PolarComponent,
  SingleAxisComponent
} from 'echarts/components';
// Import the Canvas renderer, note that introducing the CanvasRenderer or SVGRenderer is a required step
import {
  CanvasRenderer
} from 'echarts/renderers';


// define components for echarts to use: allows for treeshaking and importing of only the specific charts used
echarts.use(
  [TitleComponent, TooltipComponent, LegendComponent, PolarComponent, SingleAxisComponent, PieChart, CanvasRenderer]
);


@NgModule({
  imports: [
    CommonModule,
    CoreUiModule,
    NgxEchartsModule.forRoot({ echarts }),
  ],
  exports: [
    NightingalesRoseChartComponent,
  ],
  declarations: [
    NightingalesRoseChartComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GovernanceSharedModule { }
