/******************************************************************************************
 *@Desc: 试卷
 *@Author: Wanglei
 *@Date: 2023-04-09 23:10:57
 *@module  
 *@return 
 ******************************************************************************************
*/

// 引入模块
import { $cn, getURL, getParma, formatSeconds, saveParma, getFormatTime, throttle, debounce } from './utils';
import UI from './ui';
import '../scss/ui.scss';
import "../scss/exercises.scss";
UI.autoSize(window, document); //宽度自适应
var ReqParam = getParma();
var GLOBAL = {
    myExeType: [[], []], //题型  分类单选多选
    stuAnswer: [], //学生答案
    stuDurations: 0,
}
var isImeGG = true;
$(function () {
    main();
});
function main() {
    render();
    //获取数据
    // 渲染
    initEvent();
    UI.initUI();
}
async function render() {
    const rtn = await getServeData(); //获取数据
    if (rtn == 1) {
        $("#testDesc").html(GLOBAL.title); //标题
        let durationsMM = GLOBAL.durations * 60 + 1; //转换为秒
        window.time = setInterval(() => {//倒计时定时器
            durationsMM--;
            GLOBAL.stuDurations++;
            renderLimitTime(durationsMM);
            if (durationsMM == 0) {
                clearInterval(time);
            }
        }, 1000);
        $("#numCount").html(GLOBAL.exercises.length)
        const firstNo= GLOBAL.myExeType[0].length>0?GLOBAL.myExeType[0][0].exeIndex:GLOBAL.myExeType[1][0].exeIndex;
        renderEXE(firstNo, "1. "); //初始化第一题
        // renderFooterCard(); //底部试题卡 //改为点击渲染
    } else {
        confirm("数据获取失败");
    }
}
// 加载试题数据
async function getServeData() {
    const testsId = ReqParam.testsId;//试卷id
    const option = {
        url: "/tests/findTestsById",
        data: {
            testsId
        }
    }
    return new Promise(async (resolve, reject) => {
        const res = await $cn(option);
        if (res.code == 1) {
            const title = res.data.title;
            const durations = res.data.durations;
            const exercises = res.data.exerciseId;
            GLOBAL = { ...GLOBAL, testsId, title, durations, exercises }
            $.each(exercises, function (indexInArray, valueOfElement) {
                const type = valueOfElement.type; //试题类型 用作 myExeType下标
                const exeIndex = indexInArray;//试题索引下标
                const id = valueOfElement._id; //试题id
                const score = valueOfElement.score
                const isC = valueOfElement.isC
                GLOBAL.myExeType[type].push({ exeIndex, id, score, isC });
            });
            resolve(1);
        } else {
            resolve(-1);
        }
    })

}
// 试题渲染  index 试题下标
function renderEXE(index, no = "") {
    const exeData = GLOBAL.exercises[index];
    $("#numIndex").html(index + 1);
    if (exeData.type == 0) { //单选
        renderQuestion("radio", "单选题", exeData)
    } else if (exeData.type == 1) { //多选
        renderQuestion("checkbox", "多选题", exeData)
    }

    function renderQuestion(type, desc, exeData) {
        // console.log(exeData);
        let isAnswer = "";
        if (GLOBAL.stuAnswer[index]) {
            isAnswer = GLOBAL.stuAnswer[index].join(); //已答题
        }
        let html = `<div class="question-title" id="questionTitle" data-index="${index}">
        <div class="question-type">${desc}</div>
        <div class="question-desc">${no + exeData.topics}</div>
    </div>`
        $.each(exeData.options, function (indexInArray, valueOfElement) {
            let option;
            switch (indexInArray) {
                case 0:
                    option = "A. " + valueOfElement
                    break;
                case 1:
                    option = "B. " + valueOfElement
                    break;
                case 2:
                    option = "C. " + valueOfElement
                    break;
                case 3:
                    option = "D. " + valueOfElement
                    break;
                default:
                    break;
            }
            html += ` <div class="question-items">
         <input value="${indexInArray}"  ${(isAnswer != "") && (isAnswer.indexOf(indexInArray) > -1) ? "checked" : ""} type="${type}" name="question" id="id${indexInArray}"> <label for="id${indexInArray}">${option}</label>
     </div>`
        });

        $("#questionM").html(html);
        if (exeData.isC == 1) { //已收藏
            $("#favorite").addClass("active");
            $("#favorite").children(".icon").addClass("active");
        } else {
            $("#favorite").removeClass("active");
            $("#favorite").children(".icon").removeClass("active");
        }
    }
}

// 底部试题卡片渲染
function renderFooterCard(jqObj) {
    let html = ``;
    GLOBAL.myExeType.forEach((items, index) => {
        let testType = "单选题";
        let score = 0;
        if (index == 1) {
            testType = "多选题";
        }
        let newHtml = ``
        $.each(items, function (indexInArray, valueOfElement) {
            score += valueOfElement.score;
            let className = "model-tests-sub";
            if (valueOfElement.isC == 1) { // 收藏
                className += " collection";
            }
            if (GLOBAL.stuAnswer[valueOfElement.exeIndex]) {
                className += " fulfill"; //已答题
            }
            newHtml += `<button data-index="${valueOfElement.exeIndex}" class="${className}">${indexInArray + 1}</button>`

        });
        if (newHtml=="") {
            return
        }
        newHtml = `<div class="model-tests">
       <div class="tests-title">
           ${testType}（共${items.length}题，合计${score}分）
       </div>
       <div class="tests-content">`+ newHtml + `   </div>
       </div>`
        html += newHtml;

    })
    $("#queContainer").html(html);
    // 点击选题之后自动收缩面板
    const fn = throttle(clickContainer, 10000);
    $("#queContainer").on("click", ".model-tests-sub", fn);
    function clickContainer(e, _this, _jqThis) {
        const exeIndex = _jqThis.data("index");
        renderEXE(exeIndex, `${getTestNo(exeIndex)}. `);
        $("#moreQuestions").click(); //自动调用底部题卡开关
    }
    // $("#queContainer").on("click", ".model-tests-sub", function (e) {
    //     if (isImeGG) {
    //         isImeGG = false;
    //         const exeIndex = $(this).data("index");
    //         renderEXE(exeIndex, `${getTestNo(exeIndex)}. `);
    //         $("#moreQuestions").click(); //自动调用底部题卡开关
    //         setTimeout(() => {
    //             isImeGG = true;
    //         }, 300);
    //     }
    // });

    $("button.collection").append(`
    <div class="collection-icon"></div>
    `)
}
// 根据试题id 获取他在自己类型的第几
function getTestNo(exeIndex) {
    const exeId = GLOBAL.exercises[exeIndex]._id;
    let testNo = "";
    for (let index = 0; index < GLOBAL.myExeType.length; index++) {
        const element = GLOBAL.myExeType[index];
        testNo = element.findIndex(items => items.id == exeId);
        if (testNo > -1) {
            break
        }
    }
    return testNo + 1;
}
// 倒计时
function renderLimitTime(durationsMM) {
    const mm = formatSeconds(durationsMM)
    $("#limitTime").html(mm); //倒计时
}
// 页面事件注册
function initEvent() {
    $("#prevExe").on("click", function () {//上一题
        let index = $("#questionTitle").data("index");
        if (index == 0) {
            confirm("已经是第一题了")
        } else {

            renderEXE(--index, `${getTestNo(index)}. `);
        }
    })
    $("#nextExe").on("click", function () {//下一题
        let index = $("#questionTitle").data("index");
        if (index == GLOBAL.exercises.length - 1) {
            confirm("已经是最后一题了")
        } else {
            renderEXE(++index, `${getTestNo(index)}. `);
        }
    })
    $("#allA").on("click", function () {// 全选A 测试用
        for (let i = 0; i < GLOBAL.exercises.length; i++) {
            GLOBAL.stuAnswer[i] = GLOBAL.exercises[i].answer;;
        }
        console.log("ok");
    })
    $("#favorite").on("click", async function () {// 收藏事件
        const index = $("#questionTitle").data("index");
        let myExeTypeIndex = -1;
        const exerciseId = GLOBAL.exercises[index]._id;

        let option = {
            url: "/collections/addCollection",
            data: {
                exerciseId
            }

        }
        // 删除收藏
        if ($(this).attr("class").indexOf("active") > -1) {
            GLOBAL.exercises[index].isC = 0
            // 底部试题卡
            for (let i = 0; i < GLOBAL.myExeType.length; i++) {
                const element = GLOBAL.myExeType[i];
                myExeTypeIndex = element.findIndex(items => {
                    return items.exeIndex == index
                })
                if (myExeTypeIndex > -1) {
                    GLOBAL.myExeType[i][myExeTypeIndex].isC = 0;
                    break;
                }
            }
            option = {
                url: "/collections/delCollection",
                data: {
                    exerciseId
                }
            }
        } else {
            GLOBAL.exercises[index].isC = 1;
            // 底部试题卡
            for (let i = 0; i < GLOBAL.myExeType.length; i++) {
                const element = GLOBAL.myExeType[i];
                myExeTypeIndex = element.findIndex(items => {
                    return items.exeIndex == index
                })
                if (myExeTypeIndex > -1) {
                    GLOBAL.myExeType[i][myExeTypeIndex].isC = 1
                    break;
                }
            }
        }
        const res = await $cn(option);
        // confirm(res.msg)
        $(this).toggleClass("active");
        $(this).children(".icon").toggleClass("active");
    })
    $('#moreQuestions').on("mousedown", function (e) {//题库展开
        e.stopPropagation();
        if ($('.model-cover').css("display") == "none") {//滤镜
            renderFooterCard();
        } else {
        }
    });
    addStuAnswer();// 答题
    saveExam(); //提交试卷
}

// 保存试题答案
function addStuAnswer() {
    $("#questionM").on("change", function () {
        let answer = [];
        const index = $("#questionTitle").data("index");
        $.each($("input:checked"), function (indexInArray, valueOfElement) {
            answer.push(valueOfElement.value);
        });
        GLOBAL.stuAnswer[index] = answer;
    })
}
// 答题结果提交到服务器
function saveExam() {
    $("#saveExam").on("click", function () {
        let isTrue = false; //是否有没填写的题目
        for (let i = 0; i < GLOBAL.exercises.length; i++) {
            if (!GLOBAL.stuAnswer[i]) {//答案为空
                isTrue = true;
            }
        }
        if (isTrue) {
            const rtn = confirm("存在未答案的试卷是否提交");
            if (!rtn) { //选否便不提交数据
                return;
            }
        }
        getTestInfo();
    })
}


// 获取学生做的试题的情况
async function getTestInfo() {
    const durations = Math.ceil(GLOBAL.stuDurations / 60); //用时 分钟
    const rtn = getScore();
    const score = rtn[0];
    const accuracy = rtn[1];
    const err = rtn[2];
    const option = {
        url: "/tests/addTesteds",
        data: {
            testId: GLOBAL.testsId,
            answers: GLOBAL.stuAnswer,
            score, accuracy, durations
        }
    }
    const errOption = {
        url: "/errors/add",
        data: {
            dataArr: err
        }
    }
    await $cn(errOption); //异步增加
    const res = await $cn(option);
    if (res.code == 1) {
        location.href = getURL("tests_end")
    }
}
function getScore() {
    let score = 0;
    let accuracy = 0;
    let err = [];
    GLOBAL.exercises.forEach((items, index) => {
        if (GLOBAL.stuAnswer[index]) { //存在值才判断
            if (items.type == 0) {//单选
                if (items.answer.join() == GLOBAL.stuAnswer[index].join()) {
                    score += items.score;
                    accuracy++;
                } else { // 错题
                    err.push({ exerciseId: items._id, errorAnswer: GLOBAL.stuAnswer[index] })
                }
            } else if (items.type == 1) { //多选
                if (items.answer.join() == GLOBAL.stuAnswer[index].join()) {
                    score += items.score;
                    accuracy++;
                } else if (items.answer.join().indexOf(GLOBAL.stuAnswer[index].join()) > -1) {// 选择了多选中的其中一些答案
                    score += (Math.floor(items.score * GLOBAL.stuAnswer[index].length / items.answer.length))
                    err.push({ exerciseId: items._id, errorAnswer: GLOBAL.stuAnswer[index] }); //记录错题
                } else {
                    err.push({ exerciseId: items._id, errorAnswer: GLOBAL.stuAnswer[index] })
                }
            }
        }else{
            err.push({ exerciseId: items._id, errorAnswer: GLOBAL.stuAnswer[index] })
        }
    })
    accuracy = Math.floor((accuracy / GLOBAL.exercises.length) * 100).toFixed(2) + "%";
    return [score, accuracy, err];
}
