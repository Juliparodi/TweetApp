const Post = require('../models/Post')

exports.viewCreateScreen = function(req, res){
    res.render('create-post')
}

exports.create = async function(req, res){
    let post = new Post(req.body, req.session.user._id)
    post.create().then(function(newId){
        req.flash('success', 'new post successfully created.')
        req.session.save(function(){
            res.redirect(`/post/${newId}`)
        })
    }).catch(function(errors){
        errors.forEach(function(error){
            req.flash('errors', error)
        })
        req.session.save(function(){
            res.redirect('/create-post')
        })
    })
}

exports.viewSingle = async function(req, res){
    try{
        let post = await Post.findSinglePostById(req.params.id, req.visitorId)
        res.render('single-post-screen', {post: post})
    } catch{
        res.render('404')
    }
}

exports.viewEditScreen = async function(req, res) {
    try {
      let post = await Post.findSingleById(req.params.id, req.visitorId)
      if (post.isVisitorOwner) {
        res.render("edit-post", {post: post})
      } else {
        req.flash("errors", "You do not have permission to perform that action.")
        req.session.save(() => res.redirect("/"))
      }
    } catch {
      res.render("404")
    }
  }

exports.editScreen = async function(req, res){
        let post = new Post(req.body, req.visitorId, req.params.id)
        post.update().then((status)=> {
            //the post was successfully updated on the DB
            //or user did have permissions, but there were validations errors
            if(status == 'success'){
                //post updated in DB
                req.flash('success', 'post successfully updated')
                req.session.save(function(){
                    res.redirect(`/post/${req.params.id}/edit`)
                })
            } else{
                post.errors.forEach(function(error){
                    req.flash('errors', error)
                })
                req.session.save(function(){
                    res.redirect(`/post/${req.params.id}/edit`)
                })
            }

        }).catch(() => {
            // a post with request id doesn't exist, or the current visitor is not the owner of the post
            req.flash('errors', 'you do not have permissions to perform this action')
            req.session.save(function(){
                res.redirect('/')
            })
        })
}

exports.deletePost = function(req, res){
    Post.delete(req.params.id, req.visitorId).then(function(){
        req.flash('success', 'post successfully deleted')
        req.session.save(function(){
            res.redirect(`/profile/${req.session.user.username}`)
        })

    }).catch(function(){
        console.log('catch?')
        req.flash('errors', 'you do not have permissions to perform this action')
        req.session.save(function(){
            res.redirect('/')
        })
    })
}