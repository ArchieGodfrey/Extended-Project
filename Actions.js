import PostContents from 'ExtendedProject/postContents'
import FeedComponent from 'ExtendedProject/feedComponent'
import index from 'ExtendedProject/index.ios'
class actions {
  constructor (props) {
  this.postTitle = "Original"
  this.nextPostTitle = "Next"
  this.prevPostTitle = "Previous"
  this.nextPostDesc = "Next"
  this.prevPostDesc = "Previous"
  this.nextPostDate = "Next"
  this.prevPostDate = "Previous"
  this.nextPostLikes = "Next"
  this.prevPostLikes = "Previous"
  this.postDesc = "Original"
  this.postDate = 0
  this.postList = []
  this.postOne = null
  this.postTwo = null
  this.postTitleList = []
  this.postDescList = []
  this.postLikes = 0
  this.liked = false
  this.visible = false
  this.nextPostUserID = ""
  this.prevPostUserID = ""
  this.Username = ""
  this.password = ""
  this.name = ""
  this.profDesc = ""
  this.otherName = ""
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
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve()}, 1000)
      })
  }

  getPostList() {
    var list = this.postList
    function save() {
      return list
    }
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve(save())}, 1000)
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
    } else {
      if (this.pressed == false) {
        this.pressed = true
      } else {
        this.pressed = false
      }
    }
  }

  setUserInfo() {
    return this.UserID
    //this.Username,
    //this.password
    //alert("User Info " + this.UserID + this.Username + this.password)
  }
}

export default new actions();
