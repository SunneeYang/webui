import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    width: 1280,
    height: 1024,
    resizable: false,
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}

// Menu
const { Menu, MenuItem } = require('electron')
const menu = new Menu()
menu.append(new MenuItem({
  label: '选项',
  submenu: [{
    label: '开发者工具',
    role: 'toggleDevTools',
    accelerator: 'F12',
    click: () => { win.webContents.openDevTools() }
  },{
    label: '关闭',
    role: 'close',
    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+Q',
    click: () => { app.quit() }
  }]
}))
menu.append(new MenuItem({
  label: '功能',
  submenu: [{
    label: 'Excel',
    accelerator: 'F1',
    click: () => { win.webContents.send('router:path', '/excel') }
  },{
    label: 'Config',
    accelerator: 'F2',
    click: () => { win.webContents.send('router:path', '/config') }
  }]
}))

Menu.setApplicationMenu(menu)

// app
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  console.log('open-win handled')

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

ipcMain.handle('dialog:openFile', async (_, arg) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties:['openFile'] })
  if (canceled) {
    return
  } else {
    win?.webContents.send('dialog:path', filePaths)
    return filePaths
  }
})

ipcMain.handle('dialog:openDirectory', async (_, arg) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties:['openDirectory'] })
  if (canceled) {
    return
  } else {
    win?.webContents.send('dialog:path', arg, filePaths)
    return filePaths
  }
})

// child process
const exec = require("child_process").exec
const iconv = require('iconv-lite')
ipcMain.handle('shell:exec', (_, arg) => {
  exec(arg, { encoding: "buffer" }, function(error, stdout, stderr){
    if(error) {
      console.error('error: ' + error);
      return;
    }

    const decoded_stdout = iconv.decode(stdout, 'cp936')
    const decoded_stderr = iconv.decode(stderr, 'cp936')
    console.log('stdout: ' + decoded_stdout);
    console.log('stderr: ' + decoded_stderr);

    win?.webContents.send('shell:stdout', {error: error, stdout: decoded_stdout, stderr: decoded_stderr})
  });
})



