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
        getAllPostTitleDescLikes(UserID).then((PostList) => {
            sortPosts(PostList).then((Result) => {
                resolve(Result)
            })
        })
    })
}

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

async function getAllPostTitleDescLikes(UserID) {
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

}

export default new functions();