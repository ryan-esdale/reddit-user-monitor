
// Handle added DOM from RES infinite scrolling
document.addEventListener('DOMNodeInserted', (event) => {
      // console.log(typeof (event.target));
      if ((event.target) instanceof HTMLDivElement && event.target.className == "sitetable linklisting") {
            let resAuthorBlocks = [];
            let resAuthors = [];
            if (event.target.querySelector("p.tagline")) {
                  event.target.querySelectorAll("p.tagline").forEach((tagline) => {
                        const author = tagline.getElementsByClassName('author')[0];
                        resAuthorBlocks.push(author);
                        if (!resAuthors.includes(author.innerHTML)) {
                              resAuthors.push(author.innerHTML);
                        }
                  });
            }
            // console.log(resAuthors);
            chrome.runtime.sendMessage({ "message": "retrieve_user_comments", "authors": resAuthors }, function (response) {
                  // console.log(response);
                  formatHTML(resAuthorBlocks, response);
            });
      }
})


// Fetch tagline authors, on main pages, this returns multiple authors, one for each post
// On a comment thread there is only one result
let taglineAuthor = [];
if (document.querySelector("p.tagline")) {
      document.querySelectorAll("p.tagline").forEach((tagline) => {
            taglineAuthor.push(tagline.getElementsByClassName('author')[0]);
      });
}

//Side bar of mods too?
let modAuthors = [];
if (document.querySelector("ul.content"))
      modAuthors = document.querySelector("ul.content").getElementsByClassName('author');

var distinctSet = [];
var topSRlookup = [];
for (const author of taglineAuthor) {
      if (author && !distinctSet.includes(author.innerHTML))
            distinctSet.push(author.innerHTML)
}
for (const author of modAuthors) {
      if (author && !distinctSet.includes(author.innerHTML))
            distinctSet.push(author.innerHTML)
}

function formatHTML(htmlElementCollection, response) {
      for (const htmlElement of htmlElementCollection) {
            if (!htmlElement)
                  continue;
            const username = htmlElement.innerHTML;
            let addHTML = "";
            if (response[username]) {
                  addHTML += "<span style='font-size: very-small'> ("
                  if (response[username].length == 0) {
                        addHTML += 'No comments';
                  } else {
                        response[username].slice(0, 3).forEach(subreddit => {
                              addHTML += `<a href='https://www.reddit.com/${subreddit[0]}'>` + subreddit[0] + " " + subreddit[1] + "</a>, ";
                        });
                        addHTML = addHTML.slice(0, addHTML.length - 2);
                  }
                  addHTML += ")</span>"
                  htmlElement.insertAdjacentHTML("afterend", addHTML);
            }
      }
}

chrome.runtime.sendMessage({ "message": "retrieve_user_comments", "authors": distinctSet }, function (response) {
      // console.log(response);
      formatHTML(taglineAuthor, response);
      formatHTML(modAuthors, response);
});

