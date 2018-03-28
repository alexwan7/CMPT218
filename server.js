var express = require('express');
var flash = require('express-flash');
var session = require('express-session');
var http = require('http');
var qs = require('querystring');

var port = process.env.PORT || 8001;
var app = express();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://dooora:2233@ds119129.mlab.com:19129/a4";

app.use(flash());
app.use('/', express.static('./web'));

app.use(session({
  name:"session",
  secret: "zordon",
  maxAge: 1000 * 60 * 10
}));

var head = `<!DOCTYPE HTML>
<html>

<head>
    <meta name="viewport" content="minimum-scale=1.0, width=device-width, maximum-scale=1.0, user-scalable=no"/>
    <meta charset="utf-8">
    <meta lang="en"> 
    <title>Assignment 4</title>
    <link rel="stylesheet" href="css/style.css">
</head>`;

var foot = `</html>`;

app.get('/login',function(req,res){
   var error = req.flash('error');
   var body = `<body>    
    <section id="container">
        <form method="post" action="/login">
            <label id="adminlogin">ADMIN LOGIN</label>
            <section id="form">
            <label for="un">USERNAME:</label><br>
            <input type="text" name="username" id="username" required/><br>
            <label for="pwd">PASSWORD:</label><br>
            <input type="password" name="password" id="password" required/><br>
            <center><button>Log In</button></center>
            </section>
        </form>
         <a href='register.html'><center><button>Register</button></center></a>
    </section>
</body>`;
    var form = head + `<center><p id="error">`+error+`</p></center>` + body + foot;
    res.end(form);
});

app.post('/login',function(req,res){
   var user= null;
   var body="";
   req.on('data',function(data){
      body += data.toString(); 
   });
   req.on('end',function(){
        var postObj = qs.parse(body);
        var jsonObj = JSON.stringify(postObj);   
        var _username = JSON.parse(jsonObj).username;
        var _password = JSON.parse(jsonObj).password;
       
        MongoClient.connect(url,function(err,client){
            if(err) console.log(err);
            var database = client.db('a4');
            var collection = database.collection('users');
            var query = {};
            query["username"] = _username;
            collection.findOne({username:_username},function(err,result){
               if(err) throw err;
                if(!result){
                    req.flash('error','the username is not registered');
                    res.redirect('/login');
                }else{
                    if(_password == result.password){
                        res.redirect('/welcome');
                    }else{
                    req.flash('error','the password is not correct');
                    res.redirect('/login');  
                    }
                }
               });
            });  
   });
    
});

app.get('/register.html',function(req,res){
    res.sendFile(path.join(__dirname + '/web/register.html'));
    res.end();
});
app.post('/register',function(req,res){
   var user= null;
   var body="";
   req.on('data',function(data){
      body += data.toString(); 
   }); 
   req.on('end',function(){
        var postObj = qs.parse(body);
        var jsonObj = JSON.stringify(postObj);   
        var _username = JSON.parse(jsonObj).username;
        var _password = JSON.parse(jsonObj).password;
        MongoClient.connect(url,function(err,client){
            if(err) throw err;
            console.log("connected");
            var database = client.db('a4');
            var collection = database.collection('users');
            collection.findOne({username:_username},function(err,result){
               if(result){
                   console.log("username is registered already");
                   req.flash('error','the username is resistered already');
                   res.redirect('/register.html');
                   res.end();
               }else{
                   content = {
                       username: _username,
                       password: _password
                   }
                   collection.insert(content,function(err){
                       if(err) throw err;
                   })
                   console.log("inserted");
                   res.redirect('/login');
                   res.end();
               }
                
            });
            
        });
});
});

http.createServer(app).listen(port);
console.log("log in:"+port);
