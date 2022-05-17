
var username = ''
var search = 'comments'
var limit = 100

function processPosts(input) {
      var subredditArray = {};
      var json = JSON.parse(input)
      if (!json.data || !json.data.children)
            return [];
      var posts = json.data.children
      posts.forEach(post => {
            var srName = post.data.subreddit_name_prefixed
            if (!subredditArray[srName]) {
                  subredditArray[srName] = 1;
            } else {
                  subredditArray[srName]++;
            }
      });
      var sortedList = Object.entries(subredditArray).sort((a, b) => b[1] - a[1]);
      return sortedList;
}

chrome.runtime.onMessage.addListener((message, sender, reply) => {
      if (message.message === "retrieve_user_comments") {

            usernames = message.authors;
            var list = {}
            var counter = 0;
            for (let i = 0; i < usernames.length; i++) {
                  const name = usernames[i];
                  var oReq = new XMLHttpRequest();
                  oReq.addEventListener("load", (event) => {
                        list[name] = processPosts(event.target.responseText);
                        counter++;
                        if (counter == usernames.length) {
                              reply(list);
                        }
                  });
                  oReq.open("GET", `https://api.reddit.com/user/${name}/${search}?limit=${limit}`);
                  oReq.send();

            }
            return true;
      }
})
