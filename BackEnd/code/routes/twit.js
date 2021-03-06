const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

require('dotenv').config();
let Post = require('../models').Post;
const { verify } = require('./middlewares');

let router = express.Router();
router.use(cors());

fs.readdir('uploads', (error)=>{
    if (error) {
        console.error('uploads 폴더가 없어 uploads 폴더를 서버의 디스크에 생성합니다');
        fs.mkdirSync('uploads');
    }
});

// 미들웨어 객체
let upload = multer({
    storage: multer.diskStorage({
        // 파일 저장 경로 설정
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        // 파일 이름 설정
        filename(req, file, cb) {
            // 파일 확장자 추출
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
        },
    }),
    // 파일 사이즈 제한 설정
    limits: {fileSize : 5 * 1024 * 1024}
});

router.post('/img', upload.single('img'), async (req, res)=> {
//    console.log(req.file);
    res.json({ url : `/img/${req.file.filename}`});
});

router.post('/', async (req, res)=>{
    let err = {};
    let token = req.get("token");
    try {
        let auth = verify(token, process.env.JWT_SECRET);
        if(auth) { // 인증성공
            let post = await Post.create({
                userId: auth,
                content: req.body.content,
                img: req.body.img
            });
            if(post) {
                res.status(201).json({
                    post
                });
            } else {
                err.status = 500;
                err.message = '트윗 추가를 실패했습니다';
                throw err;
            }
        } else {
            err.status = 401;
            err.message = '올바르지 않은 사용자입니다';
            throw err;
        }
    } catch (err) {
        res.json({
            status: err.status,
            message: err.message
        })
    }
});

router.get('/', async(req, res)=>{
    let err = {};
    let token = req.get("token");
    try {
        let auth = verify(token, process.env.JWT_SECRET);
        if(auth) { // 인증설공
            let posts = await Post.findAll({
                where: {userId: auth}
            });
            if (posts)
            {
              res.json({
                  num: posts.length,
                  posts
              })
            }
        } else {
            err.status = 401;
            err.message = '올바르지 않은 사용자입니다';
            throw err;
        }
    } catch (err) {
        res.json({
            status: err.status,
            message: err.message
        })
    }
});

module.exports = router;