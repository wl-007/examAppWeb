/******************************************************************************************
 *@Desc: 考试列表
 *@Author: Wanglei
 *@Date: 2023-04-09 13:06:03
 *@module  
 *@return 
 ******************************************************************************************
*/

// 引入模块
import { $cn,judgeLogin, getURL, getImageUrl, getParma, saveParma, getFormatTime, formatSeconds } from './utils';
import UI from './ui';
import '../scss/ui.scss';
import "../scss/tests.scss";
UI.autoSize(window, document); //宽度自适应
$(function () {
    
    main();
});

async function main() {

    if (await judgeLogin()==0) {
        confirm("未登录");
        location.href=getURL("login")
    }
    // 考试列表
    let pageObj = document.querySelector("body.examList");
    if (pageObj != null) {
        examListMain();
    }
    // 开始考试
    pageObj = document.querySelector("body.examStart");
    if (pageObj != null) {
        examStartMain();
        // pageObj.onload = function () {
           
        // };
    }
    // 结束考试
    pageObj = document.querySelector("body.examEnd");
    if (pageObj != null) {
        examEndMain();
        // pageObj.onload = function () {
           
        // };
    }
}

function examListMain() {
    // 考试列表
    ; (
        () => {
            var ReqParam = getParma();
            main();
            function main() {
                initPage();
                initEvent();
            };
            function initPage() {
                //  正在进行的的考试
                renderExamIng();
                //  已完成的考试
                renderExamEnd()
            };
            function initEvent() {
                // 面包屑导航跳转首页
                $("#jumpIndex").on("click", function (e) {
                    e.preventDefault;
                    location.href = getURL("index");
                })
            }
            // 已完成考试列表
            async function renderExamIng() {

                const option = {
                    url: "/tests/findNeedTests",
                    data: { typeId: ReqParam.typeId }
                }
                const res = await $cn(option);
                if (res.code == 1) {
                    const examData = res.data;
                    let html = "";
                    $.each(examData, function (indexInArray, valueOfElement) {
                        html += `<div class="card" >
                    <div class="img-box"></div>
                    <div class="desc-box">
                        <div class="title">
                            <div class="name">${valueOfElement.title}</div>
                            <div class="state">可参加</div>
                        </div>
            <div class="time">${valueOfElement['start-time']}~${valueOfElement['end-time']}</div>
                        <div class="time-limit">
                            <i class="icon-time"></i> 限时${valueOfElement.durations}分钟
                        </div>
                    </div>
                    <button class="btn btn-join" data-test-id="${valueOfElement._id}">进入</button>
                </div>`
                    });
                    $("#examIng").html(html);
                    // 跳转考试开始界面
                    jumpExamStart();
                } else {
                    console.log("renderExamIng出错");
                }
            }
            // 跳转考试开始界面
            function jumpExamStart() {
                $('.btn.btn-join').on("click", function (e) {
                    const testsId = $(this).data("test-id");
                    saveParma({ testsId });
                    location.href = getURL("tests_basic_info");
                })
            }
            // 已完成考试列表
            async function renderExamEnd() {
                const option = {
                    url: "/tests/findTesteds",
                    data: { typeId: ReqParam.typeId }
                }
                const res = await $cn(option);
                if (res.code == 1) {
                    const examData = res.data;
                    let html = "";
                    $.each(examData, function (indexInArray, valueOfElement) {
                        html += `<div class="card" >
                    <div class="img-box"></div>
                    <div class="desc-box">
                        <div class="title">
                            <div class="name">${valueOfElement.title}</div>
                            <div class="state over">已完成</div>
                        </div>
                        <div class="time">${valueOfElement['start-time']}~${valueOfElement['end-time']}</div>
                        <div class="time-limit">
                            <i class="icon-time"></i> 限时${valueOfElement.durations}分钟
                        </div>
                    </div>
                    <button class="btn btn-view" data-test-id="${valueOfElement._id}">查看</button>
                </div>`
                    });
                    $("#examEnd").html(html);
                    // 跳转考试开始界面
                    jumpAnswer();
                } else {
                    console.log("renderExamIng出错");
                }
            }
            // 跳转解析界面
            function jumpAnswer() {
                $('.btn.btn-view').on("click", function (e) {
                    const testsId = $(this).data("test-id");
                    saveParma({ testsId });
                    // console.log({ testsId });
                    location.assign(getURL("answers"))
                })
            }
        }
    )();
    UI.initUI();
}
function examStartMain() {
    ; (
        () => {
            var ReqParam = getParma();
            main();
            function main() {
                initPage();
                initEvent();
            };
            function initPage() {
                renderExamInfo();
                renderStuInfo();
            };
            function initEvent() {
                // 返回上一步
                $(".btn-back").on("click", function (e) {
                    history.back();
                })
                // 开始答题
                $(".btn-start").on("click", function (e) {
                    saveParma({ testsId: ReqParam.testsId })
                    location.href = getURL("exercises")
                })
            }
            // 试卷信息
            async function renderExamInfo() {
                let option = {
                    url: "/tests/findTestsById",
                    data: {
                        testsId: ReqParam.testsId
                    }
                }
                const res = await $cn(option);
                if (res.code == 1) {
                    const testInfo = res.data;
                    let html = `<div class="card-title">试卷信息</div>`
                    html += `
                        <div class="items">
                            <span>考试类型：</span> <span class="red">${testInfo.typeId.type}</span>
                        </div>
                        <div class="items">
                            <span>考试时间：</span> <span class="red">${getFormatTime("YYYY年MM月DD日", new Date(testInfo["end-time"]))}</span>
                        </div>
                        <div class="items">
                            <span>答题时间：</span> <span class="red">${testInfo.durations}分钟</span>
                        </div>
                        <div class="items">
                            <span>考试方式：</span> <span class="red">线上</span>
                        </div>
                        `
                    $("#examInfo").html(html);
                } else {

                }
            }
            // 学生信息
            async function renderStuInfo() {
                let option = {
                    url: "/users/getUserInfo",
                    method: "get"
                }
                const res = await $cn(option);
                if (res.code == 1) {
                    const stuInfo = res.data[0];
                    let html = `<div class="card-title">考生信息</div>`

                    html += `
                    <div class="items">
                       <span>姓名：</span> <span class="red">${stuInfo.name}</span>
                    </div>
                    <div class="items">
                        <span>证件号码：</span> <span class="red">${stuInfo.phone}</span>
                    </div>
                    <div class="items">
                        <span>部门：</span> <span class="red">信息中心</span>
                    </div>
                    `
                    $("#stuInfo").html(html);
                } else {

                }
            }
        }
    )();
    UI.initUI();
}
function examEndMain() {
    (() => {
        var ReqParam = getParma();
        main();
        function main() {
            initPage();
            initEvent();
        };
        async function initPage() {
            let option = {
                url: "/users/getUserInfo",
                method: "get",
            }
            let res = await $cn(option);
            if (res.code == 1) {
                $("#headImg").css("background-image", `url(${getImageUrl(res.data[0].avatar)})`)
                $("#username").html( res.data[0].name);
            }
            option = {
                url: "/tests/findResultById",
                data: {
                    testsId: ReqParam.testsId
                }
            }
            res = await $cn(option);
            if (res.code==1) {
                $("#accuracy").html(res.data.accuracy)
                $("#durations").html(formatSeconds(res.data.durations*60));
                $("#score").html( formatScore(res.data.score) )
            }

        };
        function initEvent() {
            $("#jumpIndex").on("click",function (e) {
                location.href=getURL("index");
            })
            $("#jumpAnalysis").on("click",function (e) {
                location.href=getURL("answers");
            })
        }
        function formatScore(score){
           let  rtn= score.toLocaleString('zh', { minimumFractionDigits: 1,minimumIntegerDigits:2, useGrouping: false }); //2333.30
            console.log(typeof score);
            console.log(typeof rtn);
            return rtn;
        }

    })()
    UI.initUI();
}

