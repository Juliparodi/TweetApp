const { ObjectId } = require('mongodb')
const { post } = require('../router')

const postCollection = require('../db').db().collection("posts")
const ObjectID = require('mongodb').ObjectID
const User = require('./User')
const sanitizeHtml = require('sanitize-html')

let Post = function(data, userId, requestedPostId){
    this.data = data
    this.errors = []
    this.userId = userId
    this.requestedPostId = requestedPostId
}

Post.prototype.create =  async function(){
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        this.validate()
        if(!this.errors.length){
            await postCollection.insertOne(this.data).then((info) =>{
                resolve(info.insertedId)
            }).catch(() => {
                this.errors.push('please try again later')
                reject(this.errors)
            })
        } else {
            reject(this.errors)
        }
    })
}

Post.prototype.update = async function(){
    return new Promise(async (resolve, reject) => {
        try{
            let post = await Post.findSinglePostById(this.requestedPostId, this.userId)
            //
            if(post.isVisitorOwner){
                //actually update DB
                let status = await this.actuallyUpdate(post)
                resolve(status)
            } else {
                reject()
            }
        } catch{
            reject()
        }
    })
}

Post.prototype.actuallyUpdate = function(){
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        this.validate()
        if(!this.errors.length){
            await postCollection.findOneAndUpdate({_id: new ObjectId(this.requestedPostId)}, {$set: {title: this.data.title, body: this.data.body}})
            resolve('success')
        } else {
            resolve('failure')
        }
    })
}

Post.reusablePostQuery = function(uniqueOperations, visitorId){
    return new Promise(async (resolve, reject) => {
        let aggOperations = uniqueOperations.concat([
            {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
            {$project: {
                title: 1,
                body: 1,
                createdDate: 1,
                authorId: "$author",
                author: {
                    $arrayElemAt: ["$authorDocument", 0]
                }
            }}
        ])

        let posts = await postCollection.aggregate(aggOperations).toArray()

        //clean up author property in each post object
        posts = posts.map(function(post){
           post.isVisitorOwner = post.authorId.equals(visitorId)
           
            post.author = {
                username: post.author.username,
                avatar: new User(post.author, true).avatar
            }
            return post
        })
        resolve(posts)
    })
}

Post.findSinglePostById = function(id, visitorId){
    return new Promise(async (resolve, reject) => {
        if(typeof(id) != 'string' || !ObjectId.isValid(id)) {
            reject()
            return
        }
       
        let posts = await Post.reusablePostQuery([
            {$match: {_id: new ObjectId(id)}}
        ], visitorId)

        if(posts.length){
            resolve(posts[0])
        } else {
            reject()
        }

    })
}

Post.findByAuthorId = function(authorId){
    return Post.reusablePostQuery([
        {$match: {author: authorId}},
        //-1 is descending order
        {$sort: {createdDate: -1}}
    ])
}

Post.delete = function(postIdToDelete, currentUserId){
    return new Promise(async (resolve, reject) => {
        try{
            let post = await Post.findSinglePostById(postIdToDelete, currentUserId)
            if(post.isVisitorOwner){
               await postCollection.deleteOne({_id: new ObjectId(postIdToDelete)})
               resolve()
            } else {
                reject()
            }

        } catch {
            reject()
        }
    })}

Post.prototype.validate = function(){
    if(this.data.title == null || this.data.title == "") {this.errors.push("you must provide a title")}
    if(this.data.body == null || this.data.body == "") {this.errors.push("you must provide a body for the post")}
}

Post.prototype.cleanUp = function(){
    if(typeof(this.data.title) != "string"){this.data.title = ""}
    if(typeof(this.data.body) != "string"){this.data.body = ""}

    //get rid of any bogus properties

    this.data = {
        title: sanitizeHtml(this.data.title.trim(), {allowedTags: [], allowedAttributes: {}}),
        body: sanitizeHtml(this.data.body.trim(), {allowedTags: [], allowedAttributes: {}}),
        createdDate: new Date(),
        author: ObjectID(this.userId)
    } 
}


module.exports = Post
