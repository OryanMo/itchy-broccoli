#!/usr/local/bin/node
// returns an instance of node-greenlock with additional helper methods
var lex = require('greenlock-express').create({
      // set to https://acme-v01.api.letsencrypt.org/directory in production
        server: 'https://acme-v01.api.letsencrypt.org/directory'

        // If you wish to replace the default plugins, you may do so here
        //
        , challenges: { 'http-01': require('le-challenge-fs').create({ webrootPath: '~/letsencrypt/var/acme-challenges' }) }
        , store: require('le-store-certbot').create({ webrootPath: '~/letsencrypt/var/acme-challenges' })

        // You probably wouldn't need to replace the default sni handler
        // See https://git.daplie.com/Daplie/le-sni-auto if you think you do
        //, sni: require('le-sni-auto').create({})

        , approveDomains: approveDomains
});

function approveDomains(opts, certs, cb) {
    // This is where you check your database and associated
    // email addresses with domains and agreements and such


    // The domains being approved for the first time are listed in opts.domains
    // Certs being renewed are listed in certs.altnames
    if (certs) {
      opts.domains = certs.altnames;
    }
    else {
      opts.email = 'oryanmo167@gmail.com';
      opts.agreeTos = true;
    }

    // NOTE: you can also change other options such as `challengeType` and `challenge`
    // opts.challengeType = 'http-01';
    // opts.challenge = require('le-challenge-fs').create({});

    cb(null, { options: opts, certs: certs });
}


// handles acme-challenge and redirects to https
require('http').createServer(lex.middleware(require('redirect-https')())).listen(80, function () {
      console.log("Listening for ACME http-01 challenges on", this.address());
});


var sqlite = require('sqlite3').verbose();
var db = new sqlite.Database('db/moviedb.db');
var bodyparser = require('body-parser');
var express = require('express');
var fs = require('fs');
var cp = require("child_process");
var spawn = cp.spawn;
var session = require('express-session');
var urllib = require('urllib')
var randomstring = require('randomstring')
var app = express();
app.use(session({secret: '0ror13254!#@%$',
                 resave: true,
                 cookie: {maxAge: 3600000},
                 saveUninitialized: true}));

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use('/', express.static(__dirname + '/public'));
app.use('/seatmaps', express.static(__dirname + '/seatmaps'));
var root = __dirname + '/public/';

app.get('/', function(req, res){
    if (req.session.isauth==true && req.session.username){
        var hour = 3600000;
        req.session.cookie.expires = new Date(Date.now() + hour);
        req.session.cookie.maxAge = hour;
        res.sendFile(root + 'splash.html');
    }
    else{
        req.session.wantedpage = '/';
        res.redirect('/signin')
    }
});

app.get('/pickmovie', function(req, res){
    if (req.session.isauth==true && req.session.username){
        var hour = 3600000;
        req.session.cookie.expires = new Date(Date.now() + hour);
        req.session.cookie.maxAge = hour;
        res.sendFile(root + 'pickmovie.html');
    }
    else{
        req.session.wantedpage = '/';
        res.redirect('/signin')
    }
})

app.get('/signin', function(req, res){
    res.sendFile(root + 'signin.html');
})

app.get('/signup', function(req, res){
    res.sendFile(root + 'signup.html');
})

app.post('/signin', function(req, res){
    var username= req.body.username,
        password= req.body.password;

    db.all('SELECT password FROM user WHERE username=\''+username.toLowerCase()+'\'', function(errs, rows){
        if(!rows || rows.length === 0){
            res.json({status:"ERROR", msg:"User isnt registerd"});
            return;
        } else {
            if (rows[0].password == password){
                req.session.username = username.toLowerCase();
                req.session.isauth = true;
                res.json({status:"SUCCESS", lastwanted: req.session.wantedpage});
            }
        }
    })
})

app.post('/signup', function(req, res){
    var username = req.body.username,
        password = req.body.password,
        secpassword = req.body.secpassword,
        email = req.body.email,
        secemail = req.body.secemail,
        firstname = req.body.firstname,
        lastname = req.body.lastname;

    if (password !== secpassword){
        res.json({status:"ERROR", msg:"Passwords do not match"});
        return;
    }
    
    if (email !== secemail){
        res.json({status:"ERROR", msg:"Emails do not match"});
        return;
    }

    db.all('SELECT COUNT(*) as usernum FROM user WHERE username=\''+username+'\'', function(err, rows){
        if (!rows || rows[0].usernum != 0){
            res.json({status:"ERROR", msg:"Username already exists"});
            return;
        }

        db.run('INSERT INTO user VALUES($username, $password, $mail, $firstname, $lastname)', 
                {
                   $username: username.toLowerCase(),
                   $password: password,
                   $mail: email,
                   $firstname: firstname,
                   $lastname: lastname 
                }
        )

        req.session.username = username.toLowerCase();
        req.session.isauth = true;

        res.json({status:"SUCCESS", lastwanted: req.session.wantedpage});
    })
})

//app.get('/', function(req, res){
//    res.sendFile('index.html');
//});

app.get('/getAllCinemas', function(req, res){
    db.all("SELECT id, name FROM cinema;", function(err, all){
            res.json(all);
    })
});

app.get('/getVenuesForCinema', function(req, res){
    db.all("SELECT v.id, v.name FROM venue v, cinema c where c.id = v.cinema_id and c.id = \"" + req.query.cinema_id + "\"", function(err, all){
            res.json(all);
    })
});

app.get('/getFeaturesForVenue', function(req, res){
    db.all("SELECT f.id, f.name FROM feature f, venue v, cinema c where f.venue_id = v.id and v.cinema_id = c.id and v.id = \"" + req.query.venue_id + "\" and c.id = \"" + req.query.cinema_id + "\"", function(err, all){
            res.json(all);
    })
});

app.get('/getPresentationsForFeatureAndVenue', function(req, res){
    db.all("SELECT p.id, p.time FROM presentation p, feature f, venue v where p.feature_id = f.id and f.venue_id = v.id and p.venue_id = v.id and p.feature_id = \"" + req.query.feature_id + "\" and p.venue_id = \"" + req.query.venue_id + "\" ORDER BY p.time", function(err, all){
            res.json(all);
    })
});

app.get('/getLinkForVenueAndPres', function(req, res){
    db.all("SELECT v.link FROM venue v where v.id = \"" + req.query.venue_id + "\"", function(err, all){
            var link = all[0].link.replace("$PrsntCode$", req.query.pres_id);
            res.end(link);
    })
});

app.get('/getSeatmapForLink', function(req, res){
    var imagename = randomstring.generate();
    console.log(imagename);
    var python = spawn('python3', ['/root/itchy-broccoli/screenOfSeatmap.py', req.query.link, imagename]);
    python.stdout.on('data', function(data){console.log(data.toString('utf8'))});
    python.on('close', function(code){
        console.log(code);
        if (code === 0)
            return res.send(imagename);
        else
            return res.send('error');
    });
});

app.get('/allmovies', function(req, res){
    if (req.session.isauth==true && req.session.username){
        var hour = 3600000;
        req.session.cookie.expires = new Date(Date.now() + hour);
        req.session.cookie.maxAge = hour;
        res.sendFile(root + 'allmovies.html')
    }
    else{
        req.session.wantedpage = '/allmovies';
        res.redirect('/signin')
    }
})
app.get('/getMovies', function(req, res){
        db.all("SELECT * FROM movies WHERE isactive=1 AND username='" + req.session.username + "'", function(err, all){
           res.json(all);
        });
})
app.post('/kill', function(req, res){
    var pid = req.body.pid;
    var password = req.body.password; 

    db.all('SELECT * FROM movies WHERE isactive=1 AND pid=' + pid, function(err, rows){
        if (rows[0].username == req.session.username){
            db.all('SELECT password FROM user WHERE username=\'' + req.session.username + '\'', function(moreerr, morerows){
                if (morerows && morerows[0].password == password){
                    //var terminal = spawn('bash');

                    console.log('Sending kill singal to pid: ' + pid);
                    //var kill = spawn('kill', [-2, pid])
                    var kill = cp.exec('kill -2 ' + pid)
                    //terminal.stdin.write('kill -2 ' + pid + '\n');
                    console.log('Ending terminal session');

                    //terminal.stdin.end();

                    db.run('UPDATE movies SET isactive=0 WHERE pid=$pid AND isactive=1',
                            {
                                $pid : pid,
                            });
                    res.end("DONE");
                }
            })
        }
    })

    })

app.post('/reserve', function(req, res){
    var /*username = req.body.username,*/
        isactive = true,
        /*pincode = req.body.pincode,*/
        iframe = req.body.iframe,
        tiknum = req.body.tiknum,
        row = req.body.row,
        moviename = req.body.moviename,
        moviedate = req.body.moviedate,
        theater = req.body.theater
        leftmost = req.body.leftmost;

    var out = fs.openSync('./log/' + req.session.username + tiknum + row + leftmost + '.log', 'a');
    var err = fs.openSync('./log/' + req.session.username + tiknum + row + leftmost + '.log', 'a');

    var python = spawn('python3', ['/root/itchy-broccoli/saveSeats.py', iframe, tiknum, row, leftmost - 1], {
            stdio: ['ignore', out, err],
            detached: true
        });
    python.unref();

    var seatsArray = [];
    for(var i = 0; i < tiknum; i++){
        seatsArray.push(parseInt(leftmost) + i);
    }

    //db.serialize(function(){
        db.run('INSERT INTO movies VALUES (NULL,$pid,$username,$moviename,$moviedate,NULL,$isactive,$tiknum,$row,$seats,$theater,NULL)',
            {
                $pid : python.pid,
                $username : req.session.username,
                $isactive : isactive,
                $tiknum: tiknum,
                $row: row,
                $seats: seatsArray.join(', '),
                $moviename: moviename,
                $moviedate: moviedate,
                $theater: theater
            }
        );

        res.end('Done.');

        //db.each('SELECT * FROM movies', function(err, row){
        //    res.send(row);
        //})
    //})
});
require('https').createServer(lex.httpsOptions, lex.middleware(app)).listen(443, function () {
      console.log("Listening for ACME tls-sni-01 challenges and serve app on", this.address());
});
