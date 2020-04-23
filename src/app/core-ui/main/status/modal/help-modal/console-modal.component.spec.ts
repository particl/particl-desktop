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
import { SettingsModule } from 'app/settings/settings.module';
import { MultiwalletModule } from 'app/multiwallet/multiwallet.module';

describe('ConsoleModalComponent', () => {
  let component: ConsoleModalComponent;
  let fixture: ComponentFixture<ConsoleModalComponent>;
  const cmds_runstrings = [
    'help',
    'getaddressbalance rSoZtLcT1RySGgVKFchkwBXowFjJzufScc',
    'walletpassphrase "passphrase" 9999 false',
    'sendtypeto "part" "blind" [{ address: "rSoZtLcT1RySGgVKFchkwBXowFjJzufScc" }]',
    'somecommand [ test1,  test2]',
    'somecommand { test1: "testests",  testes2 : "testest1232"}'
  ];

  const cmds_commands = [
    'help',
    'getaddressbalance rSoZtLcT1RySGgVKFchkwBXowFjJzufScc',
    'walletpassphrase "password!@" 9999 false',
    'sendtypeto "part" "blind" [{ address: "rSoZtLcT1RySGgVKFchkwBXowFjJzufScc" }]',
    'sendtypeto "part" "blind" [{ "address": "rSoZtLcT1RySGgVKFchkwBXowFjJzufScc" }]',
    'somecommand value1 "" null null "some value2"',
    'somecommand [ test1,  test2]',
    `somecommand [ "test1",  'test2']`,
    `somecommand [ "test1",  "test2"]`,
    `somecommand { 'test1': "testests",  "test2" : "testest1232"}`,
    `somecommand { "test1": "testests",  "test2" : "testest1232"}`,
    `somecommand "some string value \\" goes here"`,
    `somecommand "this is a quotations mark's test"`,
    `somecommand "some string ["`,
    `somecommand {}`,
    `somecommand { test1, test2`,
    `"somecommand " 12`,
    `walletpassphrase "1{ !" 0`
  ];

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
        MainModule,
        MultiwalletModule.forRoot(),
        SettingsModule.forRoot()
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
    let mockParse = component.queryParserRunstrings(cmds_runstrings[0]);
    expect(mockParse.length).toEqual(1);
    mockParse = component.queryParserRunstrings(cmds_runstrings[1]);
    expect(mockParse[1]).toEqual('rSoZtLcT1RySGgVKFchkwBXowFjJzufScc');
    mockParse = component.queryParserRunstrings(cmds_runstrings[2]);
    expect(mockParse[1]).toEqual('"passphrase"');
    expect(mockParse[2]).toEqual('9999');
    mockParse = component.queryParserRunstrings(cmds_runstrings[3]);
    expect(mockParse[1]).toEqual('"part"');
    expect(mockParse[2]).toEqual('"blind"');
    expect(mockParse[3]).toEqual('[{address:"rSoZtLcT1RySGgVKFchkwBXowFjJzufScc"}]');
    mockParse = component.queryParserRunstrings(cmds_runstrings[4]);
    expect(mockParse[1]).toEqual('[test1,test2]');
    mockParse = component.queryParserRunstrings(cmds_runstrings[5]);
    expect(mockParse[1]).toEqual('{test1:"testests",testes2:"testest1232"}');
  });

  it('should parse correctly using the command parser parsing', () => {
    let mockParse = component.queryParserCommand(cmds_commands[0]);
    expect(mockParse[0]).toEqual('help');

    mockParse = component.queryParserCommand(cmds_commands[1]);
    expect(mockParse[0]).toEqual('getaddressbalance');
    expect(mockParse[1]).toEqual('rSoZtLcT1RySGgVKFchkwBXowFjJzufScc');

    mockParse = component.queryParserCommand(cmds_commands[2]);
    expect(mockParse[0]).toEqual('walletpassphrase');
    expect(mockParse[1]).toEqual('password!@');
    expect(mockParse[2]).toEqual(9999);
    expect(mockParse[3]).toEqual(false);

    mockParse = component.queryParserCommand(cmds_commands[3]);
    expect(mockParse[0]).toEqual('sendtypeto');
    expect(mockParse[1]).toEqual('part');
    expect(mockParse[2]).toEqual('blind');
    // Parse as string since the object key is not correctly quoted
    expect(mockParse[3]).toEqual('[{ address: "rSoZtLcT1RySGgVKFchkwBXowFjJzufScc" }]');

    mockParse = component.queryParserCommand(cmds_commands[4]);
    expect(mockParse[0]).toEqual('sendtypeto');
    expect(mockParse[1]).toEqual('part');
    expect(mockParse[2]).toEqual('blind');
    expect(mockParse[3]).toEqual(jasmine.any(Array));
    expect(mockParse[3].length).toEqual(1);
    expect(mockParse[3][0]).toEqual(jasmine.any(Object));
    expect(mockParse[3][0]).toEqual(jasmine.any(Object));
    expect(mockParse[3][0].address).toEqual('rSoZtLcT1RySGgVKFchkwBXowFjJzufScc');

    mockParse = component.queryParserCommand(cmds_commands[5]);
    expect(mockParse[0]).toEqual('somecommand');
    expect(mockParse[1]).toEqual('value1');
    expect(mockParse[2]).toEqual('');
    expect(mockParse[3]).toBeNull();
    expect(mockParse[4]).toBeNull();
    expect(mockParse[5]).toEqual('some value2');

    mockParse = component.queryParserCommand(cmds_commands[6]);
    expect(mockParse[0]).toEqual('somecommand');
    expect(mockParse[1]).toEqual('[test1,  test2]');

    mockParse = component.queryParserCommand(cmds_commands[7]);
    expect(mockParse[0]).toEqual('somecommand');
    expect(mockParse[1]).toEqual(`["test1",  'test2']`);

    mockParse = component.queryParserCommand(cmds_commands[8]);
    expect(mockParse[0]).toEqual('somecommand');
    expect(mockParse[1]).toEqual(jasmine.any(Array));
    expect(mockParse[1].length).toEqual(2);
    expect(mockParse[1][0]).toEqual('test1');
    expect(mockParse[1][1]).toEqual('test2');

    mockParse = component.queryParserCommand(cmds_commands[9]);
    expect(mockParse[0]).toEqual('somecommand');
    expect(mockParse[1]).toEqual(`{'test1': "testests",  "test2" : "testest1232"}`);

    mockParse = component.queryParserCommand(cmds_commands[10]);
    expect(mockParse[0]).toEqual('somecommand');
    expect(mockParse[1]).toEqual(jasmine.any(Object));
    expect(mockParse[1].test1).toEqual('testests');
    expect(mockParse[1].test2).toEqual('testest1232');

    mockParse = component.queryParserCommand(cmds_commands[11]);
    expect(mockParse[0]).toEqual('somecommand');
    expect(mockParse[1]).toEqual(`some string value \\" goes here`);

    mockParse = component.queryParserCommand(cmds_commands[12]);
    expect(mockParse[0]).toEqual('somecommand');
    expect(mockParse[1]).toEqual(`this is a quotations mark's test`);

    mockParse = component.queryParserCommand(cmds_commands[13]);
    expect(mockParse.length).toEqual(2);
    expect(mockParse[0]).toEqual('somecommand');
    expect(mockParse[1]).toEqual(`some string [`);

    mockParse = component.queryParserCommand(cmds_commands[14]);
    expect(mockParse[0]).toEqual('somecommand');
    expect(mockParse[1]).toEqual(jasmine.any(Object));
    expect(Object.keys(mockParse[1]).length).toEqual(0);

    mockParse = component.queryParserCommand(cmds_commands[15]);
    expect(mockParse.length).toEqual(0);

    mockParse = component.queryParserCommand(cmds_commands[16]);
    expect(mockParse[0]).toEqual('somecommand');
    expect(mockParse[1]).toEqual(12);

    mockParse = component.queryParserCommand(cmds_commands[17]);
    expect(mockParse[0]).toEqual('walletpassphrase');
    expect(mockParse[1]).toEqual('1{ !');
    expect(mockParse[2]).toEqual(0);
  });

});
