const expect = require('chai').expect;
const { V3WebsocketClient } = require('okex-api-node');
require('dotenv').load();
const websocketV3Uri = process.env['V3_WS_URL'];

describe('V3 websocket 连接测试', function() {
    const client = new V3WebsocketClient(websocketV3Uri);
    it('成功连接上服务器', function(done) {
        client.connect();
        client.on('open', () => done());
    });

    after(function(done) {
        client.on('close', () => done());
        client.close();
    });
});

describe('V3 websocket 业务测试', function() {

    const client = new V3WebsocketClient(websocketV3Uri);

    before(function(done) {
        client.connect();
        client.on('open', done);
    });

    it('登录测试', function(done) {
        client.login(process.env['V3_API_KEY'], process.env['V3_SECRET_KEY'],
            process.env['V3_PASSPHRASE']);
        client.on('message', function listener(message) {
            if (message.indexOf('login') > -1 && message.indexOf('success') > -1) {
                done();
                client.removeListener('message', listener);
            }
        });
    });

    it('订阅测试', function(done) {
        client.subscribe('swap/ticker:BTC-USD-SWAP');
        client.on('message', function listener(message) {
            if (message.indexOf('subscribe') > -1 && message.indexOf('swap/ticker:BTC-USD-SWAP') > -1) {
                done();
                client.removeListener('message', listener);
            }
        });
    });

    it('订阅测试多个频道', function(done) {
        client.subscribe(['swap/ticker:BTC-USD-SWAP','swap/candle60s:BTC-USD-SWAP']);
        let counter = 0;
        client.on('message', function listener(message) {
            if (message.indexOf('subscribe') > -1 && message.indexOf('swap/ticker:BTC-USD-SWAP') > -1) {
                counter++;
            }
            if (message.indexOf('subscribe') > -1 && message.indexOf('swap/candle60s:BTC-USD-SWAP') > -1) {
                counter++;
            }
            if (counter > 1) {
                done();
                client.removeListener('message', listener);
            }
        });
    });

    it('取消订阅测试', function(done) {
        client.unsubscribe(['swap/ticker:BTC-USD-SWAP','swap/candle60s:BTC-USD-SWAP']);
        let counter = 0;
        client.on('message', function listener(message) {
            console.log(message)
            if (message.indexOf('unsubscribe') > -1 && message.indexOf('swap/ticker:BTC-USD-SWAP') > -1) {
                counter++;
            }
            if (message.indexOf('unsubscribe') > -1 && message.indexOf('swap/candle60s:BTC-USD-SWAP') > -1) {
                counter++;
            }
            if (counter > 1) {
                done();
                client.removeListener('message', listener);
            }
        });
    });

    it('取消订阅测试多个频道', function(done) {
        client.unsubscribe(['swap/ticker:BTC-USD-SWAP','swap/candle60s:BTC-USD-SWAP']);
        let counter = 0;
        client.on('message', function listener(message) {
            console.log(message);
            if (message.indexOf('unsubscribe') > -1 && message.indexOf('swap/ticker:BTC-USD-SWAP') > -1) {
                counter++;
            }
            if (message.indexOf('unsubscribe') > -1 && message.indexOf('swap/candle60s:BTC-USD-SWAP') > -1) {
                counter++;
            }
            if (counter > 1) {
                done();
                client.removeListener('message', listener);
            }
        });
    });

    it('测试ping/pong', function(done) {
        const client = new V3WebsocketClient(websocketV3Uri);
        client.connect();
        client.on('message', function listener(message) {
            console.log(message);
            if (message === 'pong') {
                done('error message pong');
            }
        });
        setTimeout(() => {
            client.on('close', function listener() {
                expect(client.interval).to.be.null;
                done();
                client.removeListener('close', listener);
            });
            client.close();
        }, 1000);
    });

    after(function(done) {
        client.on('close', () => done());
        client.close();
    });

});