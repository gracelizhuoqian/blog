var mongoose = require("mongoose");
var movieSchema = require("../schemas/movie.js");
var Movie = mongoose.model("Movie", movieSchema);
module.exports=Movie;