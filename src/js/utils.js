/******************************************************************************************
 *@Desc: 统一工具类模块
 *@Author: Wanglei
 *@Date: 2023-04-06 18:49:06
 *@module  Utils
 ******************************************************************************************
*/
// 公共变量
// const URL_NODE_SERVER = "http://127.0.0.1:8088/";
const URL_NODE_SERVER = "/api";


const URL_GLOBAL = {
    serve: "http://localhost:8082/html",
    // serve:"http://192.168.14.72:8081//html",
    index: "/index.html", //首页
    login: "/login.html", //登录
    reg: "/reg.html",
    tests_list: "/tests-list.html",// 试题列表
    tests_basic_info: "/tests-basic-info.html", //试题基本信息，考试开始界面
    tests_end: "/tests-end.html",
    exercises: "/exercises.html",    // 做题界面
    answers: "/answers.html",  //  解析页面
    center: "/center.html",  // 个人中心
    collections: "/collections.html",  // 收藏夹
    errors: "/errors.html",  //错题集
}

/**
 * 获取对应的页面地址  index login
 * @param {String} type 
 */
export function getURL(type = "index") {

    let url = URL_GLOBAL.serve;
    if (type == "index") {
        url += URL_GLOBAL.index;
    } else if (type == "login") {
        url += URL_GLOBAL.login;
    } else if (type == "reg") {
        url += URL_GLOBAL.reg;
    } else if (type == "tests_list") {
        url += URL_GLOBAL.tests_list;
    } else if (type == "tests_basic_info") {
        url += URL_GLOBAL.tests_basic_info;
    } else if (type == "tests_end") {
        url += URL_GLOBAL.tests_end;
    } else if (type == "exercises") {
        url += URL_GLOBAL.exercises;
    } else if (type == "answers") {
        url += URL_GLOBAL.answers;
    } else if (type == "center") {
        url += URL_GLOBAL.center;
    } else if (type == "collections") {
        url += URL_GLOBAL.collections;
    } else if (type == "errors") {
        url += URL_GLOBAL.errors;
    } else {
        url += URL_GLOBAL.index;
    }
    return url
}
// 不是登录状态就跳转 到登录页面
export async function isLogin() {
    return new Promise(async (resolve, reject) => {
        let isLogin = false;
        try {
            let option = {
                url: "/users/getUserInfo",
                method: "get",
            }
            let res = await $cn(option);
            if (res.code == 1) {
                if (res.data[0]) {
                    isLogin = true;
                }
            }
            if (!isLogin) {
                confirm("未登录");
                location.href=getURL("login");
            }
            resolve(isLogin);
        } catch (error) {
            reject(isLogin)
        }  
    })
}
/**
 * 删除或增加对应元素的类名
 * @param {Object} obj  原生js对象
 * @param {String} Class  类名
 * nlTogetherClass(obj, "active", "active")
 */
export function nlTogetherClass(obj, Class = '') {
    const objClass = obj.className;
    if (objClass == "") {
        obj.className = Class;
        return;
    }
    let classArr = objClass.split(" ");
    const index = classArr.findIndex(items => {
        return items == Class;
    })
    if (index == -1) { //没有就新增
        obj.className = obj.className + ` ${Class}`;
    } else {
        classArr.splice(index, 1);
        obj.className = classArr.join(" ");
    }
    return;
}

/**
     * 获取指定时区的时间戳；因为目前还无法直接修改date对象的时区，所以使用时间戳方式返回
     * @param {时间对象} date 
     * @param {时差} zone   比如东八区与格林尼治时间（GMT）差8小时就传 8
     * @returns 
     */
function getZoneTime(date, zone) {
    var offset_GMT = date.getTimezoneOffset();
    var current = date.getTime();
    var targetDate = new Date(current + offset_GMT * 60 * 1000 + zone * 60 * 60 * 1000);
    return targetDate.getTime();
}
// 判断登录状态  登录 true
export async function judgeLogin() {
    return new Promise(async (resolve, reject) => {
        let isLogin = false;
        try {
            let option = {
                url: "/users/getUserInfo",
                method: "get",
            }
            let res = await $cn(option);
            if (res.code == 1) {
                if (res.data[0]) {
                    isLogin = true;
                }
            }
            resolve(isLogin);
        } catch (error) {
            reject(isLogin)
        }  
    })

}
/**
* 
* @param {要格式化的日期格式} type   YYYY-MM-DD hh:mm:ss.S
* @param {时间对象} date 
* @returns 
*/
export function getFormatTime(type, date) {
    let formatTime = type.replace("YYYY", date.getFullYear()).replace("MM", date.getMonth() + 1).replace("DD", date.getDate());//年月日
    formatTime = formatTime.replace("hh", date.getHours() < 10 ? "0" + date.getHours() : date.getHours());//时
    formatTime = formatTime.replace("mm", date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());//分
    formatTime = formatTime.replace("ss", date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds());//秒
    formatTime = formatTime.replace("S", date.getMilliseconds());//毫秒
    return formatTime;
};

/**  
 * 防抖函数
 * func 执行函数
 * wait 等待时间  毫秒
 * imMe false 动作完毕之后延迟执行  true  立即执行一次，后续不执行
*/
export function debounce(func, wait, even, _this = this, imMe = false) {
    var timer = null;
    return function () {
        console.log("debounce");
        console.log(timer);
        if (timer != null) {

            clearTimeout(timer);
        }
        if (imMe) {
            console.log("true");
            const state = !timer;
            timer = setTimeout(function () {
                timer = null;
            }, wait);
            if (state) {
                func(_this, even);
            }
        } else {
            console.log("false");
            console.log(wait);
            timer = setTimeout(func(_this, even), wait);
        }
    };
}
/**
    * 节流
    * fn  执行函数
    * wait 间隔时间  毫秒
   */
export function throttle(fn, wait) {
    var timer = "";
    return function (e) {
        const _this=this;
        const _jqThis=$(this);
        if (timer == "") {
            fn(e,_this,_jqThis);
            timer = setTimeout(() => {
                timer = "";
            }, wait)
        }
    }
}

// 对象深克隆
function deepClone(obj) {
    let rtn = '';
    // 先判断数组，数组也是对象的一种
    if (obj instanceof Array) {
        rtn = cloneArray(obj);
    } else if (obj instanceof Object) {
        rtn = cloneObject(obj);
    } else {
        rtn = obj;
    }
    return rtn;
}
//对象克隆
function cloneObject(object) {
    let rtn = {};
    for (const key in object) {
        if (Object.hasOwnProperty.call(object, key)) {
            rtn[key] = deepClone(object[key]);
        }
    }
    return rtn;
}
//数组克隆
function cloneArray(array) {
    let rtn = [];
    array.forEach(function (element) {
        rtn.push(deepClone(element));
    });
    return rtn;
}
/**
 * 将字符串格式化为数值
 */
function formatNum(str) {
    let rtn = '';
    if (String(+str) == 'NaN') {
        rtn = parseInt(str);
    } else {
        rtn = +str;
    }
    return rtn;
}

// 获取每毫米的像素值
function getOneMmsPx() {
    // 创建一个1mm宽的元素插入到页面，然后坐等出结果
    let div = document.createElement('div');
    div.id = 'mm';
    div.style.width = '1mm';
    document.querySelector('body').appendChild(div);
    // 原生方法获取浏览器对元素的计算值
    let mm1 = document.getElementById('mm').getBoundingClientRect();
    console.log(mm1);
    div.remove();
    return mm1.width;
}

/**
 *@Desc:connect node 后端
 *@Author: Wanglei
 *@Date: 2023-04-06 15:12:18
 *@param {}  
 *@return  Promise对象
*/
// 默认异步  jquery  Promise
export function $cn({ url, method = "post", data = "", async = true, dataType = "json", timeout = 3000 } = {}) {
    url = URL_NODE_SERVER + url;
    const token = getLocal("token");
    if (data != "") {
        data = JSON.stringify(data);  //  contentType:"application/json"的时候必须串json字符串
    }

    const exclude = /\/login|\/reg/;
    if (token == "" && !exclude.test(url)) {
        return { code: -901, msg: "没有token" };
    }
    return new Promise((resolve, reject) => {
        $.ajax({
            type: method, url: url, data, dataType, async, timeout, // 超时设置 单位毫秒
            contentType: "application/json", //"application/json" "application/x-www-form-urlencoded"
            headers: {
                //将token每次请求的时候放在请求头中，然后需要在token之前拼接'Bearer '
                Authorization: 'Bearer ' + token
            },
            success: (res) => {
                resolve(res);
            },
            error: (res) => {
                // reject(res.status);  
                resolve(res.status);
            },
        });
    })
}
// 图片路径加上服务器路径
export function getImageUrl(imgUrl) {
    return imgUrl = URL_NODE_SERVER + imgUrl;

}

// 时间格式化
export function formatSeconds(value) {
    var secondTime = parseInt(value); // 秒
    var minuteTime = 0; // 分
    var hourTime = 0; // 小时
    if (secondTime > 60) {
        //如果秒数大于60，将秒数转换成整数
        //获取分钟，除以60取整数，得到整数分钟
        minuteTime = parseInt(secondTime / 60);
        //获取秒数，秒数取余，得到整数秒数
        secondTime = parseInt(secondTime % 60);
        //如果分钟大于60，将分钟转换成小时
        if (minuteTime > 60) {
            //获取小时，获取分钟除以60，得到整数小时
            hourTime = parseInt(minuteTime / 60);
            //获取小时后取余的分，获取分钟除以60取余的分
            minuteTime = parseInt(minuteTime % 60);
        }
    }
    return `${hourTime >= 10 ? hourTime : "0" + hourTime}:
            ${minuteTime >= 10 ? minuteTime : "0" + minuteTime}:
            ${secondTime >= 10 ? secondTime : "0" + secondTime}
        `;
}
// 用于文件传输  头像
export function $upFile(data) {
    const url = URL_NODE_SERVER + '/files/fileUp';
    const token = getLocal("token");
    const exclude = /\/login|\/register/;
    if (token == "" && !exclude.test(url)) {
        return { code: -901, msg: "没有token" };
    }
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "post", url: url, data, // 超时设置 单位毫秒
            //禁止jqueryAjax对传输的数据格式进行内部处理
            dataType: "json",
            contentType: false,
            processData: false,
            headers: {
                //将token每次请求的时候放在请求头中，然后需要在token之前拼接'Bearer '
                Authorization: 'Bearer ' + token
            },
            success: (res) => {
                resolve(URL_NODE_SERVER + res.data);
            },
            error: (res) => {
                reject(res);
            },
        });
    })
}


// 追加本地存储
function saveLocal(key, jsonObj) {
    let arr = JSON.parse(localStorage.getItem(key) || '[]');
    let id = arr[arr.length - 1] ? arr[arr.length - 1].id + 1 : 0;
    jsonObj.id = id;
    arr.push(jsonObj);
    localStorage.setItem(key, JSON.stringify(arr));
}
// 修改本地存储 ，其实就是覆盖，
export function updateLocal(key, str) {
    localStorage.setItem(key, str);
    return 1;
}
// 获取本地存储
export function getLocal(key) {
    let str = localStorage.getItem(key) || '{}';
    return str;
}

// 利用本地存储存储参数
export function saveParma(params) {
    params = { ...JSON.parse(getLocal("params")), ...params };
    updateLocal("params", JSON.stringify(params));
}
// 获取参数 return 对象
export function getParma(params) {
    return JSON.parse(getLocal("params"));
}

// 利用本地存储存储参数
export function clearParma() {
    localStorage.removeItem("params");
}