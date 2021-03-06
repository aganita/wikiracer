'use strict'
const { httpsProxy } = require('./https-proxy')
const { getChildUrls } = require('./parse-page')

const getPath = async (sourceUrl, targetUrl) => {
  const visitedNodes = {
    [sourceUrl]: {}
  }

  let currentUrl = '',
      currentPage = '',
      childUrls = []

  const q = [sourceUrl]

  while (q.length) {
    currentUrl = q.shift()
    try {
      currentPage = await httpsProxy(currentUrl)
    } catch (err) {
      console.log(`There is a problem with ${currentUrl} `, err)
      continue
    }
    childUrls = getChildUrls(currentPage, currentUrl)
    for (let i = 0; i < childUrls.length; i++) {
      if (childUrls[i] === targetUrl) {
        let path = getPathArr(targetUrl, currentUrl, visitedNodes)
        return {
          start: sourceUrl,
          end: targetUrl,
          path
        }
      } else if (!visitedNodes[childUrls[i]]) {
        visitedNodes[childUrls[i]] = { parent: currentUrl }
        q.push(childUrls[i])
      }
    }
  }

  return {}
}

const getPathArr = (url, parent, map) => {
  let current = map[parent]
  let path = []

  path.push(url)
  path.push(parent)

  while (current.parent) {
    path.push(current.parent)
    current = map[current.parent]
  }

  return path.reverse()
}

module.exports = {
  getPath
}