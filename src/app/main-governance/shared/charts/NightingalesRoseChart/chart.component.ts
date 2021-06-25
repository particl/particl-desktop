import { tap } from 'rxjs/operators';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { isBasicObjectType } from 'app/main-governance/utils';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ChartDataItem } from '../charts.models';


@Component({
  selector: 'governance-chart-rose',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class NightingalesRoseChartComponent implements OnInit, OnDestroy {

  @Input() titleData: any; // refer to https://echarts.apache.org/en/option.html#title for options
  @Input() dataSeries$: Observable<ChartDataItem[]> = of([]);

  isLoading: boolean = true;

  chartOptions: any;

  private destroy$: Subject<void> = new Subject();
  private defaultOptions: any = {
    legend: {
      type: 'scroll',
      // orient: "vertical",
      // left: "left",
    },

    tooltip: {
      triggerOn: 'mousemove',
      formatter: '{b}<br/>{c} ({d}%)'
    },

    series: [
      {
        type: 'pie',
        clockwise: true,
        roseType: 'radius',
        selectedMode: 'multiple',
        label: {
          show: true,
          position: 'inner',
          formatter: '{c}'
        },
        labelLine: {
          show: false
        },
        left: '10%',
        right: '10%',
        top: '10%',
        bottom: '10%',
        center: ['50%', '50%'],   // relative to container
        radius: ['30%', '65%'],
        data: []
      }
    ]
  };


  constructor() {
    if (isBasicObjectType(this.titleData)) {
      this.chartOptions.text = this.titleData;
    }
  }


  ngOnInit() {
    this.dataSeries$.pipe(
      tap(data => {
        const newOptions = JSON.parse(JSON.stringify(this.defaultOptions));
        data.forEach(d => {
          newOptions.series[0].data.push(d);
        });
        this.chartOptions = newOptions;
      }),
      tap(() => this.isLoading = false),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

