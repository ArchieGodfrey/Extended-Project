import {
  AsyncStorage,Platform
} from 'react-native';

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database"); require("firebase/storage")


class functions {

getFromAsyncStorage(key) {
    return new Promise(function(resolve, reject) {
        try {
            AsyncStorage.getItem(key.toString()).then((value) => {
                clearTimeout(timeOut)
                resolve(value) 
            })
        } catch (error) {
            // Error getting data
            //alert('No data')
            clearTimeout(timeOut)
            resolve(null)
        }
    let timeOut = setTimeout(function() {
        resolve(null)}
        , 10000)
    })
}

getAllUserPosts(UserID) {
    return new Promise(function(resolve, reject) {
        getAllPostDetails(UserID).then((PostList) => {
            sortPosts(PostList).then((Result) => {
                resolve(Result)
            })
        })
    })
}

getTimeline(UserID,limit) {
    return new Promise(function(resolve, reject) {
        var MostRecentPosts = []
        getMostRecentPosts(UserID).then((postDates) => {
            sortPosts(postDates).then((sortedDates) => {
                sortedDates.map(function(item, i) {  
                    getSinglePost(item.DATE,item.USERID).then((RecentPost) => {
                        RecentPost.map(function(post, i) {
                            MostRecentPosts.push({TITLE:post.TITLE,DESC:post.DESC,DATE:post.DATE,LIKES:post.LIKES,USERID:post.USERID,URI:post.URI})
                            if (sortedDates.length < limit) {
                                if (MostRecentPosts.length == sortedDates.length) {
                                    clearTimeout(timeOut)
                                    resolve(MostRecentPosts)
                                } else {
                                    if (MostRecentPosts.length == limit) {
                                        clearTimeout(timeOut)
                                        resolve(MostRecentPosts)
                                    }
                                }
                            }
                            
                        })
                    })
                })
            }) 
            var timeOut = setTimeout(function() {
            resolve(null)}, 10000)
        })
    })
}

getProfilePicture(UserID) {
    return new Promise(function(resolve, reject) {
        downloadProfileImages(UserID).then((URIS) => {
            clearTimeout(timeOut)
            resolve(URIS[0])
        })
        var timeOut = setTimeout(function() {
        resolve(null)}, 10000)
    })
}

}

function getFollowedUsers(UserID) {
    return new Promise(function(resolve, reject) {
        var query = firebaseApp.database().ref("UserID/" + UserID + "/following").orderByKey(); //Get all followed Users
            query.once("value")
            .then(function(FollowedUsers) {
                clearTimeout(timeOut)
                resolve(FollowedUsers)
            })
        var timeOut = setTimeout(function() {
        resolve(null)}, 10000)
    })
}

function getPostDates(UserID) {
    return new Promise(function(resolve, reject) {
        var postDates = []
        var dateQuery = firebaseApp.database().ref("UserID/" + UserID + "/posts").orderByKey();
            dateQuery.once("value").then(function(AllDates) {
                if (AllDates.val() !== null) {
                    AllDates.forEach(function(Date) {//Push each of the dates into one array with UserID
                        postDates.push({DATE:Date.key,USERID:UserID})
                        if (postDates.length == AllDates.numChildren()) {
                            clearTimeout(timeOut)
                            resolve(postDates)
                        }
                    })
                } else {
                    resolve(postDates)
                }
                
                
            })
        var timeOut = setTimeout(function() {
        resolve(null)}, 10000)
    })
}

async function getMostRecentPosts(UserID) {
    return new Promise(function(resolve, reject) {
        getFollowedUsers(UserID).then((FollowedUsers) => {
            var MostRecentPosts = []
            var Iterations = 0
            FollowedUsers.forEach(function(User) {//For each followed user
                getPostDates(User.key).then((postDates) => {
                    postDates.map(function(item, i) {
                        MostRecentPosts.push({DATE:item.DATE,USERID:item.USERID})
                    })
                    Iterations ++
                    if (Iterations == FollowedUsers.numChildren()) {
                        clearTimeout(timeOut)
                        resolve(MostRecentPosts)
                    }
                })
            })
        })
        var timeOut = setTimeout(function() {
        resolve(null)}, 10000)
    })
}

function getSinglePost(Date,UserID) {
    return new Promise(function(resolve, reject) {
        var UserPosts = []
        var query = firebaseApp.database().ref("UserID/" + UserID + "/posts").orderByKey();
            query.once("value").then(function(posts) {
                posts.forEach(function(postDetails) {
                    if (postDetails.key == Date) {
                        var postTitle,postDesc,postLikes = ""
                        getPostFromFireBase(UserID,postDetails.key,"/title").then((title) => {
                            postTitle = title
                        })
                        getPostFromFireBase(UserID,postDetails.key,"/desc").then((desc) => {
                            postDesc = desc
                        })
                        getPostFromFireBase(UserID,postDetails.key,"/likes").then((likes) => {
                            postLikes = likes
                        })
                        downloadImage(UserID, postDetails.key).then((url) => {
                            UserPosts.push({TITLE:postTitle,DESC:postDesc,DATE:postDetails.key,LIKES:postLikes,USERID:UserID,URI:url})
                            clearTimeout(timeOut)
                            resolve(UserPosts)
                        }) 
                    }
                })
            })
        var timeOut = setTimeout(function() {
        resolve(null)}, 10000)
    })
} 

async function sortPosts(UserPosts) {
    return new Promise(function(resolve, reject) {
        UserPosts.sort((num1, num2) => {
        if (num1.DATE < num2.DATE) {
            return 1;
        }
        if (num1.DATE > num2.DATE) {
            return -1;
        }
        // a must be equal to b
        return 0;
        }).then(resolve(UserPosts))
    })
  }

async function getAllPostDetails(UserID) {
    return new Promise(function(resolve, reject) {
        var UserPosts = []
        var query = firebaseApp.database().ref("UserID/" + UserID + "/posts").orderByKey();
        query.once("value").then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var postTitle,postDesc,postLikes = ""
                getPostFromFireBase(UserID,childSnapshot.key,"/title").then((title) => {
                    postTitle = title
                })
                getPostFromFireBase(UserID,childSnapshot.key,"/desc").then((desc) => {
                    postDesc = desc
                })
                getPostFromFireBase(UserID,childSnapshot.key,"/likes").then((likes) => {
                    postLikes = likes
                })
                downloadImage(UserID, childSnapshot.key).then((url) => {
                    UserPosts.push({TITLE:postTitle,DESC:postDesc,DATE:childSnapshot.key,LIKES:postLikes,USERID:UserID,URI:url})
                    if (UserPosts.length == snapshot.numChildren()) {
                        clearTimeout(timeOut)
                        resolve(UserPosts)
                    }
                }) 
            })
        })
        var timeOut = setTimeout(function() {
        resolve(null)}, 10000)
    })
}

function downloadImage(ID,date) {
    return new Promise(function(resolve, reject) {
        var Realurl = ""
        firebaseApp.storage().ref('Users/' + ID).child(date).getDownloadURL().then(function(url) {
            Realurl = url
            resolve(Realurl)
        }).catch((error) => {
            firebaseApp.storage().ref('greyBackground.png').getDownloadURL().then(function(url2) {
            Realurl = url2
            resolve(Realurl)
            })
        })
    })
  }

function getPostFromFireBase(UserID,Date,Type) {
    return new Promise(function(resolve, reject) {
    var postRef = firebaseApp.database().ref("UserID/" + UserID + "/posts/" + Date + Type)
            postRef.once('value', (Snapshot) => {
                clearTimeout(timeOut)
                resolve(Snapshot.val())
            })

        let timeOut = setTimeout(function() {
            resolve(null)}
        , 10000)
    })
}

    function downloadProfileImages(ID) {
    return new Promise(function(resolve, reject) {
        firebaseApp.storage().ref('Users/' + ID).child('Profile').getDownloadURL().then(function(url) {
         Realurl = url
         firebaseApp.storage().ref('Users/' + ID).child('Background').getDownloadURL().then(function(url2) {
           Realurl2 = url2
           resolve([Realurl, url2])
         }).catch((error) =>  {
           firebaseApp.storage().ref('greyBackground.png').getDownloadURL().then(function(url2) {
             Realurl2 = url2
             resolve([Realurl, Realurl2])
           })
         })
       }).catch((error) => {
         firebaseApp.storage().ref('blackBackground.png').getDownloadURL().then(function(url) {
           Realurl = url
           firebaseApp.storage().ref('Users/' + ID).child('Background').getDownloadURL().then(function(url2) {
             Realurl2 = url2
             resolve([Realurl, url2])
           }).catch((error) =>  {
             firebaseApp.storage().ref('greyBackground.png').getDownloadURL().then(function(url2) {
               Realurl2 = url2
               resolve([Realurl, Realurl2])
             })
           })
         })
       })
    })
}


export default new functions();