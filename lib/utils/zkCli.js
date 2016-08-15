/**
 * Created by cavasblack on 16/8/13.
 */
'use strict';
const Zookeeper = require("zookeeper");

var formatCallback = function (callback) {
    return function (rc, error) {
        if (0 === rc) return callback(null, arguments[arguments.length - 1])
        return callback(new Error(error))
    }
}

var watchCallback = function (fn) {
    return function (path, callback) {
        return function () {
            fn.bind(this)(path,callback)
        }.bind(this)
    }.bind(this)
}

class zkCli {
    constructor(opts) {
        opts = opts || {
                connect: "localhost:2181",
                timeout: 20000,
                debug_level: Zookeeper.ZOO_LOG_LEVEL_WARN,
                host_order_deterministic: false
            }
        this.client = new Zookeeper({
            connect: opts.connect || "localhost:2181",
            timeout: opts.timeout || 20000,
            debug_level: opts.debug_level || Zookeeper.ZOO_LOG_LEVEL_WARN,
            host_order_deterministic: opts.host_order_deterministic || false
        })
    }

    /**
     * 连接zookeeper
     * @param callback
     */
    connect(callback) {
        this.client.connect(callback)
    }

    /**
     * 创建文件
     * @param path
     * @param data
     * @param callback
     */
    create(path, data, callback) {
        this.client.a_create(path, data, Zookeeper.ZOO_EPHEMERAL, formatCallback(callback))
    }

    /**
     * 创建文件夹
     * @param path
     * @param callback
     */
    mkdirp(path, callback) {
        this.client.mkdirp(path, formatCallback(callback))
    }

    /**
     * 文件是否存在
     * @param path
     * @param callback
     */
    exists(path, callback) {
        this.client.a_exists(path, false, formatCallback(callback))
    }

    /**
     * 得到文件
     * @param path
     * @param callback
     */
    get(path, callback) {
        this.client.a_get(path, false, formatCallback(callback))
    }

    /**
     * 删除文件
     * @param path
     * @param callback
     */
    delete(path, callback) {
        this.client.a_delete_(path, -1, formatCallback(callback))
    }

    /**
     * 设置内容
     * @param path
     * @param data
     * @param callback
     */
    set(path, data, callback) {
        this.client.a_set(path, data, -1, formatCallback(callback))
    }

    /**
     * 监听文件
     * @param path
     * @param callback
     */
    watch(path, callback) {
        this.client.aw_get(path, watchCallback.bind(this)(this.watch)(path, callback), formatCallback(callback))
    }

    /**
     * 监听文件夹
     * @param path
     * @param callback
     */
    watchDir(path, callback) {
        this.client.aw_get_children(path, watchCallback.bind(this)(this.watchDir)(path,callback), formatCallback(callback))
    }
}

module.exports = zkCli;