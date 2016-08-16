/**
 * Created by cavasblack on 16/8/15.
 */
'use strict';
const MyZookeeper = require("../lib");

const zk = new MyZookeeper("我的测试案例","/mydemo");

zk.on("data",function(){
    // console.log(zk.root.$.mydemo)
})
setInterval(function(){
    console.log(zk.root.$.mydemo)
},1000)