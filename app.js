var express = require("express"),
    port = process.env.PORT || 3000,
    app = express(),
    path = require('path'),
    serveStatic = require("serve-static"), //静态文件处理
    bodyParser = require("body-parser"), //对后台提交的表单数据进行格式化解析
    mongoose = require("mongoose"),
    Movie = require("./models/movie.js"), //载入mongoose的model构造函数
    _underscore = require("underscore"); //extend替换对象


//数据库连接
mongoose.connect("mongodb://localhost:27017/movie");
mongoose.connection.on("connected", function () {
    console.log("has connected to database movie");
})

//app.set('views', path.join(__dirname, 'views'));
app.set('views', './views/pages')
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, "public"))); //设置静态文件目录
app.use(bodyParser.urlencoded({
    extended: true
}));
app.locals.moment = require('moment'); //格式化日期

app.listen(port);
console.log("music start on port" + port);
//主页面
app.get('/', function (req, res) {
    Movie.findByYear(2017,function (err, movies) {
        if (err) {
            console.log(err);
        }
        res.render('index', {
            title: '首页',
            movies: movies
        })
    });
});
//参数1:路由匹配规则，参数2:回调函数，当从后端匹配到符合规则时，返回首页，传入变量，该变量传入首页替换其中占位符

//detial page
app.get("/movie/:id", function (req, res) {
    var id = req.params.id;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        console.log("movie的id"+id);
        Movie.findById(id, function (err, movie) {
            if (err) {
                console.log(err);
            }
            res.render("detail", {
                title: movie.title + "详情页",
                movie: movie
            })
        });
    }
})
//admin movie 
app.get("/admin/movie", function (req, res) {
    res.render("admin", {
        title: "后台录入页",
        movie: {
            doctor: '',
            title: "",
            year: "",
            flash: "",
            genres: "",
            score: "",
            poster:""
        }
    });
});
//admin update movie
app.get("/admin/update/:id", function (req, res) {
    var id = req.params.id;
    if (id) {
        Movie.findById(id, function (err, movie) {
            if (err) {
                console.log(err);
            }
            res.render("admin", {
                title: "更新",
                movie: movie
            });
        });
    }
});
//admin post movie
app.post("/admin/movie/new", function (req, res) {
    var id = req.body.movie._id;
    var movieObj = req.body.movie;
    console.log(req.body);
    var _movie = null;
    if (id != "") {
        Movie.findById(id, function (err, movie) {
            if (err) {
                console.log(err);
            }
            _movie = _underscore.extend(movie, movieObj);
            _movie.save(function (err, movie) {
                if (err) {
                    console.log(err);
                }

                res.redirect("/movie/" + movie._id);
            });
        });
    } else {
        _movie = new Movie({
            doctor: movieObj.doctor,
            title: movieObj.title,
            year: movieObj.year,
            genres: movieObj.genres,
            flash: movieObj.flash,
            score: movieObj.score,
            poster:movieObj.poster
        });
        console.log(_movie);
        _movie.save(function (err, movie) {
            if (err) {
                console.log(err);
            }

            res.redirect("/movie/" + movie._id);
        });
    }
});
//list page
app.get("/admin/list", function (req, res) {
    Movie.fetch(function (err, movies) {
        if (err) {
            console.log(err);
        }
        res.render("list", {
            title: "列表页",
            movies: movies
        });
    });
});

//delete movie
app.delete("/admin/list", function (req, res) {
    var id = req.query.id;
    if (id) {
        Movie.remove({
            _id: id
        }, function (err, movie) {
            if (err) {
                console.log(err);
            } else {
                res.json({
                    success: 1
                });
            }
        });
    }
});
