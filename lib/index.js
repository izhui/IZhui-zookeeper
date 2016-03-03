/**
 * Created by cavasblack on 16/3/3.
 */
var Class = require('osr-class');
var Rpc = require("izhui-rpc");
var Zookeeper = Class.extends({
    $ : function( port, host ){
        this.port = port;
        this.host = host;
    },
});