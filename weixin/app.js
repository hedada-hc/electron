//
// uuid
const electron = require('electron')
const request  = require('superagent')
const ipc      = require('electron').ipcMain
const app 	   = electron.app
const BrowserWindow 	   = electron.BrowserWindow

let mainWindow

function createWindow(){
	mainWindow = new BrowserWindow({
		width:800,
		height:800,
		// frame:false,
		title:'微信群发机器人'
	})
	mainWindow.loadURL('file://'+__dirname+'/app/index.html')
	mainWindow.webContents.openDevTools()
}
app.on('ready',createWindow)

app.on('window-all-closed',function(){
	app.quit()
})

//网络请求------
function http(){
	var times = Date.parse(new Date());
	var uuid = "https://login.wx.qq.com/jslogin?appid=wx782c26e4c19acffb&redirect_uri=https%3A%2F%2Fwx.qq.com%2Fcgi-bin%2Fmmwebwx-bin%2Fwebwxnewloginpage&fun=new&lang=zh_CN&_="+times
	request
		.get(uuid)
		.end(function(error,res){
			mainWindow.webContents.send('http',res.text)
		})
}

//渲染进程事件------
ipc.on('close',function(){
	console.log('test')
	app.quit()
})

ipc.on('uuid',function(){
	http()
})

ipc.on('status',function(error,url){
	request
		.get(url)
		.end(function(err,msg){
			mainWindow.webContents.send('status',msg.text)
		})
})

var cookies = ''
//获取登录秘钥
ipc.on("keyUrl",function(error,url){
	request
		.get(url)
		.end(function(err,msg){
			cookies = msg.header['set-cookie']  
			console.log("11111111111111111111") 
			         //从response中得到cookie
			mainWindow.webContents.send('keyUrls',msg.text)
		})

})

var setcookie = ''
//获取用户资料
ipc.on('User',function(error,msg){
	var json = JSON.parse(msg)
	var num = Math.random()
	var url = "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxinit?r=216279821&lang=zh_CN&pass_ticket="+json.error.pass_ticket
	console.log(cookies) 
	console.log("222222222222222222222222222") 
	request.post(url)
		.set('Content-Type', 'text/plain')
		.set("Cookie", cookies)  
		.send('{"BaseRequest":{"Uin":"'+json.error.wxuin+'","Sid":"'+json.error.wxsid+'","Skey":"'+json.error.skey+'","DeviceID":"e740492363221392"}}')
		.end(function(err,success){
			//setcookie = success.header['set-cookie']  
			mainWindow.webContents.send('select',success.text)
			
		})
})

//获取好友列表
ipc.on('MemberList',function(error,msg){
	var json = JSON.parse(msg)
	var timestamp = new Date().getTime();
	var url = "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact?lang=zh_CN&pass_ticket="+json.pass_ticket+"&r="+timestamp+"&seq=0&skey="+json.skey
	console.log(cookies)
	console.log("33333333333333333333333") 
	request
		.get(url)
		.set('Content-Type', 'text/plain')
		.set("Cookie", cookies) 
		.end(function(err,success){
			//cookies = success.header['set-cookie']  
			mainWindow.webContents.send('MList',success.text)
		})
})

function RndNum(n) {
    var rnd = "";
    for (var i = 0; i < n; i++) {
        rnd += Math.floor(Math.random() * 10);
    }
    return rnd;
}


//lang=zh_CN&pass_ticket=KkBDuKcjOsNkrVBwFc8W5lk0UFIxXh4VjXwmKypCh5f3ESADI2EffCG1m97udLIs&r=1481558145842&seq=0&skey=@crypt_834e4770_565579e04b963b66f1246c2f5d0a19df
//lang=zh_CN&pass_ticket=yoSh8gBOAsILEkdCspwLbg8HltLhLxrwifknlqoxVAOWgfImFlQ%252Bp6mlvb2mccth&r=1481558004343&seq=0&skey=@crypt_834e4770_138f205611e13c2696cfde50129aac89

//https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact?lang=zh_CN&pass_ticket=yoSh8gBOAsILEkdCspwLbg8HltLhLxrwifknlqoxVAOWgfImFlQ%252Bp6mlvb2mccth&r=1481558004343&seq=0&skey=@crypt_834e4770_138f205611e13c2696cfde50129aac89
//https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact?lang=zh_CN&pass_ticket=KkBDuKcjOsNkrVBwFc8W5lk0UFIxXh4VjXwmKypCh5f3ESADI2EffCG1m97udLIs&r=1481555432020&seq=0&skey=@crypt_834e4770_565579e04b963b66f1246c2f5d0a19df