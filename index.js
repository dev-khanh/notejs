const express = require('express');
const moment = require('moment');
var mysql      = require('mysql');
const path = require('path');
var uuid = require('uuid')

var bodyParser = require("body-parser");
const formidable = require('express-formidable');

const fs = require('fs-extra')


const app = express();
app.use(bodyParser.json())
app.use(formidable());

app.use(express.static(path.join(__dirname+'/public')));
app.use(express.static(__dirname + '/public'));


// app.set('port', process.env.PORT || 3000);
// app.set('views', __dirname + '/views');
// app.use(express.favicon());
// app.use(express.logger('dev'));
// app.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname + '/public/uploads' }));
// app.use(express.methodOverride());
// app.use(app.router);
// app.use(express.static(path.join(__dirname, '/public')));
// app.use(express.static(__dirname + '/static'));
// app.use(express.errorHandler());

const url = 'http://127.0.0.1:8000/images/'

const isJSON = (str) => {
    if ( /^\s*$/.test(str) ) return false;
    str = str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@');
    str = str.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
    str = str.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
    return (/^[\],:{}\s]*$/).test(str);
}
const isCheckStrinorJsonString = (str) => {
    if(isJSON(str)){
        return JSON.parse(str)
    }else{
        return str
    }
}

app.get('/coppyFile', (req, res) => {
    fs.copy(
        '/var/folders/f4/1sn8048s2j74ppv9jz2c0rb00000gn/T/upload_04199d3a45af01c25e24702df5afeb48', 
        __dirname + '/public/images/D13BC917-CCD3-4DF0-B100-E7C8C3175DAF.jpg', 
        err => {
        if (err) return res.send(err)
        res.send('Success !!!')
    })
})

app.get('/images/:images', function(req, res){
    //public/images/139184769_158177199159211_7670312686354234594_n.jpg
    res.sendFile(__dirname + '/public/'+req.params.images);
});
let count = 0;
  
app.get('/api', (req, res, next) => {
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '123456',
        database : 'my_db'
    });
    connection.connect();
    connection.query('SELECT * from cats', function (error, results, fields) {
    if (error) throw error;
        console.log('The solution is: ', count++);
        res.send(results)
    });
    connection.end();
});

app.put('/update/:id', function (req, res) {
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '123456',
        database : 'my_db'
    });
    connection.connect();
    var sql = 'UPDATE cats SET name=?, owner=?, birth=? myFiles? WHERE id=?';
    const isCheckNumber = Number.isInteger(Number(req.params.id))
    if(isCheckNumber){
        connection.query('SELECT * from cats', function (error, results, fields) {
            if (error) throw error;
                if(results.findIndex(x => x.id === parseInt(req.params.id)) !== -1){
                    if (req?.fields.hasOwnProperty('name') && req?.fields.hasOwnProperty('owner') && req?.fields.hasOwnProperty('birth') && req?.myFiles.hasOwnProperty('myFiles')){
                        if(moment(req?.fields?.birth, 'YYYY-MM-DD',true).isValid()){
                            var values = [
                                isCheckStrinorJsonString(req?.fields?.name),
                                isCheckStrinorJsonString(req?.fields?.owner),
                                req?.fields?.birth,
                                req.params.id
                            ];
                            connection.query(sql,values, function (error, resultsss, fields) {
                                if (error) throw error;
                                res.send({
                                    success :"success !!!",
                                    resultsss
                                })
                            });
                            connection.end();
                        }else{
                            res.send({'Error': 'Khong phai ngay !!! '})
                        }
                    }else{
                        res.send({'Error': 'Arrays Rong !!! '})
                    }
                }else{
                    res.send({'Error': 'Arrays Rong !!! ', results})
                }
            });
    }else{
        res.send({error: 'error no number !!!!'})
    }
}); 



const connectMysql = ({sql, values, callback}) => {
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '123456',
        database : 'my_db'
    });
    connection.connect();
    if(values){
        connection.query(sql, values, function (error, resultsss, fields) {
            if (error) {
                callback(error)
                return
            };
            callback(resultsss)
        });
    }else{
        connection.query(sql, function (error, resultsss, fields) {
            if (error) {
                callback(error)
                return
            };
            callback(resultsss)
        });
    }
    connection.end();
}

app.get('/delete/:id', async (req, res) =>  {
    // var connection = mysql.createConnection({
    //     host     : 'localhost',
    //     user     : 'root',
    //     password : '123456',
    //     database : 'my_db'
    // });
    // connection.connect();
    var sql = "DELETE FROM cats WHERE id=?";
    const isCheckNumber = Number.isInteger(Number(req.params.id))
    if(isCheckNumber){
        // connection.query('SELECT * from cats', function (error, results, fields) {
        //     if (error) throw error;
        //         if(results.findIndex(x => x.id === parseInt(req.params.id)) !== -1){
        //             connection.query(sql, req.params.id, function (error, resultsss, fields) {
        //                 if (error) throw error;
        //                 res.send({
        //                     success :"success !!!",
        //                     results
        //                 })
        //             });
        //             connection.end();
        //         }else{
        //             res.send({'Error': 'Arrays Rong !!! ', results})
        //         }
        //     });

        connectMysql({sql: 'SELECT * FROM cats', callback: (selectRespose)=> {
            if(selectRespose.findIndex(x => x.id === parseInt(req.params.id)) !== -1){
                connectMysql({sql: 'DELETE FROM cats WHERE id=?', values: req.params.id, callback: (response)=>{
                    res.send({
                        success :"success !!!",
                        response
                    })
                }})
            }else{
                res.send({
                    error : "errror id done not exits !!!",
                    selectRespose
                })
            }
        }})
    }else{
        res.send({error: 'error no number !!!!'})
    }
})


app.post("/updatefile", (req, res) => {
    if (req?.fields.hasOwnProperty('name') && req?.fields.hasOwnProperty('owner') && req?.fields.hasOwnProperty('birth') && req.files.hasOwnProperty('myFiles')){
        if(moment(req?.fields?.birth, 'YYYY-MM-DD',true).isValid()){
            if(req.files.myFiles.name.indexOf('mp4') === -1){
                fs.copy(req.files.myFiles.path, __dirname + '/public/images/'+ req.files.myFiles.name, err => {
                    if (err) return res.send(err)
                })
                var values = [
                    [isCheckStrinorJsonString(req?.fields?.name),
                    isCheckStrinorJsonString(req?.fields?.owner),
                    req?.fields?.birth,
                    url+req.files.myFiles.name],
                ];
                var sql = "INSERT INTO cats (name, owner, birth, myFiles) VALUES ?";
                connectMysql({sql, values: [values], callback: (selectRespose) => {
                    res.send({
                        success :"success !!!",
                        selectRespose
                    })
                }})
            }else{
                res.send({'error: ': `this not video, plase using images png jpg ... `})
            }
        }else{
            res.send({'Error': 'Khong phai ngay !!! '})
        }
    }else{
        res.send({'Error': 'Arrays Rong !!! '})
    }
})
app.put("/uploadApi/:id", (req, res)  =>  {
    const isCheckNumber = Number.isInteger(Number(req.params.id))
    if (isCheckNumber && req?.fields.hasOwnProperty('name') && req?.fields.hasOwnProperty('owner') && req?.fields.hasOwnProperty('birth') && req.files.hasOwnProperty('myFiles')){
        if(moment(req?.fields?.birth, 'YYYY-MM-DD',true).isValid()){
            if(req.files.myFiles.name.indexOf('mp4') === -1){
                var values = [
                    isCheckStrinorJsonString(req?.fields?.name),
                    isCheckStrinorJsonString(req?.fields?.owner),
                    req?.fields?.birth,
                    url+req.files.myFiles.name,
                    req.params.id
                ];
                connectMysql({sql: 'SELECT * FROM cats', callback: (selectRespose)=> {
                    if(selectRespose.findIndex(x => x.id === parseInt(req.params.id)) !== -1){
                        connectMysql({sql: 'UPDATE cats SET name=?, owner=?, birth=?, myFiles=? WHERE id=?', values, callback: (response)=>{
                            res.send({
                                success :"success !!!",
                                response
                            })
                        }})
                    }else{
                        res.send({
                            error : "errror id done not exits !!!",
                            selectRespose
                        })
                    }
                }})
            }else{
                res.send({'error: ': `this not video, plase using images png jpg ... `})
            }
        }else{
            res.send({'error: ': `this 'birth vd: 2020-01-01' not date time !!!`})
        }
    }else{
        res.send({'error: ': 'this not number or not name !!!'})
    }
})

app.listen(8000, () => {
  console.log('Example app listening on port 8000!')
});