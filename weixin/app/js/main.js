const ipc = require('electron').ipcRenderer
const parseString = require('xml2js').parseString;
ipc.on('http',function(error,success){
	//window.QRLogin.code = 200; window.QRLogin.uuid = "ob4xFTZAJA==";
	vues.uuids(success)
})

var vues = new Vue({
	el:"#app",
	data:{
		uuid:'',
		uid:'',
		test:'',
		img:'',
		pass_ticket:'',
		skey:'',
		wxsid:'',
		wxuin:'',
		user:'',
		select:false,
		username:''
	},
	methods:{
		close:function(){
			ipc.send('close')
		},
		requests:function(){
			ipc.send('uuid')
		},
		uuids:function(uuids){
			code = uuids.substr(22,3)
			if(code == 200){
				this.uuid = "https://login.weixin.qq.com/qrcode/"+uuids.substr(uuids.length-14,12)
				this.uid = uuids.substr(uuids.length-14,12)
			}else{
				console.log("二维码获取失败")
			}
		}
	}
})


//获取登录状态
function status(){
	var times = Date.parse(new Date());
	var url = 'https://login.wx.qq.com/cgi-bin/mmwebwx-bin/login?loginicon=true&uuid='+vues.uid+'&tip=1&r=294227615&_='+times
	ipc.send('status',url)
	
}
/*
window.code=200;
window.redirect_uri="https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxnewloginpage?ticket=ASbUcX63poJa_4Qg8Bh8Fn8P@qrticket_0&uuid=obkL2WAzSw==&lang=zh_CN&scan=1481542789";
*/

var item = setInterval(status,1000)
var re = 1
ipc.on('status',function(error,success){
	vues.test = success.substr(12,3)
	if(vues.test == 201){
		vues.img = success.substr(37,success.length-2)
		vues.img = vues.img.substr(0,vues.img.length-2)
		vues.uuid = vues.img
		console.log(success)
	}else if(vues.test == 200){
		clearInterval(item)
		var keyUrl = success.replace('\n','');
		keyUrl = keyUrl.substr(37,keyUrl.length-2)
		keyUrls = keyUrl.substr(0,keyUrl.length-2)+"&fun=new&version=v2&lang=zh_CN"
		console.log(keyUrls)
		if(re ==1){
			re = 0
			ipc.send('keyUrl',keyUrls)

		}
		
		console.log('keyurl')
		
	}

})

//获取登录key
ipc.on("keyUrls",function(error,success){
	parseString(success, function (err, result) {
		var xml = JSON.stringify(result)
		var key = JSON.parse(xml)
		if(key.error.wxuin != 0){
			vues.skey = key.error.skey
			vues.wxsid = key.error.wxsid
			vues.wxuin = key.error.wxuin
			vues.pass_ticket = key.error.pass_ticket
			ipc.send('User',xml)
			console.log(xml)
		}
	});
})

//https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxinit?r=216278221&lang=zh_CN&pass_ticket=28QWbQJnqHZhHdRQvKOV3ot5T%252B5D1%252FKns9nWctO81b2STQZ5p87Rp1hyQYaymXaT
//获取账户资料
ipc.on('select',function(error,success){
	var user = JSON.parse(success)
	vues.user = user
	vues.username = user.User.UserName
	vues.select = true
	ipc.send('MemberList','{"pass_ticket":"'+vues.pass_ticket+'","skey":"'+vues.skey+'"}')
})

//获取好友列表
//https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact?lang=zh_CN&pass_ticket=LOLG3JTJIB0%252BzDK%252FcvjrNKj%252Bk%252BRtxxIWz6m7i%252BKPyIN4jh65V9KRXKZ0EaltAeZi&r=1481555432020&seq=0&skey=@crypt_834e4770_9a640affc62d53b4552f77e4ca567068
//lang=zh_CN&pass_ticket=LOLG3JTJIB0%252BzDK%252FcvjrNKj%252Bk%252BRtxxIWz6m7i%252BKPyIN4jh65V9KRXKZ0EaltAeZi&r=1481555432020&seq=0&skey=@crypt_834e4770_9a640affc62d53b4552f77e4ca567068
//MemberList  //MemberCount
ipc.on('MList',function(error,success){
	var json = JSON.parse(success)
	console.log(json)
})


//https://webpush.wx.qq.com/cgi-bin/mmwebwx-bin/synccheck?r=1481555432025&skey=%40crypt_834e4770_9a640affc62d53b4552f77e4ca567068&sid=iZGsdvjHrib29vJ8&uin=1087016540&deviceid=e481328963556091&synckey=1_661132755%7C2_661132954%7C3_661132951%7C1000_1481543488&_=1481555418843
//r=1481555432025&skey=%40crypt_834e4770_9a640affc62d53b4552f77e4ca567068&sid=iZGsdvjHrib29vJ8&uin=1087016540&deviceid=e481328963556091&synckey=1_661132755%7C2_661132954%7C3_661132951%7C1000_1481543488&_=1481555418843
//心跳包 window.synccheck={retcode:"0",selector:"2"}


//发送消息
//https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxsendmsg?lang=zh_CN&pass_ticket=LOLG3JTJIB0%252BzDK%252FcvjrNKj%252Bk%252BRtxxIWz6m7i%252BKPyIN4jh65V9KRXKZ0EaltAeZi
//{"BaseRequest":{"Uin":1087016540,"Sid":"iZGsdvjHrib29vJ8","Skey":"@crypt_834e4770_9a640affc62d53b4552f77e4ca567068","DeviceID":"e843744528275506"},"Msg":{"Type":1,"Content":"在研究软件","FromUserName":"@5045c58840fe9fc941648a0a827c64f4","ToUserName":"@fa18a99df3ad815a704118bce88b4969a0300d51bf3c9e741f5bdf9977a013c2","LocalID":"14815556195930777","ClientMsgId":"14815556195930777"},"Scene":0}