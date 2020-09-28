const electron = require('electron');
const url = require('url');
const {app, BrowserWindow, Menu, ipcMain} = electron;

const path = require('path');


let mail;
let pass;
let message;
let list;

let mainWindow;
let addWindow;

// console.log("test");

app.on('ready', function (){
    mainWindow = new BrowserWindow({

            title:'Mass Mail Sender by Andro320',
            webPreferences: {
                nodeIntegration: true,
            }
        }
    );
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    mainWindow.setFullScreen = true;

    mainWindow.on('closed', function (){
        app.quit();
    })

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu)
});


function createLogInWindow(){
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title:'Add Shoping List Item',
        webPreferences: {
            nodeIntegration: true,
        }
    });
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    addWindow.removeMenu()
    addWindow.on('close', function (){
        addWindow = null;
    })
}
Menu.setApplicationMenu(null)

ipcMain.on('item:add', function (e, item){
    console.log(item);
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
})

ipcMain.on('start', function (e, item){
    console.log(item);
    sendMail(item[0], item[1], item[2], item[3], item[4]);
});

const mainMenuTemplate = [
    {
        label: 'Settings',
        submenu: [
            {
                label: 'Log in',
                click(){
                    createLogInWindow();
                }
            },
            {
                label: 'Clear everything',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            },
        ]
    }
];
if (process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// if (process.env.NODE_ENV !== 'production'){
//     mainMenuTemplate.push({
//         label: 'Developer tools',
//         submenu: [
//             {
//                 label: 'Togle debtools',
//                 accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
//                 click(item, focusedWindow){
//                     focusedWindow.toggleDevTools();
//                 }
//             },
//             {
//                 role: 'reload'
//             }
//
//         ]
//     })
// }

let work = 1;

function sendMail(mail="no_mail", pass="no_pass", message="message", subject="subject", list="none@none") {
  work = 1;

  ipcMain.on('stop', function (){
      work=0;
  });
  if (work==0) {
    return;
  }

  const nodemailer = require('nodemailer');

  let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: mail,
          pass: pass
      }
  });
  let receiver = "";
  array = list.split("\n");
  console.log(array);

  for (var i = 0; i < array.length; i++) {
    receiver = array[i];
    let mailOptions = {
      from: mail,
      to: receiver,
      subject: subject,
      text: message
    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        // console.log(error);
        mainWindow.webContents.send('log:add', error);
      }
      else {
        // console.log('Email sent: ' + info.response);
        mainWindow.webContents.send('log:add', 'Email sent: ' +receiver+" "+ info.response.substring(0, 12));
      }
    });
  }

}
