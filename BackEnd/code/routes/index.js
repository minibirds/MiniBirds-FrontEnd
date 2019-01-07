const express = require('express');
const cors = require('cors');
const { Sequelize: {Op} } = require('../models');
let Post = require('../models').Post;
let User = require('../models').User;
let Following = require('../models').Following;
const { verify } = require('./middlewares');
const router = express.Router();
router.use(cors());

//자신이 팔로우 한 사람의 게시물을 최신 순으로 가져오는 API
router.get('/:id', async (req, res)=>{
    let err = {};
    let token = req.cookies.sign;
    try {
        let auth = verify(token, 'entry_minibirds');
        if(auth < 0) {
            err.status=401;
            throw err;
        }
        if(auth == req.params.id) {
            follow = await Following.findAll({
                attributes: ['FollowingId'],
                where: {userId: req.params.id}
            });
                if(follow) {
                    let query = [];
                    for(let i=0; i<follow.length; i++) {
                        query[i] = {userId : follow[i].dataValues.FollowingId};
                    }
                    console.log(query);
                    let posts = await Post.findAll({
                        where: {
                            [Op.or]: query
                        },
                        order:[['createdAt','DESC']]
                    });
                    if(posts) {
                        res.json(posts);
                    }
                } else {
                    err.status = 404;
                    err.message = '팔로우 중인 사람이 없어 게시물이 없습니다';
                    throw err;
                }
        } else {
            err.message = '권한이 없는 사용자입니다';
            err.status = 401;
            throw err;
        }
    } catch (err) {
        res.json({
            status: err.status,
            message: err.message
        })
    }
});

// 사용자의 정보를 수정하는 API
router.put('/:id', async (req, res)=>{
    let token = req.cookies.sign;
    let err = {};
    try {
        let auth = verify(token, 'entry_minibirds');
        if(auth < 0) throw err;
        if(auth == req.params.id) {
            if(req.body.nickname) { // 닉네임 변경시
                await User.update(
                    {nickname: req.body.nickname},
                    {where: {id: req.params.id}}
                )
            }
            if(req.body.password) { // 비밀번호 변경시
                await User.update(
                    {password: req.body.password},
                    {where: {id: req.params.id}}
                )
            }
            if(req.body.intro) { // 한줄소개 변경시
                await User.update(
                    {intro: req.body.intro},
                    {where: {id: req.params.id}}
                )
            }
            let user = await User.findOne({
                where : {id: req.params.id}
            });
            if(user) res.json(user);
            else {
                err.message = 404;
                err.message = 'id 에 해당하는 사용자를 찾을 수 없습니다';
                throw err;
            }
        }
        else {
            err.status = 403;
            err.message = '다른 사람의 정보는 수정할 수 없습니다';
            throw err;
        }
    } catch (err) {
        res.json({
            status: err.status,
            message: err.message
        });
    }
});

// userId 와 postId로 게시물을 검색하여 삭제하는 API
router.delete('/:userId/:postId', async (req, res)=>{
    let err = {};
    let token = req.cookies.sign;
    try {
        let auth = verify(token, 'entry_minibirds');
        if(auth < 0) throw err;
        if(auth == req.params.userId) {
            let post = await Post.findOne({
                where: {userId: req.params.userId, postId: req.params.postId}
            });
            if(post) {
                Post.destroy({
                    where: {postId: req.params.postId}
                });
                res.json({'message':'게시물을 삭제하였습니다'});
            } else {
                err.status = 404;
                err.message = '삭제하려는 게시물을 찾을 수 없습니다';
                throw err;
            }
        }
    } catch (err) {
        res.json({
            status: err.status,
            message: err.message
        })
    }
});

module.exports = router;