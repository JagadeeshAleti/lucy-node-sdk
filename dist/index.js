"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LucyConnector = void 0;
const node_fetch_1 = require("node-fetch");
const signalR = require("@microsoft/signalr");
/**
Generates a unique identifier
*/
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
}
class MessageBus {
    constructor(url, apiKey) {
        this.url = "";
        this.apiKey = "";
        this.subscriptionMap = {};
        this.connection = null;
        this.url = url;
        this.apiKey = apiKey;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            let _url = this.url + '/globalHub';
            let connection = new signalR.HubConnectionBuilder().withUrl(_url, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets,
            }).build();
            yield connection.start();
            connection.on('broadcast', (channel, message) => __awaiter(this, void 0, void 0, function* () {
                if (this.subscriptionMap[channel]) {
                    for (let cb of this.subscriptionMap[channel]) {
                        yield cb(channel, message);
                    }
                }
            }));
            this.connection = connection;
        });
    }
    subscribe(channel, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connection) {
                throw 'Connection not initialized';
            }
            yield this.connection.invoke('subscribe', this.apiKey, channel);
            if (!this.subscriptionMap[channel]) {
                this.subscriptionMap[channel] = [];
            }
            this.subscriptionMap[channel].push(callback);
        });
    }
}
class LucyConnector {
    constructor(type, name, url, apiKey, func) {
        this.messageBus = null;
        this.uniqueId = generateUUID();
        this.connectorType = 'node-connector';
        this.connectorFunc = (a) => __awaiter(this, void 0, void 0, function* () { return '1'; });
        this.name = "";
        this.url = "";
        this.apiKey = "";
        this.url = url;
        this.apiKey = apiKey;
        this.connectorType = type;
        this.name = name;
        this.connectorFunc = func;
    }
    static fromInstallationKey(key, type, func) {
        let parts = key.split('|');
        if (parts.length < 3) {
            throw 'Installation key expects url|apikey|name';
        }
        let [url, apiKey, name, ...rest] = parts;
        return new LucyConnector(type, name, url, apiKey, func);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.messageBus = new MessageBus(this.url, this.apiKey);
            yield this.messageBus.init();
            yield this.sendHeartBeat();
            yield this.messageBus.subscribe(this.uniqueId, (channel, message) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                if (message == 'ping') {
                    return;
                }
                try {
                    let rp = JSON.parse(message);
                    let replyChannel = rp.channel + '';
                    let command = rp.command;
                    let result = yield ((_a = this.connectorFunc) === null || _a === void 0 ? void 0 : _a.call(this, command));
                    if (typeof result != 'string') {
                        result = JSON.stringify(result);
                    }
                    try {
                        yield this.sendMessage(replyChannel, { "ok": true, result, from: this.uniqueId });
                    }
                    catch (e) {
                        console.error(e);
                        yield this.sendMessage(replyChannel, { "ok": false, error: e, from: this.uniqueId });
                    }
                }
                catch (e) {
                    console.error(e);
                }
            }));
        });
    }
    sendMessage(channel, message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof message != 'string') {
                message = JSON.stringify(message);
            }
            let data = yield this._executeService('Lucy/ExternalConnector/PublishMessage', {
                Channel: channel,
                Message: message,
            }, { json: true });
            console.log(`Sending message ${message} to ${channel} and got: ${data}`);
            return data;
        });
    }
    _executeService(service, payload, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            opts = opts || {};
            let json = !!opts.json;
            let url = this.url + '/api/' + service;
            let body = new URLSearchParams(payload);
            let headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `APIKEY ${this.apiKey}`,
            };
            let resp = yield (0, node_fetch_1.default)(url, { body, headers, method: 'POST' });
            if (!resp.ok) {
                throw yield resp.text();
            }
            if (json) {
                return yield resp.json();
            }
            return yield resp.text();
        });
    }
    sendHeartBeat() {
        return __awaiter(this, void 0, void 0, function* () {
            let r = yield this._executeService('Lucy/ExternalConnector/UpdateConnectorID', {
                GUID: this.uniqueId,
                Name: this.name,
                Type: this.connectorType,
            }, { json: true });
            console.log('Heart Beat: ', r);
            setTimeout(() => this.sendHeartBeat(), 5000);
        });
    }
}
exports.LucyConnector = LucyConnector;
