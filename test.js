/*
1.回调：异步编程方法，需要按照顺序执行异步逻辑时，将后续逻辑封装在回调函数中作为起始函数的参数
2.同步/异步：同步需要一方等待另一方执行结束后才能继续执行
3.单线程:按照顺序执行，每次只执行一个程序
4.i/o 输入输出接口
5.阻塞/非阻塞 当发出某个请求时，停下当前动作等待该请求被回应
6.事件 
7.事件驱动 就是为事件注册回调函数，当事件发生时调用该函数
8.由事件发生来调用的回调函数叫事件驱动
9.事件循环 有大量的异步操作，需要管理多个事件的回调函数；loop是回调函数队列，当异步函数执行时就会压入该队列，靠单线程不断查询该队列是否有事件发生，按照事件加入的顺序来调用响应的回调函数
*/
var http = require("http"); //node内置模块，负责处理http请求和相应
var url = require("url"); //url解析模块，方法parse()解析地址字符串为对象，format()与parse()功能相反，resolve()接收两个字符串生成一个url；querystring.stringify({对象},param)序列化为字符串，param为连接符号，querystring.parse(string,param,...)反序列化,param表用来分隔键值对的分隔符，querystring.escape()对字符串进行转义，unescape()反转义
var superagent = require("superagent"); //http的ajax api
var cheerio = require("cheerio"); //node中的jquery，用css选择器抓取页面
var async = require("async"); //控制并非数量
var eventproxy = require("eventproxy"); //控制事件流程以便异步处理
var mongoose = require("mongoose");
var Movie = require("./models/movie.js"); //引入movie模块

mongoose.connect("mongodb://localhost:27017/movie");
mongoose.connection.on("connected", function () {
    console.log("has connected to database movie");
});

var ep = new eventproxy(), //获取eventproxy实例
    //    urlsArray=[],//url存放
    //    filmUrls=[],//存放电影页面网址
    //    urlsNum=1,//爬url的页数
    baseUrl = "http://www.zxkdy.cn/seacher.php?sousuo=";
//var filmsUrl=[];
const hostname = '127.0.0.1';
const port = 3002;
// //数据库预处理 
Movie.fetch(function (err, movies) {
    if (err) {
        console.log(err);
        return;
    }
    movies.forEach(function (movie) {
        var newtitle = movie.title.split(",")[0];
        var newgenres = movie.genres.trim();
        var newflash = baseUrl + newtitle;
        Movie.update({_id:movie._id},{title:newtitle,genres:newgenres,flash:newflash},{multi:true},function(err){
            if(err){
                console.log(err);
                return;
            }
        })
    });
});
///Users/lzq/Documents/FrontEnd
const server = http.createServer((req, res) => {

});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
}); //创建服务器，在3001端口监听请求，当接到请求之后，会产生两个参数对象，req表该请求相关内容，res表回应
