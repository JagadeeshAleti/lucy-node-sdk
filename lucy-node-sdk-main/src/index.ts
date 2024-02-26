
import fetch from 'node-fetch';
import * as signalR from '@microsoft/signalr';


/**
Generates a unique identifier
*/
function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
}
class MessageBus {
    url = "";
    apiKey = "";
    subscriptionMap:{[key:string]:Array<(c:string,m:string)=>Promise<void>>} = {};
    connection:signalR.HubConnection = null;
    constructor(url:string,apiKey:string) {
        this.url = url;
        this.apiKey = apiKey;
    }
    async init() {
        let _url = this.url + '/globalHub';
        let connection = new signalR.HubConnectionBuilder().withUrl(_url,{
            skipNegotiation:true,
            transport:signalR.HttpTransportType.WebSockets,
        }).build();
        await connection.start();
        connection.on('broadcast',async (channel,message)=>{
            if (this.subscriptionMap[channel]) {
                for(let cb of this.subscriptionMap[channel]) {
                    await cb(channel,message);
                }
            }
        });
        this.connection = connection;
    }
    async subscribe(channel:string,callback:(ch:string,m:string)=>Promise<void>) {
        if (!this.connection) {
            throw 'Connection not initialized';
        }
        await this.connection.invoke('subscribe',this.apiKey,channel);
        if (!this.subscriptionMap[channel]) {
            this.subscriptionMap[channel] = [];
        }
        this.subscriptionMap[channel].push(callback);
    }
}
export declare type ConnectorFunction = (command:string) => Promise<string>;
export class LucyConnector {
    messageBus:MessageBus = null;
    uniqueId = generateUUID();
    connectorType = 'node-connector';
    connectorFunc:ConnectorFunction = async (a) => '1';
    name = "";
    url= "";
    apiKey = "";
    static fromInstallationKey(key:string, type: string, func:ConnectorFunction) {
        let parts = key.split('|');
        if (parts.length < 3) {
            throw 'Installation key expects url|apikey|name';
        }
        let [url,apiKey,name,...rest] = parts;
        return new LucyConnector(type,name,url,apiKey,func);
    }
    constructor(type:string,name:string,url:string,apiKey:string,func:ConnectorFunction) {
        this.url = url;
        this.apiKey = apiKey;
        this.connectorType = type;
        this.name = name;
        this.connectorFunc = func;
    }
    async init() {
        this.messageBus = new MessageBus(this.url,this.apiKey);
        await this.messageBus.init();
        await this.sendHeartBeat();
        await this.messageBus.subscribe(this.uniqueId, async (channel, message) => {
            if (message == 'ping') {
                return;
            }

            try {
                let rp = JSON.parse(message);
                let replyChannel = rp.channel + '';
                let command = rp.command;
                let result = await this.connectorFunc?.(command);
                if (typeof result != 'string') {
                    result = JSON.stringify(result);
                }
                try {
                    await this.sendMessage(replyChannel, { "ok": true, result, from: this.uniqueId });
                } catch (e) {
                    console.error(e);

                    await this.sendMessage(replyChannel, { "ok": false, error: e, from: this.uniqueId });

                }


            } catch (e) {
                console.error(e);
            }

        });
    }
    async sendMessage(channel:string,message:string|any) {
        if (typeof message != 'string') {
            message = JSON.stringify(message);
        }
        let data = await this._executeService('Lucy/ExternalConnector/PublishMessage',{
            Channel:channel,
            Message:message,
        },{json:true});
        console.log(`Sending message ${message} to ${channel} and got: ${data}`);
        return data;
    }
    async _executeService(service:string,payload:any,opts?:any) {
        opts = opts || {};
        let json = !!opts.json;
        let url = this.url + '/api/' + service;
        let body = new URLSearchParams(payload);

        let headers = {
            'Content-Type':'application/x-www-form-urlencoded',
            'Authorization':`APIKEY ${this.apiKey}`,
        }
        let resp = await fetch(url,{body,headers,method:'POST'});
        if (!resp.ok) {
            throw await resp.text();
        }
        if (json) {
            return await resp.json();
        }
        return await resp.text();
    }
    async sendHeartBeat() { 
        try{
            let r = await this._executeService('Lucy/ExternalConnector/UpdateConnectorID',{
                GUID:this.uniqueId,
                Name:this.name,
                Type:this.connectorType,
            },{json:true});
            console.log('Heart Beat: ',r);
            setTimeout(()=>this.sendHeartBeat(),5000);
        }catch(e) {     
            console.log("Error during heart beat: ", e)       
            setTimeout(()=>this.sendHeartBeat(),5000);
        }
    }
}
