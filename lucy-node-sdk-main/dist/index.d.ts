import * as signalR from '@microsoft/signalr';
declare class MessageBus {
    url: string;
    apiKey: string;
    subscriptionMap: {
        [key: string]: Array<(c: string, m: string) => Promise<void>>;
    };
    connection: signalR.HubConnection;
    constructor(url: string, apiKey: string);
    init(): Promise<void>;
    subscribe(channel: string, callback: (ch: string, m: string) => Promise<void>): Promise<void>;
}
export declare type ConnectorFunction = (command: string) => Promise<string>;
export declare class LucyConnector {
    messageBus: MessageBus;
    uniqueId: string;
    connectorType: string;
    connectorFunc: ConnectorFunction;
    name: string;
    url: string;
    apiKey: string;
    static fromInstallationKey(key: string, type: string, func: ConnectorFunction): LucyConnector;
    constructor(type: string, name: string, url: string, apiKey: string, func: ConnectorFunction);
    init(): Promise<void>;
    sendMessage(channel: string, message: string | any): Promise<any>;
    _executeService(service: string, payload: any, opts?: any): Promise<any>;
    sendHeartBeat(): Promise<void>;
}
export {};
