
// Joy... replicate the backend details so as to have decent typing support /s
type AppModules = 'app' | 'wallet' | 'marketplace' | 'governance';
type DebugOptions = 'silly' | 'debug' | 'info' | 'warn' | 'error';
type BuildMode = 'developer' | 'build';


export interface ApplicationConfigStateModel {
    appModules: Record<AppModules, string>;
    debugLevel: DebugOptions;
    buildMode: BuildMode;
    requestedTestingNetworks: boolean;
    selectedLanguage: string;
    newAppVersionAvailable: boolean;
}


export interface IPCResponseApplicationSettings {
    VERSIONS: Record<AppModules, string>;
    DEBUGGING_LEVEL: DebugOptions;
    MODE: BuildMode;
    TESTING_MODE: boolean;
    LANGUAGE: string;
    ALLOWED_EXTERNAL_URLS?: string[];
    APPLICATION_UPDATES_ALLOWED?: boolean;
}
