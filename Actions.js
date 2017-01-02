import PostContents from 'ExtendedProject/postContents'

class actions {
  constructor (props) {
  this.postTitle = "Original"
  this.postDesc = "Original"
  this.postDate = ""
  this.postList = []
  this.postOne = null
  this.postTwo = null
  this.postTitleList = []
  this.postDescList = []
  this.postLikes = 0
  this.liked = false
  this.visible = false
  this.UserID = ""
  this.Username = ""
  this.password = ""
  this.spun = false
  this.crossSpun = false
}

  loadPost(title,desc,date,likes,userID) {
    this.postList.push({TITLE: title,
                        DESC: desc,
                        LIKES: likes,
                        USERID: userID,
                        DATE: date}
                        )
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
    //this.readArray(this.postList)
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
  }
  goodLogin() {
    this.visible = false
  }

  alternateSpin (num) {
    if (num == 1) {
      if (this.spun == false) {
        this.spun = true
      } else {
        this.spun = false
      }
    } else {
      if (this.crossSpun == false) {
        this.crossSpun = true
      } else {
        this.crossSpun = false
      }
    }
  }

  setUserInfo(username,password,userID) {
    this.UserID = userID
    this.Username = username
    this.password = password
    //alert("User Info " + this.UserID + this.Username + this.password)
  }
}

export default new actions();
