import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CoreModule } from '../../../../../core/core.module';
import { SharedModule } from '../../../../../wallet/shared/shared.module';
import { ModalsModule } from '../../../../../modals/modals.module';
import { CoreUiModule } from '../../../../core-ui.module';
import { RpcWithStateModule } from 'app/core/rpc/rpc.module';

import { ConsoleModalComponent } from './console-modal.component';
import { MainModule } from 'app/core-ui/main/main.module';

describe('ConsoleModalComponent', () => {
  let component: ConsoleModalComponent;
  let fixture: ComponentFixture<ConsoleModalComponent>;
  const cmds = [
    'help',
    'getaddressbalance rSoZtLcT1RySGgVKFchkwBXowFjJzufScc',
    'walletpassphrase "passphrase" 9999 false',
    'sendtypeto "part" "blind" [{ address: "rSoZtLcT1RySGgVKFchkwBXowFjJzufScc" }]',
    'somecommand [ test1,  test2]',
    'somecommand { test1: "testests",  testes2 : "testest1232"}'
  ]
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        SharedModule,
        CoreModule.forRoot(),
        ModalsModule,
        CoreUiModule.forRoot(),
        RpcWithStateModule.forRoot(),
        BrowserAnimationsModule,
        MainModule
      ],
      providers: [
        /* deps */
        { provide: MatDialogRef }
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should parse correctly using runstrings command parsing', () => {
    let mockParse = component.queryParserRunstrings(cmds[0]);
    expect(mockParse.length).toEqual(1);
    mockParse = component.queryParserRunstrings(cmds[1]);
    expect(mockParse[1]).toEqual('rSoZtLcT1RySGgVKFchkwBXowFjJzufScc');
    mockParse = component.queryParserRunstrings(cmds[2]);
    expect(mockParse[1]).toEqual('"passphrase"');
    expect(mockParse[2]).toEqual('9999');
    mockParse = component.queryParserRunstrings(cmds[3]);
    expect(mockParse[1]).toEqual('"part"');
    expect(mockParse[2]).toEqual('"blind"');
    expect(mockParse[3]).toEqual('[{address:"rSoZtLcT1RySGgVKFchkwBXowFjJzufScc"}]');
    mockParse = component.queryParserRunstrings(cmds[4]);
    expect(mockParse[1]).toEqual('[test1,test2]');
    mockParse = component.queryParserRunstrings(cmds[5]);
    expect(mockParse[1]).toEqual('{test1:"testests",testes2:"testest1232"}');
  });

});
