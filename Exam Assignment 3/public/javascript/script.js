let socket = io.connect()

socket.on('issue', function (data) {
  addMessage('New Notification! User: ' + data.user + ', Action: ' + data.action + ', Title: ' + data.title)
})

socket.on('issueList', function (data) {
  addIssue(data.number, data.title, data.body, data.link, data.commentCounter, data.createdAt, data.updatedAt)
})

socket.on('issueRemove', function (data) {
  removeIssue(data.number)
})

socket.on('issue_comment', function (data) {
  if (data.action === 'created') {
    addMessage('New notification! User: ' + data.user + ', Action: New comment, Title: ' + data.title)
  } else if (data.action === 'edited') {
    addMessage('New notification! User: ' + data.user + ', Action: Comment edited, Title: ' + data.title)
  } else if (data.action === 'deleted') {
    addMessage('New notification! User: ' + data.user + ', Action: Comment deleted, Title: ' + data.title)
  } else {
    addMessage('New notification! User: ' + data.user + ', Action: ' + data.action + ', Title: ' + data.title)
  }
})

function addMessage (message) {
  let text = document.createTextNode(message)
  let li = document.createElement('li')
  let messages = document.getElementById('messages')

  li.appendChild(text)
  messages.appendChild(li)
}

function removeIssue (number) {
  let li = document.getElementById('li' + number)
  li.parentNode.removeChild(li)
}

function addIssue (number, title, desc, link, comm, cDate, uDate) {
  let issue = document.getElementById('issue')

  let li = document.createElement('li')
  li.setAttribute('id', 'li' + number)

  let div = document.createElement('div')
  div.setAttribute('id', 'ribbon')

  let h3 = document.createElement('h3')
  let text = document.createTextNode(title)

  let pBody = document.createElement('p')
  let body = document.createTextNode(desc)

  let a = document.createElement('a')
  let links = document.createTextNode(link)

  let pComment = document.createElement('p')
  let comment = document.createTextNode(comm)

  let pCreated = document.createElement('p')
  let created = document.createTextNode(cDate)

  let pUpdated = document.createElement('p')
  let updated = document.createTextNode(uDate)

  h3.appendChild(text)
  pBody.appendChild(body)
  a.appendChild(links)
  pComment.appendChild(comment)
  pCreated.appendChild(created)
  pUpdated.appendChild(updated)
  div.appendChild(h3)
  div.appendChild(pBody)
  div.appendChild(a)
  div.appendChild(pComment)
  div.appendChild(pCreated)
  div.appendChild(pUpdated)
  li.appendChild(div)
  issue.appendChild(li)
}
