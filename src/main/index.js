'use strict'

import { app, BrowserWindow } from 'electron'
const request = require('request')
const util = require('util')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

process.on('uncaughtException', function (error) {
  console.log('uncaughtException', error)
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

const {ipcMain} = require('electron')

function getProxyList (page, pageSize, callback) {
  var url = 'http://localhost:8000/proxy_list?page=' + page + '&page_size=' + pageSize
  request(url, function (error, response, body) {
    if (error) {
      console.log(error)
      callback(body, false)
    }
    body = JSON.parse(body)
    if (body.length) {
      callback(body, true)
    } else {
      callback(body, false)
    }
  })
}
ipcMain.on('get-proxy', (event, arg) => {
  console.log('get-proxy')
  var proxyList = []
  var callback = function (pl, hn) {
    if (hn) {
      proxyList = proxyList.concat(pl)
      getProxyList(++page, pageSize, callback)
      var attr = {
        count: proxyList.length,
        page: page,
        pageSize: pageSize
      }
      event.sender.send('get-proxy-reply:attr', attr)
    } else {
      event.sender.send('get-proxy-reply:finish', proxyList)
    }
  }

  var page = 1
  var pageSize = 200
  getProxyList(page, pageSize, callback)
})

ipcMain.on('check-proxy', (event, proxyList) => {
  proxyList.forEach(proxy => {
    var httpProxy = util.format('http://%s:%s', proxy.ip, proxy.port)
    var url = 'https://httpbin.org/get'
    process.env.HTTP_PROXY = httpProxy
    request(url, function (error, response, body) {
      if (error) {
        console.log(error)
      }
      body = JSON.parse(body)
      event.sender.send('check-proxy-reply:one', proxy)
    })
  })
})
