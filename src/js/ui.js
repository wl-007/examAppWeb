/******************************************************************************************
 *@Desc: 公共事件处理
 *@Author: Wanglei
 *@Date: 2023-04-06 18:53:52
 *@module  UI
 *@return 
 ******************************************************************************************
*/

import { getURL, $cn, nlTogetherClass, clearParma,judgeLogin,throttle,isLogin } from './utils'
/**
 *@Desc: 移动端界面自适应
 *@Author: Wanglei
 *@Date: 2023-04-06 18:48:19
 *@other autoSize(window, document)
*/
function autoSize(win = window, doc = document) {
    // 核心代码
    function setFontSize() {
        // 获取window 宽度
        var winWidth = window.innerWidth;
        // 750 是当前 UI 设计图的宽度  ,如果原稿是1200，下面就改成1200
        doc.documentElement.style.fontSize = (winWidth / 750) * 100 + 'px';
        // console.log( doc.documentElement.style.fontSize);
    }
    // 下列代码用于优化移动设备上的字体大小，以确保在旋转设备或调整窗口大小时能够适应不同的屏幕尺寸。
    var evt = 'onorientationchange' in win ? 'orientationchange' : 'resize';
    var timer = null;
    win.addEventListener(evt, function () {
        clearTimeout(timer);
        timer = setTimeout(setFontSize, 300);
    }, false);
    win.addEventListener("pageshow", function (e) {
        if (e.persisted) {
            clearTimeout(timer);
            timer = setTimeout(setFontSize, 300);
        }
    }, false);
    //初始化
    setFontSize();

};
// 自定ui初始化
function initUI() {
    const arr =["index","login","reg"]; // 跳转这些界面不需要验证登录
    let pathname=location.pathname;
    pathname= pathname.substring(pathname.lastIndexOf("/")+1);
    pathname= pathname.substring(0,pathname.lastIndexOf("."));
    const index= arr.findIndex(items=>items==pathname)
    if (index==-1) {
        isLogin(); 
    }
    $(function () {
        autoSize();
        renderFooter();
        renderHeader();
        examHeader();
        examFooter(); // 试卷底部
        // ui放最后加载
        uiModal();
        uiPWD();
        icons();  //图标

    });

}
function icons() { 
    $("button.collection").append(`
    <div class="collection-icon"></div>
    `)
 }
// 模态框
function uiModal() {
    const modal = $('.modal-index');

    modal.prepend(`<div class="cancel">X</div>`);
    $('.modal-index .cancel').off( "click");
    $('.modal-index .cancel').on("click",throttle(fn,300));
    function fn (e,dThis,jqThis) {
        e.preventDefault();
        jqThis.parent().slideUp("slow");
        jqThis.parent().prev(".model-cover").css("display", "none");
    }
    // 模态框打开事件
    const modalCon = $('.modal-control');
    modalCon.on("click", function () {
        const modalID = $(this).data("modal-id");
        $(modalID).slideToggle("slow");
        $(modalID).prev(".model-cover").css("display", "block");
    })
}
// 密码输入框
function uiPWD() {
    const modal = $('.pwd-box');
    modal.append(`<div class="js-icon icon-cancel"></div>`);
    $('.pwd-box').off( "click", "**");
    $('.pwd-box').on("click",function (e) {
        e.preventDefault();
        if (e.target.className.indexOf("js-icon") > -1) {
            if (this.firstElementChild.getAttribute("type") == "text") {
                this.firstElementChild.setAttribute("type", "password");
                nlTogetherClass(e.target, "open");//增删开眼类

            } else {
                this.firstElementChild.setAttribute("type", "text");
                nlTogetherClass(e.target, "open");
            }
        }
    });
}
// 底部信息
export function renderFooter() {

    $('footer').html(`
    <footer>
    <div class="version">
      Copyright © 2021  成都蜗牛创想科技有限公司 
    </div>
  </footer>`)
}
// 
export async function renderHeader() {
    let isLogin =  await judgeLogin();
    // try {
    //     let option = {
    //         url: "/users/getUserInfo",
    //         method: "get",
    //     }
    //     let res = await $cn(option);
    //     if (res.code == 1) {
    //         if (res.data[0]) {
    //             isLogin = true;
    //         }
    //     }
    // } catch (error) {

    // }
    if (isLogin) {
        $('header').html(` <header>
        <div class="content">
          <div class="logo"></div>
          <div class="menu modal-control" data-modal-id="#menuModal" >
          </div>
          <div class="model-cover" id=""></div>
          <div class="modal-index" id="menuModal">
                <ul class="nav-ul">
                <li  class="jump" data-jump="index">首页</li>
                <li  class="jump" data-jump="tests_list">考试</li>
                <li  class="jump" data-jump="errors"> 错题本</li>
                <li  class="jump" data-jump="collections">收藏夹</li>
                <li  class="jump" data-jump="center">个人中心</li>
                <li  class="jump" data-jump="loginOut">退出登录</li>
                </ul>
          </div>  
        </div>
      </header>`);
    } else {
        $('header').html(` <header>
        <div class="content">
          <div class="logo"></div>
          <div class="menu modal-control" data-modal-id="#menuModal">
          </div>
          <div class="modal-index" id="menuModal">
                <ul class="nav-ul">
                <li  class="jump" data-jump="index">首页</li>
                <li  class="jump" data-jump="tests_list">考试</li>
                <li  class="jump" data-jump="errors"> 错题本</li>
                <li  class="jump" data-jump="collections">收藏夹</li>
                <li  class="jump" data-jump="login">登录</li>
                <li  class="jump" data-jump="red">注册</li>
                </ul>
          </div>  
        </div>
      </header>`);
    }
    uiModal();

    $(".nav-ul").on("click", ".jump", function () {
        const jump = $(this).data("jump");
        localStorage.removeItem("params");
        if (jump == "loginOut") {
            localStorage.removeItem("token"); //暂时只清除前端界面
            location.href = getURL("index");
        }
        location.href = getURL(jump);
    })
}
// 试卷头部返回
function examHeader(){
    $('.exam-header .container .left .btn-back').off( "click",".right");
    $(".exam-header .container .left .btn-back").on("click",function(){
     if (confirm("是否回到首页")) {
        location.href=getURL("index");
     }    
    })
}
// 试卷底部组件界面事件注册
function examFooter() {
    $('.exam-footer .exam-footer-bot').hide(); //题库隐藏
    $('.model-cover').hide(); //滤镜隐藏
    // throttle 节流函数
    $('.exam-footer').off( "click",".right");
    $('.exam-footer').on("click", ".right",throttle(fn,300));
    function fn(e,_this,jqThis) {//题库展开
        e.stopPropagation();
        const children = jqThis.parents(".exam-footer").children(".exam-footer-bot");
        children.slideToggle("slow");
        if ($('.model-cover').css("display") == "none") {//滤镜
            $('.model-cover').css("display", "block");
        } else {
            $('.model-cover').css("display", "none");
        }
    }
}
// 暴露对象
const exportObj = { autoSize, initUI };
export default exportObj;