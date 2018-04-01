var http=require("http");//node内置模块，负责处理http请求和相应
var url=require("url");//url解析模块
var superagent=require("superagent");//http的ajax api
var cheerio=require("cheerio");//node中的jquery，用css选择器抓取页面
var async=require("async");//控制并非数量
var eventproxy=require("eventproxy");//控制事件流程以便异步处理
var mongoose=require("mongoose");
var Movie=require("./models/movie.js");//引入movie模块

mongoose.connect("mongodb://localhost:27017/movie");
mongoose.connection.on("connected", function () {
    console.log("has connected to database movie");
});

var ep=new eventproxy(),//获取eventproxy实例
    urlsArray=[],//url存放
    filmUrls=[],//存放电影页面网址
    urlsNum=100,//爬url的页数
    catchFirstUrl="https://movie.douban.com/j/search_subjects?type=movie&tag=%E8%B1%86%E7%93%A3%E9%AB%98%E5%88%86&sort=recommend&page_limit=20&page_start=";//入口页面
    
//抓取页面
for(var i=0;i<urlsNum;i++){
    urlsArray.push(catchFirstUrl+i*20);
    console.log(catchFirstUrl+i*20);
}
//抓取电影数据
function fileInfo(url){
    superagent.get(url)
    .end(function(err,res){
        if(err){
            console.log(err);
            return;
        }
        //res.text 里存储着请求返回的 html 内容，将它传给 cheerio.load 之后就可以得到一个实现了 jquery 接口的DOM变量
        var $=cheerio.load(res.text),
            title=$("#content h1 span[property='v:itemreviewed']").text(),
            year=$("#content h1 span.year").text().trim(),
            poster=$("#mainpic .nbgnbg img").attr("src"),
            doctor=$("#info .attrs").eq(0).text(),
            score=$("strong.ll.rating_num").text(),
            genres="";
        year=parseInt(year.substring(1,5)),
        $("#info span[property='v:genre']").each(function(){
            genres+=$(this).text()+" ";
        });
        
        var _movie=new Movie({
            title:title,
            year:year,
            poster:poster,
            doctor:doctor,
            score:score,
            genres:genres,
            flash:""
        });
        _movie.save(function(err,movie){
            if(err){
                console.log(err);
            }
            console.log(movie+"has been saved");
        });  
    });
}
//主程序
function start(){
    function onRequest(req,res){
        //设置字符编码
        res.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
        //当指定事件完成后回调触发事件
        ep.after('filmHtml',urlsArray.length*20,function(filmUrl){
            //控制并发数量
            var curCount=0;
            var reptileMove=function(url,cb){
                //延迟时间
                var delay=parseInt((Math.random() * 30000000) % 1000, 10);
                curCount++;
                console.log("并发数："+curCount+"抓取"+url);
                fileInfo(url);
                
                setTimeout(function(){
                    curCount--;
                    cb(null,url+"call back content");
                },delay);
            };
            //使用async异步回调
            async.mapLimit(filmUrls,5,function(url,cb){
                reptileMove(url,cb);
            },function(err,results){
                //完成后的回调函数
                console.log("抓取结束");
            });
        })
        
        //轮询所有电影列表页面
        urlsArray.forEach(function(item){
            superagent.get(item)
            .set({
            "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36",
            'Content-Type': 'text/plain; charset=UTF-8'
            })
            .end(function(err,pres){
                if(err){
                    console.log(err);
                    return;
                }
                var films=pres.body.subjects;
                for(var i=0;i<films.length;i++){
                    var filmUrl=films[i].url;//获取详情页
                    console.log("正在获取详情页"+filmUrl);
                    filmUrls.push(filmUrl);
                    //相当于计数器
                    ep.emit("filmHtml",filmUrl);//发送一个详情页获取的事件
                }
            });
        });
    }
    http.createServer(onRequest).listen(3001);
}
exports.start= start;