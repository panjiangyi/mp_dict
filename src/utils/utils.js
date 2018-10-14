export default class {
    static navi(url) {
        wx.navigateTo({
            url
        })
    }
    static goback(delta=1){
        wx.navigateBack({
            delta
        })
    }
    static toastError(title = '添加失败') {
        wx.showToast({
            icon: 'none',
            mask: true,
            title
        })
    }
    static getOpenid() {
        return new Promise((res, rej) => {
            wx.login({
                success: function (loginCode) {
                    var appid = 'wxb68e03b957eb1a9c'; //填写微信小程序appid  
                    var secret = '9110816a35f73a5b716d2ddbfea51fdc'; //填写微信小程序secret  

                    //调用request请求api转换登录凭证  
                    wx.request({
                        url: 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&grant_type=authorization_code&js_code=' + loginCode.code,
                        header: {
                            'content-type': 'application/json'
                        },
                        success(d) {
                            //获取openid  
                            res(d.data.openid)
                        },
                        fail(d) {
                            rej(d)
                        }
                    })
                }
            })
        })

    }
} 