/**
 * Created by cavasblack on 16/3/3.
 */
'use strict';
const Event = require("events").EventEmitter;
const ZkCli = require("./utils/zkCli");
const Path = require("path");
const debug = require("debug")("izhui-zookeeper")
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
                self.emit("create", item)
                self.watchDir(item)
            });
        }.bind(this))
        this.on("delete", function (path) {
            debug("delete", path)
            self.removeNode(path)
        })
        this.on("data", function (path, data) {
            debug("data", path, data)
            self.setData(path, data);
        })
        this.on("create", function (path) {
            debug("create", path)
        })
        this.root = {};
    }

    setData(mypath, data) {
        var paths = mypath.split(Path.sep)
        if (!this.root) {
            this.root = {}
        }
        var sub = this.root;
        while (paths.length) {
            var item = paths.shift() || "$";
            sub[item] = sub[item] || {}
            sub = sub[item]
        }
        sub["data"] = data;
    }

    removeNode(path) {
        var paths = path.split(Path.sep)
        if (!this.root) {
            this.root = {}
        }
        var parent = this.root;
        var name = null;
        while (paths.length) {
            name = (name == null ? (paths.shift() || "$") : name)
            parent = parent[name]
            name = paths.shift();
        }
        delete parent[name]
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
                        return self.watchFile(path, function (err, data) {
                            err || self.emit("data", path, data.toString())
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
            callback(err, data);
        })
    }

    mkdirp(path) {
        this.zk.mkdirp(path, function () {
            debug("mkdirp", path)
        })
    }
}
module.exports = Zookeeper;