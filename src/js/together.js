/******************************************************************************************
 *@Desc: 登录界面与注册界面共用此js
 *@Author: Wanglei
 *@Date: 2023-04-08 23:10:57
 *@module  
 *@return 
 ******************************************************************************************
*/

// 引入模块
import { $cn, $upFile,getImageUrl, getURL, getParma, saveParma, getFormatTime, updateLocal, throttle } from './utils';
import UI from './ui';
import { renderFooter, renderHeader } from './ui';
import '../scss/ui.scss';
import "../scss/together.scss";
UI.autoSize(window, document); //宽度自适应

main();

function main() {
    // 登录界面初始化
    let pageObj = document.querySelector("body.login");
    if (pageObj != null) {
        pageObj.onload = function () {
            loginMain();
        };
    }
    // 注册界面初始化
    pageObj = document.querySelector("body.register");
    if (pageObj != null) {
        pageObj.onload = function () {
            regMain();
        };
    }
    // 个人中心界面初始化
    pageObj = document.querySelector("body.center");
    if (pageObj != null) {
        pageObj.onload = function () {
            centerMain();
        };
    }
}

function loginMain() {
    ; (function () {
        // 手机号格式验证
        $(".username").on("blur", function () {
            username($(this));
        })
        function username(jqObj) {
            const value = jqObj.val();
            const regExp = /^(?:(?:\+|00)86)?1\d{10}$/;
            if (regExp.test(value)) {
                jqObj.css("border-color", "#24c32f")
                jqObj.siblings(".msg").text("");
                return value;
            } else {
                jqObj.css("border-color", "#fd1c1c")
                jqObj.siblings(".msg").text("请输入正确手机号");
                return -1;
            }
        }
        // 密码格式验证
        $(".pwd").on("blur", function () {
            pwd($(this));
        })
        function pwd(jqObj) {
            const value = jqObj.val();
            const regExp = /(^([A-Za-z])+\d*)/;
            if (regExp.test(value) && value.length > 5 && value.length < 9) {
                jqObj.css("border-color", "#24c32f")
                jqObj.siblings(".msg").text("");
                return value;
            } else {
                jqObj.css("border-color", "#fd1c1c")
                jqObj.siblings(".msg").text("请输入第一个字母，且位数是6到8位的密码");
                return -1;
            }
        }
        // 登录
        $("#login").on("click", async function () {
            const phone = username($("#username"));
            const password = pwd($("#pwd"));
            if (phone == -1 || password == -1) {
                return;
            }
            const option = {
                url: "/users/login",
                data: {
                    phone, password
                }
            }
            const res = await $cn(option);
            if (res.code == 1) {
                confirm("登录成功");
                updateLocal("token", res.data.token)
                location.href = getURL("index");

            } else {
                confirm("登录失败!\n" + res.msg);
            }
        })
        // 登录界面跳转
        $("#reg").on("click", function () {
            location.href = getURL("reg");
        })

    })();
    UI.initUI();
}
function regMain() {
    ; (function () {
        // 手机号格式验证
        $(".username").on("blur", function () {
            username($(this));
        })
        function username(jqObj) {
            const value = jqObj.val();
            const regExp = /^(?:(?:\+|00)86)?1\d{10}$/;
            if (regExp.test(value)) {
                jqObj.css("border-color", "#24c32f")
                jqObj.siblings(".msg").text("");
                return value;
            } else {
                jqObj.css("border-color", "#fd1c1c")
                jqObj.siblings(".msg").text("请输入正确手机号");
                return -1;
            }
        }
        // 密码格式验证
        $(".pwd").on("blur", function () {
            pwd($(this));
        })
        function pwd(jqObj) {
            const value = jqObj.val();
            const regExp = /(^([A-Za-z])+\d*)/;
            if (regExp.test(value) && value.length > 5 && value.length < 9) {
                jqObj.css("border-color", "#24c32f")
                jqObj.siblings(".msg").text("");
                return value;
            } else {
                jqObj.css("border-color", "#fd1c1c")
                jqObj.siblings(".msg").text("请输入第一个字母，且位数是6到8位的密码");
                return -1;
            }
        }
        // 二次密码验证
        $("#pwdAgain").on("blur", function () {
            pwdAgain($(this))
        })
        function pwdAgain(jqObj) {
            const value = jqObj.val();
            const firstValue = $("#pwd").val();
            if (firstValue == value && value != "") {
                jqObj.css("border-color", "#24c32f")
                jqObj.siblings(".msg").text("");
                return value;
            } else {
                jqObj.css("border-color", "#fd1c1c")
                jqObj.siblings(".msg").text("两次密码不一致");
                return -1;
            }
        }
        // 注册事件
        $("#register").on("click", async function () {
            const phone = username($("#username"));
            const password = pwd($("#pwd"));
            const pwdAg = pwdAgain($("#pwdAgain"));
            if (phone == -1 || pwdAg == -1 || password == -1) {
                return;
            }
            if (password != pwdAg) {
                return;
            }
            const option = {
                url: "/users/register",
                data: {
                    phone, password
                }
            }
            const res = await $cn(option);
            if (res.code == 1) {
                confirm("注册成功");
                location.href = getURL("login");

            } else {
                confirm("注册失败!\n" + res.msg);
            }
        })
        // 登录界面跳转
        $("#login").on("click", function () {
            location.href = getURL("login");
        })

    })();
    UI.initUI();
}
function centerMain() {
    (() => {
        render();
        initEvent();
        async function render() {
            const option = {
                url: "/users/getUserInfo",
                method: "get"
            }
            const res = await $cn(option);
            console.log(res);
            if (res.code == 1) {
                const data = res.data[0];
                $("#headImg").css("backgroundImage", `url(${ getImageUrl(data.avatar) })`)
                $("#userTitle").html(data.name);
                $("#userState").html(data.phone);
                $("#username").val(data.name);
                if (data.gender !== "none") {
                    $(":radio[name='gender']" + `[value='${data.gender}']`).prop("checked", true)
                }
                $("#userTitle").html(data.name);
            } else {

            }
        }

        function initEvent() {
            // 保存基本信息
            save();
            // 头像上传
            upFile();
        }

        async function save() {
            $("#login").on("click",async function(){
                let str = await saveBasicInfo();
                str += await saveHeadImg();
                if (str!="") {
                    confirm(str);
                }else{
                    confirm("修改成功");
                }
            })
           
        }
        async function saveBasicInfo() {
            const gender = $(":radio[name='gender']:checked").val();
            const option = {
                url: "/users/modify",
                data: {
                    name: $("#username").val(),
                    gender
                }
            }
            return new Promise(async (resolve, reject) => {
                const res = await $cn(option);
                if (res.code == 1) {
                    resolve("")
                } else {
                    reject("用户名或性别修改失败")
                }
            })

        }
        async function saveHeadImg() {
            let filename = $("#headImg").css("background-image");
            filename = filename.substring(filename.lastIndexOf("/") + 1);
            filename = filename.replace(`")`, "");
            let option = {
                url: "/files/updateHeadImg",
                data: {
                    filename
                }
            }
            return new Promise(async (resolve, reject) => {
                const res = await $cn(option);
                if (res.code == 1) {
                    resolve("")
                } else {
                    reject("头像修改失败")
                }
            })
        }

        async function upFile() {
            $("#fileImg").on('change', async function (e) {
                // flag = false;
                console.log("fileImg");
                // console.dir(this.files[0]);
                // 1.拿文件数据
                const fileInfo = this.files[0]
                // 2.通 FormData 构造函数对文件数据进行格式转换，转换成二进制流
                const fd = new FormData();
                fd.append('file', fileInfo);
                const res = await $upFile(fd);
                $("#headImg").css("background-image", `url(${res})`);
            });
            $("#fileImg").on("click", function (e) {
                e.stopPropagation();
                console.log("addEventListener");
            })
            $("#headImg").on('click', function (e) {
                console.log(23223);
                e.preventDefault();
                $("#fileImg").click();
            })

        }

    })()
    UI.initUI();
}