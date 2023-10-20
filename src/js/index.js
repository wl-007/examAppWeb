// 引入模块
import { $cn, getURL, getParma, saveParma } from './utils';
import UI from './ui';
import '../scss/ui.scss';
import '../scss/index.scss';
const GLOBAL = {
    noticeData: "", //公告

}


$(function () {
    main();
});
function main() {
    const reqParam = getParma();
    UI.initUI(); //公共UI
    render();//页面渲染

}
function render() {
    initTestsType();
    initNotice();
    renderSta(); //数据统计
}

async function renderSta() {
    try {
        const option = {
            url: "/users/statistics"
        }
        const res = await $cn(option);
        if (res.code == 1) {
            const data = res.data;
            $("#counts").html(data.exeCounts);
            $("#learnDay").html(data.learnDay);
            $("#curScore").html(data.curScore);
            $("#avgScore").html(data.avgScore=="NaN"?0:data.avgScore);  // 后端返回的NaN字符  
        }
    } catch (error) {

    }

}
// 考试类型渲染
async function initTestsType() {
    const option = {
        url: "/tests/findTestsType"
    }
    const res = await $cn(option);
    if (res.code == 1) {
        const testData = res.data;
        let html = "";
        $.each(testData, function (indexInArray, valueOfElement) {
            html += `
         <div class="nav-box" data-type-id="${valueOfElement._id}">
        <div class="img" style="background-image: url(${valueOfElement.icon});"></div>
        <div class="title">${valueOfElement.type}</div>
      </div>
         `
        });
        // 页面渲染
        $("#navTestsType").html(html);
        // 事件注册
        $("#navTestsType").on("click", ".nav-box", function (e) {
            const typeId = $(this).data("type-id");
            if (typeId) {
                const params = { typeId };
                saveParma(params)
                location.href = getURL("tests_list");
            }
        });
    } else {
        console.log("initTestsType() 出错");
    }
}
// 公告
async function initNotice(data = {}) {
    const option = {
        url: "/notices/findNotices",
        data
    }
    const res = await $cn(option);
    if (res.code == 1) {
        GLOBAL.noticeData = res.data;
        let html = "";
        $.each(GLOBAL.noticeData, function (indexInArray, valueOfElement) {
            let content = subStr100(valueOfElement.details); //内容大于100截取
            content = content.length > 100 ? content + ` <span data-notice-id="${valueOfElement._id}" class='noticeMore '>...</span>` : content
            html += `<div class="content" data-notice-id="${valueOfElement._id}" >
         <div class="title">
         ${valueOfElement.title}
         </div>
         <div class="items">
         ${content}
         </div>
       </div>
         `
        });
        // 页面渲染
        $("#noticeContent").html(html);
        $("#noticeModal").hide();
        // 事件注册
        $("#noticeContent").on("click", ".noticeMore", function (e) {
            const noticeId = $(this).data("notice-id");
            if (noticeId) {
                const noticeData = GLOBAL.noticeData.find(items => items._id == noticeId);
                const html = `
               <div class="more-title">
                    ${noticeData.title}
                    </div>
                    <div class="more-content">
                    <p> ${noticeData.intro}</p> 
                    <p> ${noticeData.details}</p> 
                    </div>
               `;
                $("#noticeModalCon").html(html);
                $("#noticeModal").fadeIn();  //fadeOut
                $('#noticeCover').show(); //遮盖物
            }
        });

        $(".modal-index .cancel").on("click", function (e) {
            $('#noticeCover').hide(); //遮盖物
        })
    } else {
        console.log("findNotices() 出错");
    }

}
// 截取101个字符
function subStr100(str) {
    if (str.length > 100) {
        str = str.substring(0, 101);
    }
    return str;
}