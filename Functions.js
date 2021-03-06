import {
  AsyncStorage,Platform,Dimensions
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
const frame = Dimensions.get('window');

var firebaseApp = require("firebase/app"); require("firebase/auth"); require("firebase/database"); require("firebase/storage")
var moment = require('moment');

class functions {

getFromAsyncStorage(key) {
    return new Promise(function(resolve, reject) {
        try {
            AsyncStorage.getItem(key.toString()).then((value) => {
                clearTimeout(timeOut)
                resolve(value) 
            })
        } catch (error) {
            // Error getting data or no data
            clearTimeout(timeOut)
            resolve(null)
        }
    let timeOut = setTimeout(function() {
        resolve(null)}
        , 10000)
    })
}

setItemAsyncStorage(key, data) {
    try {
        AsyncStorage.setItem(key, data);
    } catch (error) {
        // Error saving data
    }
}

getAllUserPosts(UserID) {
    return new Promise(function(resolve, reject) {
        getAllPostDetails(UserID).then((PostList) => {
            if (PostList == null) {
                var EmptyList = []
                EmptyList.push({TITLE:"Nothing to show",DESC:"This user has no posts",DATE:null})
                resolve(EmptyList)
            } else {
                sortPosts(PostList,1).then((Result) => {
                    resolve(Result)
                })  
            }
        })
        var timeOut = setTimeout(function() {
            var EmptyList = []
            EmptyList.push({TITLE:"Nothing to show",DESC:"This user has no posts",DATE:null})
            resolve(EmptyList)
        }, 10000)
    })
}

async getTimeline(UserID,limit) {
    return new Promise(function(resolve, reject) {
        var MostRecentPosts = []
        var increment = 0
        getMostRecentPosts(UserID).then((postDates) => {//gets all posts
            if (postDates !== null) {
                sortPosts(postDates,-1).then((sortedDates) => {//sorts them 
                    sortedDates.map(function(item, i) {  
                        getSinglePost(item.DATE,item.USERID).then((RecentPost) => {//gets all single post information
                            RecentPost.map(function(post, i) {
                                checkExpiration(post.USERID,post.DATE).then((expired) => {//checks if expired
                                    if (expired == false) {//adds it to return array
                                        MostRecentPosts.push({TITLE:post.TITLE,DESC:post.DESC,DATE:post.DATE,USERID:post.USERID}) 
                                    } 
                                    increment ++
                                    sortPosts(MostRecentPosts,1).then((sortedRecentDates) => {
                                        if (postDates.length > limit) {
                                            if (sortedDates.length == increment) {
                                                clearTimeout(timeOut)
                                                resolve(sortedRecentDates)
                                            }
                                        } else {
                                            if (sortedDates.length == increment) {
                                                clearTimeout(timeOut)
                                                resolve(sortedRecentDates)
                                            }
                                        }
                                    })
                                })    
                            })
                        })
                    })
                })
            } else {
                clearTimeout(timeOut)
                var EmptyList = []
                EmptyList.push({TITLE:"No posts?",
                DESC:"We couldn't find any posts, try following some more people",DATE:null})
                resolve(EmptyList)
            }
            var timeOut = setTimeout(function() {
                var EmptyList = []
                EmptyList.push({TITLE:"No posts?",
                DESC:"We couldn't find any posts, try following some more people",DATE:null})
                resolve(EmptyList)
            }, 10000)
        })
    })
}

getProfilePicture(UserID) {
    return new Promise(function(resolve, reject) {
        downloadProfile(UserID).then((URI) => {
            clearTimeout(timeOut)
            resolve(URI)
        })
        var timeOut = setTimeout(function() {
        resolve(null)}, 10000)
    })
}

getPostPhoto(UserID,Date) {
    return new Promise(function(resolve, reject) {
        downloadImage(UserID,Date).then((URI) => {
            clearTimeout(timeOut)
            resolve(URI)
        })
        var timeOut = setTimeout(function() {
        resolve(null)}, 10000)
    })
}

downloadProfileImages(ID) {
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

getExpiration(UserID,Date) {
    return new Promise(function(resolve, reject) {
       getPostFromFireBase(UserID,Date,"/expiration").then((data) => {
           if (data !== "") {
                clearTimeout(timeOut)
                resolve(data)
           } else {
                clearTimeout(timeOut)
                resolve(null)
           }
       }) 
    let timeOut = setTimeout(function() {
        resolve(null)}
        , 10000)
    })
}

chooseImage(HEIGHT,WIDTH) {
    return new Promise(function(resolve, reject) {
        ImagePicker.openPicker({
            width:WIDTH,
            height:HEIGHT,
            compressImageQuality:1,
        }).then(image => {
            resolve(image.path)
        });
    })
}

getFollowStatus(accountUserID,viewerUserID) {
    return new Promise(function(resolve, reject) {
        checkFollowStatus(accountUserID,viewerUserID).then((result) => {
            clearTimeout(timeOut)
            resolve(result)
        })
        var timeOut = setTimeout(function() {
        resolve("Request")}, 10000)
    })
}

updateFollowStatus(accountUserID,viewerUserID) {
    return new Promise(function(resolve, reject) {
        checkFollowStatus(accountUserID,viewerUserID).then((result) => {
            if (result == "Followed") {
                unFollowUser(accountUserID,viewerUserID)
                clearTimeout(timeOut)
                resolve("Request")
            } else if (result == "Requested") {
                removeRequestToFollow(accountUserID,viewerUserID)
                clearTimeout(timeOut)
                resolve("Request")
            } else if (result == "Request") {
                requestToFollow(accountUserID,viewerUserID)
                clearTimeout(timeOut)
                resolve("Requested")
            }
        })
        var timeOut = setTimeout(function() {
        resolve("Request")}, 10000)
    })
}

getRequestList(UserID) {
    return new Promise(function(resolve, reject) {
        var RequestedUsers = []
        var Iterations = 0
        var query = firebaseApp.database().ref("UserID/" + UserID + "/requests").orderByKey();
        query.once("value")
        .then(function(requestList) {
            if (requestList.val() !== null) {
                requestList.forEach(function(Request) {//For each request
                    checkIfBlocked(UserID,Request.key).then((blocked) => {
                        if (blocked == false) {
                            RequestedUsers.push({USERID:Request.key})
                            Iterations ++
                            if (Iterations == requestList.numChildren()) {
                                clearTimeout(timeOut)
                                resolve(RequestedUsers)
                            }
                        } else {
                            Iterations ++
                            if (Iterations == requestList.numChildren()) {
                                clearTimeout(timeOut)
                                resolve(RequestedUsers)
                            }  
                        }
                    })        
                })
            } else {
                clearTimeout(timeOut)
                RequestedUsers.push({USERID:"null"})
                resolve(RequestedUsers)
            }
        })
        var timeOut = setTimeout(function() {
        RequestedUsers.push({USERID:"null"})
        resolve(RequestedUsers)}, 10000)
    }) 
}

getDisplayName(UserID) {
    return new Promise(function(resolve, reject) {
        getUserDisplayName(UserID).then((result) => {
            clearTimeout(timeOut)
            resolve(result)
        })
        var timeOut = setTimeout(function() {
        resolve(null)}, 10000)
    }) 
}

followUser(followed,follower) {
    var followRef = firebaseApp.database().ref("UserID/"+ followed + "/followers")
    followRef.child(follower).set({
        user: follower,
    });
    var followingRef = firebaseApp.database().ref("UserID/"+ follower + "/following")
    followingRef.child(followed).set({
        user: followed,
    });
    var followRef = firebaseApp.database().ref("UserID/"+ follower + "/followers")
    followRef.child(followed).set({
        user: followed,
    });
    var followingRef = firebaseApp.database().ref("UserID/"+ followed + "/following")
    followingRef.child(follower).set({
        user: follower,
    });
    removeRequestToFollow(followed,follower)
    removeRequestToFollow(follower,followed)
}

declineRequest(follower,followed) {
    removeRequestToFollow(followed,follower)
}

getPostComments(UserID,Date) {
    return new Promise(function(resolve, reject) {
        getComments(UserID,Date).then((result) => {
            if (result !== null) {
                sortPosts(result,1).then((sortedComments) => {
                    resolve(result)
                })
            } else {
                var EmptyList = [{USERID:"null"}]
                resolve(EmptyList)
            }
        })
    })
}

reportForm(OPTION,DATE,OFFENDER,OFFENSEDATE,TITLE,DESC,MESSAGE) {
    var reportRef = firebaseApp.database().ref("Reports/"+ OPTION + "/" + DATE)
    if (MESSAGE == null) {
        reportRef.child(OFFENSEDATE).set({
            offender: OFFENDER,
            title:TITLE,
            desc:DESC,
        })
    } else {
        reportRef.child(OFFENSEDATE).set({
            offender: OFFENDER,
            message:MESSAGE,
        })
    }
}

blockUser(User,BlockedUser) {
    var blockRef = firebaseApp.database().ref("UserID/"+ User + "/blocked")
    blockRef.child(BlockedUser).set({
        user: BlockedUser,
    });
    removeRequestToFollow(User,BlockedUser)
    unFollowUser(User,BlockedUser)
}

unblockUser(User,BlockedUser) {
    var blockRef = firebaseApp.database().ref("UserID/"+ User + "/blocked")
    blockRef.child(BlockedUser).remove()
}

getList(UserID,Type) {
    return new Promise(function(resolve, reject) {
        var UserList = []
        var Iterations = 0
        var query = firebaseApp.database().ref("UserID/" + UserID + "/" + Type).orderByKey();
        query.once("value")
        .then(function(allUsers) {
            if (allUsers.val() !== null) {
                allUsers.forEach(function(User) {//For each user  
                    UserList.push({USERID:User.key})
                    Iterations ++
                    if (Iterations == allUsers.numChildren()) {
                        clearTimeout(timeOut)
                        resolve(UserList)
                    }      
                })
            } else {
                clearTimeout(timeOut)
                UserList.push({USERID:"null"})
                resolve(UserList)
            }
        })
        var timeOut = setTimeout(function() {
        UserList.push({USERID:"null"})
        resolve(UserList)}, 10000)
    }) 
}

getArray(UserID,Type) {
    return new Promise(function(resolve, reject) {
        var UserList = []
        var Iterations = 0
        var query = firebaseApp.database().ref("UserID/" + UserID + "/" + Type).orderByKey();
        query.once("value")
        .then(function(allUsers) {
            if (allUsers.val() !== null) {
                allUsers.forEach(function(User) {//For each user  
                    UserList[Iterations] = User.key
                    Iterations ++
                    if (Iterations == allUsers.numChildren()) {
                        clearTimeout(timeOut)
                        resolve(UserList)
                    }      
                })
            } else {
                clearTimeout(timeOut)
                UserList.push({USERID:"null"})
                resolve(UserList)
            }
        })
        var timeOut = setTimeout(function() {
        UserList.push({USERID:"null"})
        resolve(UserList)}, 10000)
    }) 
}

checkIfUserBlocked(accountUserID,BlockedUserID) {
    return new Promise(function(resolve, reject) {
        checkIfBlocked(accountUserID,BlockedUserID).then((result) => {
            clearTimeout(timeOut)
            resolve(result)
        })
        var timeOut = setTimeout(function() {
            resolve(false)}, 10000)
    }) 
}

searchForUser(query) {
    return new Promise(function(resolve, reject) {
        var foundUsers = []
        var increment = 0
        var userRef = firebaseApp.database().ref("UserID").orderByKey()
        userRef.once('value', (usersSnapshot) => {
            if (usersSnapshot.val() !== null) {
                usersSnapshot.forEach(function(User) {
                    getUserDisplayName(User.key).then((displayName) => {
                        if (displayName.toLowerCase().includes(query.toLowerCase())) {
                            foundUsers.push({USERID:User.key})
                        }
                        increment = increment + 1;
                        if (increment == usersSnapshot.numChildren()) {
                            clearTimeout(timeOut)
                            resolve(foundUsers)
                        }
                    })
                })
            } else {
               clearTimeout(timeOut)
               foundUsers.push({USERID:"null"})
                resolve(foundUsers) 
            }
        var timeOut = setTimeout(function() {
            foundUsers.push({USERID:"null"})
            resolve(foundUsers)}, 10000)
        }) 
    })
}

}

function getUserDisplayName(UserID) {
    return new Promise(function(resolve, reject) {
        var query = firebaseApp.database().ref("UserID/" + UserID + "/Name").orderByKey();
        query.once("value")
        .then(function(name) {
            resolve(name.val())
        })
        var timeOut = setTimeout(function() {
        resolve(null)}, 10000)
    }) 
}

function checkIfBlocked(accountUserID,BlockedUserID) {
    return new Promise(function(resolve, reject) {
        var blocked = false
        var increment = 0
        var blockRef = firebaseApp.database().ref("UserID/"+ accountUserID + "/blocked")
        blockRef.once('value', (blockedSnapshot) => {
            if (blockedSnapshot.val() !== null) {
                blockedSnapshot.forEach(function(User) {
                    if (User.key == BlockedUserID) {
                        blocked = true
                    }
                    increment = increment + 1;
                    if (increment == blockedSnapshot.numChildren()) {
                        clearTimeout(timeOut)
                        resolve(blocked)
                    }
                })
            } else {
               clearTimeout(timeOut)
                resolve(blocked) 
            }
        var timeOut = setTimeout(function() {
        resolve(false)}, 10000)
        }) 
    })
}

function getComments(UserID,Date) {
    return new Promise(function(resolve, reject) {
        var commentQuery = firebaseApp.database().ref("UserID/" + UserID + "/posts/" + Date + "/comments")
            commentQuery.once("value").then(function(AllComments) {
                var CommentList = []
                    AllComments.forEach(function(comment) {
                        var commentDesc,commentUser = ""
                        commentQuery.child(comment.key + "/desc").once("value").then(function(desc) {
                            commentDesc = desc.val()
                        })
                        commentQuery.child(comment.key + "/userID").once("value").then(function(user) {
                            commentUser = user.val()
                            CommentList.push({DESC:commentDesc,DATE:comment.key,USERID:commentUser})
                            if (CommentList.length == AllComments.numChildren()) {
                                clearTimeout(timeOut)
                                resolve(CommentList)
                            }
                        })
                    })
            })
        var timeOut = setTimeout(function() {
        resolve(null)}, 10000)
    })
}

function checkFollowStatus(accountUserID,viewerUserID) {
    return new Promise(function(resolve, reject) {
        checkIfFollowed(accountUserID,viewerUserID).then((followed) => {
            if (followed == false) {
                checkIfRequested(accountUserID,viewerUserID).then((requested) => {
                    if (requested == false) {
                        clearTimeout(timeOut)
                        resolve("Request")
                    } else {
                        requestToFollow(accountUserID,viewerUserID)
                        clearTimeout(timeOut)
                        resolve("Requested")
                    }
                })
            } else {
                clearTimeout(timeOut)
                resolve("Followed")
            }
        })
        var timeOut = setTimeout(function() {
        resolve("Request")}, 10000)
    }) 
}

function unFollowUser(accountUserID,viewerUserID) {
    var followRef = firebaseApp.database().ref("UserID/"+ accountUserID + "/followers").child(viewerUserID)
    followRef.remove()
    var followingRef = firebaseApp.database().ref("UserID/"+ viewerUserID + "/following").child(accountUserID)
    followingRef.remove()
    var followRef = firebaseApp.database().ref("UserID/"+ viewerUserID + "/followers").child(accountUserID)
    followRef.remove()
    var followingRef = firebaseApp.database().ref("UserID/"+ accountUserID + "/following").child(viewerUserID)
    followingRef.remove()
}

function removeRequestToFollow(accountUserID,viewerUserID) {
    var requestRef = firebaseApp.database().ref("UserID/"+ accountUserID + "/requests").child(viewerUserID)
    requestRef.remove()
}

function requestToFollow(accountUserID,viewerUserID) {
    checkIfRequested(accountUserID,viewerUserID).then((result) => {
        if (result == false) {
            var requestRef = firebaseApp.database().ref("UserID/"+ accountUserID + "/requests")
            requestRef.child(viewerUserID).set({
                user: viewerUserID,
            });
        } 
    }) 
}

function checkIfFollowed(accountUserID,viewerUserID) {
    return new Promise(function(resolve, reject) {
        var followed = false
        var increment = 0
        var followRef = firebaseApp.database().ref("UserID/"+ accountUserID + "/followers")
        followRef.once('value', (followSnapshot) => {
            if (followSnapshot.val() !== null) {
                followSnapshot.forEach(function(Follower) {
                    if (Follower.key == viewerUserID) {
                        followed = true
                    }
                    increment = increment + 1;
                    if (increment == followSnapshot.numChildren()) {
                        clearTimeout(timeOut)
                        resolve(followed)
                    }
                })
            } else {
               clearTimeout(timeOut)
                resolve(followed) 
            }
        var timeOut = setTimeout(function() {
        resolve(null)}, 10000)
        }) 
    })
}

function checkIfRequested(accountUserID,viewerUserID) {
    return new Promise(function(resolve, reject) {
        var requested = false
        var increment = 0
        var requestRef = firebaseApp.database().ref("UserID/"+ accountUserID + "/requests")
        requestRef.once('value', (requestSnapshot) => {
            if (requestSnapshot.val() !== null) {
                requestSnapshot.forEach(function(request) {
                    if (request.key == viewerUserID) {
                        requested = true
                    }
                    increment = increment + 1;
                    if (increment == requestSnapshot.numChildren()) {
                        clearTimeout(timeOut)
                        resolve(requested)
                    }
                })
            } else {
               clearTimeout(timeOut)
                resolve(requested) 
            }
        var timeOut = setTimeout(function() {
        resolve(null)}, 10000)
        }) 
    })
}

function checkExpiration(UserID,Date) {
    return new Promise(function(resolve, reject) {
        getExpirationDate(UserID,Date).then((expirationDate) => {
            if ((expirationDate <= moment().format('YYYYMMDDHHmm')) && (expirationDate !== "")) {
                var postsRef = firebaseApp.database().ref("UserID/"+ UserID + "/posts")
                postsRef.child(Date).remove()
                var imageRef = firebaseApp.storage().ref('Users/' + UserID).child(Date)
                if (imageRef !== null) {
                    imageRef.delete()
                } 
                clearTimeout(timeOut)
                resolve(true)
            } else {
                clearTimeout(timeOut)
                resolve(false)
            }
        })
        let timeOut = setTimeout(function() {
        resolve(null)}
        , 10000)
    })
}

function getExpirationDate(UserID,Date) {
    return new Promise(function(resolve, reject) {
       getPostFromFireBase(UserID,Date,"/expiration").then((data) => {
           if (data !== "") {
                clearTimeout(timeOut)
                resolve(data)
           } else {
                clearTimeout(timeOut)
                resolve(null)
           }
       }) 
    let timeOut = setTimeout(function() {
        resolve(null)}
        , 10000)
    })
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
        var dateQuery = firebaseApp.database().ref("UserID/" + UserID + "/posts").orderByKey()
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
            if (FollowedUsers !== null) {
                var MostRecentPosts = []
                var Iterations = 0
                FollowedUsers.forEach(function(User) {//For each followed user
                    getPostDates(User.key).then((postDates) => {
                        sortPosts(postDates,1).then((sortedDates) => {
                            sortedDates.map(function(item, i) {
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
            } else {
                clearTimeout(timeOut)
                resolve(null)
            }
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
                            UserPosts.push({TITLE:postTitle,DESC:postDesc,DATE:postDetails.key,LIKES:postLikes,USERID:UserID})
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

async function sortPosts(UserPosts,invert) {
    return new Promise(function(resolve, reject) {
        UserPosts.sort((num1, num2) => {
        if (num1.DATE < num2.DATE) {
            return 1 * invert;
        }
        if (num1.DATE > num2.DATE) {
            return -1 * invert;
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
                    checkExpiration(UserID,childSnapshot.key).then((expired) => {
                        if (expired == false) {
                            UserPosts.push({TITLE:postTitle,DESC:postDesc,DATE:childSnapshot.key,LIKES:postLikes,USERID:UserID})
                        } 
                        if (UserPosts.length  == snapshot.numChildren()) {
                            clearTimeout(timeOut)
                            resolve(UserPosts)
                        }
                    })
                })    
            })
        }).catch((error) => {
            clearTimeout(timeOut)
            resolve(null)
        })
        var timeOut = setTimeout(function() {
        resolve(null)}, 10000)
    })
}

function downloadImage(ID,date) {
    return new Promise(function(resolve, reject) {
        if (date !== null) {
            firebaseApp.storage().ref('Users/' + ID).child(date).getDownloadURL().then(function(url) {
                resolve(url)
            }).catch((error) => {
                resolve(null)
            })
        }
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

function downloadProfile(ID) {
    return new Promise(function(resolve, reject) {
        firebaseApp.storage().ref('Users/' + ID).child('Profile').getDownloadURL().then(function(url) {
            clearTimeout(timeOut)
            resolve(url)
        }).catch((error) => {
            firebaseApp.storage().ref('greyBackground.png').getDownloadURL().then(function(defaultImage) {
                clearTimeout(timeOut)
                resolve(defaultImage)
            })
        })
        var timeOut = setTimeout(function() {
        resolve(null)}, 10000)
    })
}

export default new functions();