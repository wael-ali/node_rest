class Socket {
    constructor() {
        if (Socket.instance instanceof Socket){
            return Socket.instance;
        }
        this.bag = {
            // io: require('./socket').init(server),
            version: Math.floor(Math.random() * 4000)
        }
        // Object.freeze(this.bag);
        Object.freeze(this);
        Socket.instance = this;
    }
    getIo(){
        if (!this.bag.io){
            throw new Error('Socket.io not initialized!');
        }
        return this.bag.io;
    }
    init(server){
        this.bag.io = require('socket.io')(server);
        // Object.freeze(this.bag);
    }
}

module.exports = Socket;