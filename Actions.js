import PostContents from 'EP/postContents'
import FeedComponent from 'EP/feedComponent'
import index from 'EP/index.ios'
class actions {
  constructor (props) {
  this.postTitle = "Original"
  this.postDesc = "Original"
  this.postDate = 0
  this.postList = []
  this.userPosts = []
  this.otherUserPosts = []
  this.postLikes = 0
  this.liked = false
  this.visible = false
  this.Username = ""
  this.password = ""
  this.name = ""
  this.profDesc = ""
  this.otherName = "Loading"
  this.otherprofDesc = "Loading"
  this.otherUserID = ""
  this.spun = false
  this.highlight = false
  this.crossSpun = false
  this.pressed = false
  this.following = false
  this.foundUsers = []
  this.followedUsers = []
  this.isLoading = true
  this.login = false
  this.width = 0
  this.height = 0
}

  loadPost(title,desc,date,likes,userID) {
    this.postList.push({TITLE: title,
                        DESC: desc,
                        LIKES: likes,
                        USERID: userID,
                        DATE: date})
    this.postList.sort((num1, num2) => {
      if (num1.DATE < num2.DATE) {
        return 1;
      }
      if (num1.DATE > num2.DATE) {
        return -1;
      }
      // a must be equal to b
      return 0;
    });
  }

  loadAccountPosts(title,desc,date,likes,userID) {
    this.userPosts.push({TITLE: title, DESC: desc, DATE: date, LIKES: likes, USERID: userID})
  }

  loadOtherAccountPosts(title,desc,date,likes,userID) {
    this.otherUserPosts.push({TITLE: title, DESC: desc, DATE: date, LIKES: likes, USERID: userID})
  }

  getAccountPostList() {
    var list = this.userPosts
    list.sort((num1, num2) => {
      if (num1.DATE < num2.DATE) {
        return 1;
      }
      if (num1.DATE > num2.DATE) {
        return -1;
      }
      // a must be equal to b
      return 0;
    })
    return new Promise(function(resolve, reject) {
      if (list !== null) {
        resolve(list)
      } else {
        alert('empty list before showing')
      }
      })
  }

  getOtherAccountPostList() {
    var list = this.otherUserPosts
    list.sort((num1, num2) => {
      if (num1.DATE < num2.DATE) {
        return 1;
      }
      if (num1.DATE > num2.DATE) {
        return -1;
      }
      // a must be equal to b
      return 0;
    })
    return new Promise(function(resolve, reject) {
      if (list !== null) {
        resolve(list)
      } else {
        alert('empty list before showing')
      }
      })
  }

  getPostList() {
    var list = this.postList
    return new Promise(function(resolve, reject) {
      if (list !== null) {
        resolve(list)
      } else {
        alert('empty list before showing')
      }
      /*setTimeout(function() {
        reject(list, alert('error'))}, 1000)
        */
      })
  }

  searchFunction(ID, name) {
    this.foundUsers.push({USERID: ID,
                        NAME: name})
  }

  orderUsers(name,date) {
    this.followedUsers.push({NAME: name,
                        DATE: date})
    for (var i=0; i < this.followedUsers.length; i++) {
      this.followedUsers.sort((num1, num2) => {
        if (num1.DATE < num2.DATE) {
          return 1;
        }
        if (num1.DATE > num2.DATE) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });
    }
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve()}, 1000)
      })
  }

  tryLike(thisUser) {
    if (thisUser == this.UserID) {
      this.liked = true
    } else {
      this.liked = false
    }
  }

  readArray(array) {
    return array.map(function(item, i) {
      alert("The post is " + item.TITLE + item.DESC + item.DATE + i)
    })
  }
  badLogin() {
    this.visible = true
    this.login = false
  }
  goodLogin() {
    this.visible = false
    this.login = true
  }

  alternateSpin (num) {
    if (num == 1) {
      if (this.spun == false) {
        this.spun = true
      } else {
        this.spun = false
      }
    } else if (num == 0) {
      if (this.crossSpun == false) {
        this.crossSpun = true
      } else {
        this.crossSpun = false
      }
    } else if (num == 3) {
      if (this.highlight == false) {
        this.highlight = true
      } else {
        this.highlight = false
      }
    } else if (num == 4) {
      if (this.liked == false) {
        this.liked = true
      } else {
        this.liked = false
      }
    } else {
      if (this.pressed == false) {
        this.pressed = true
      } else {
        this.pressed = false
      }
    }
  }
}

export default new actions();
