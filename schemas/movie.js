var mongoose=require("mongoose");

var movieSchema=new mongoose.Schema({
    doctor:String,
    title:String,
    year:Number,
    flash:String,
    score:String,
    genres:String,
    poster:String,
    meta:{
        createAt:{
            type:Date,
            default:Date.now()
        },
        updateAt:{
            type:Date,
            default:Date.now()
        }
    }//录入时间记录 
});
//每次在存储数据前都会调用该方法
movieSchema.pre("save",function(next){
    if(this.isNew){
        this.meta.createAt=this.meta.updateAt=Date.now();
    }else{
        this.meta.updateAt=Date.now();
    }
    next();
});
movieSchema.statics={
    //取出所有数据
    fetch:function(cb){
        return this.find({}).sort("meta.updateAt").exec(cb);
    },
    findById:function(id,cb){
        return this.findOne({_id:id}).exec(cb)
    },
    findByYear:function(y,cb){
        return this.find({year:y}).sort("meta.updateAt").exec(cb);
    },
    findByTitle:function(t,cb){
        return this.findOne({title:t}).exec(cb);
    }
}
module.exports=movieSchema;
