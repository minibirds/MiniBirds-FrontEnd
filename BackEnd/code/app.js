const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const session = require('express-session');
// .env 파일을 읽어 process.env 객체에 넣음
require('dotenv').config();

const indexRouter = require('./routes');
const authRouter = require('./routes/auth');
const twitRouter = require('./routes/twit');
const followingRouter = require('./routes/following');
const followerRouter = require('./routes/follower');
const profileRouter = require('./routes/profile');
const sequelize = require('./models').sequelize;

let winston =  require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename : 'info.log'}),
        new winston.transports.File({ filename : 'error.log'}),
    ]
});

const app = express();
sequelize.sync();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine','pug');
app.set('port', process.env.PORT || 5000);
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, './node-slate/images')));
app.use('/api', express.static(path.join(__dirname, 'api-docs')));
app.use(express.json());
app.use(express.urlencoded({ extended : false , limit: '50mb'}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized : false,
    secret : process.env.COOKIE_SECRET,
    cookie : {
        httpOnly : true,
        secure : false,
    }
}));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/twit', twitRouter);
app.use('/following',followingRouter);
app.use('/follower',followerRouter);
app.use('/profile', profileRouter);

// 해당 라우터가 없을시 404 Error 발생
app.use((req, res, next)=>{
    const err = new Error('Not Found');
    err.status = 404;
    logger.info(req.method +' '+ req.url + ' Error: ' + err.message);
    next(err);
});

// 에러 핸들러
app.use((err, req, res) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render(error);
});

app.listen(app.get('port'), ()=> {
    console.log(app.get('port'), '번 포트에서 대기 중');
});