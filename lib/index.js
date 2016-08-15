/**
 * Created by cavasblack on 16/3/3.
 */
'use strict';
const Event = require("events").EventEmitter;
const ZkCli = require("./utils/zkCli");
const Path = require("path");
class Zookeeper extends Event {
    constructor(name, path, opts) {
        super();
        this.name = name;
        this.path = path;
        this.zk = new ZkCli(opts);
        var self = this;
        this.zk.connect(function (err) {
            if (err)throw new Error(err)
            self.watchDir(self.path);
        });
        this.on("dir", function (path, nodes) {
            nodes.forEach(function (item, index) {
                console.log("crate", item)
                self.watchDir(item)
            });
        }.bind(this))
        this.on("delete", function(err,data){
            console.log("delete",arguments)
        })
        this.on("data",function(path,data){
            console.log("data",path,data)
        })
    }

    watchDir(path) {
        var self = this;
        this.zk.exists(path, function (err) {
            if (err) {
                self.mkdirp.bind(self)(path);
            } else {
                self.zk.watchDir(path, function (err, nodes) {
                    if (err) {
                        return self.emit("delete", path)
                    }
                    if (!nodes.length) {
                        return self.watchFile(path,function(err,data){
                            err || self.emit("data",path,data.toString())
                        });
                    }
                    self.emit("dir", path, nodes.map(function (item) {
                        return [path, item].join(Path.sep)
                    }))
                });
            }
        });
    }

    watchFile(path, callback) {
        var self = this;
        this.zk.watch(path, function (err, data) {
            callback(err,data);
        })
    }

    mkdirp(path) {
        this.zk.mkdirp(this.path, function () {
            
        })
    }
}
module.exports = Zookeeper;