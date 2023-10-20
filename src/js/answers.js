/******************************************************************************************
 *@Desc: 解析界面
 *@Author: Wanglei
 *@Date: 2023-04-09 23:10:57
 *@module  
 *@return 
 ******************************************************************************************
*/

// 引入模块
import { $cn, getURL, getParma, formatSeconds, saveParma, getFormatTime, throttle, debounce } from './utils';
import UI from './ui';
import { renderFooter, renderHeader } from './ui';
import '../scss/ui.scss';
import "../scss/answers.scss";
UI.autoSize(window, document); //宽度自适应
var ReqParam = getParma();
var isImeGG = true;
var GLOBAL = {
    exercises: [], //试题信息
    stuAnswers: [],//学生答案
    myExeType: [[], []]  //分析后端传过来的数据，灵活处理渲染顺序
}
$(function () {
    main();
});
function main() {
    render();
    initEvent();
    UI.initUI();
}

async function render() {
    let option = {
        url: "/tests/findResultById",
        data: {
            testsId: ReqParam.testsId
        }
    }
    const res = await $cn(option);
    if (res.code == 1) {
        GLOBAL = { ...GLOBAL, ...{ exercises: res.data.exercises, stuAnswers: res.data.stuAnswers } }
        $.each(res.data.exercises, function (indexInArray, valueOfElement) {
            const type = valueOfElement.type; //试题类型 用作 myExeType下标
            const exeIndex = indexInArray;//试题索引下标
            const id = valueOfElement._id; //试题id
            const score = valueOfElement.score
            const isC = valueOfElement.isC
            GLOBAL.myExeType[type].push({ exeIndex, id, score, isC });
        });
        renderTop(res.data);
        const firstNo= GLOBAL.myExeType[0].length>0?GLOBAL.myExeType[0][0].exeIndex:GLOBAL.myExeType[1][0].exeIndex;
        renderExe(firstNo);
    } else {

    }

}

function initEvent() {
    $("#prevExe").on("click", function () {//上一题
        let index = $("#questionTitle").data("index");
        const newIndex=getPre(index);
        if (newIndex == -1) {
            confirm("已经是第一题了")
        } else {
            renderExe(newIndex);
        }
    })
    $("#nextExe").on("click", function () {//下一题
        let index = $("#questionTitle").data("index");
        const newIndex= getNext(index);
        if (newIndex == - 1) {
            confirm("已经是最后一题了")
        } else {
            renderExe(newIndex);
        }
    })
    $('#moreQuestions').on("mousedown", function (e) {//题库展开
        e.stopPropagation();
        if ($('.model-cover').css("display") == "none") {//滤镜
            renderFooterCard();
        } else {
        }
    });
    $("#favorite").on("click", favoriteClick); //收藏点击
    $("#goBackExamCen").on("click", () => {
        location.assign(getURL("tests_list"));
    }); //返回考试中心
}
// 头部区域渲染
function renderTop(data) {
    $("#title").html(data.title);
    $("#score").html(formatScore(data.score));
    $("#durations").html(formatSeconds(data.durations * 60));
    $("#numCount").html(data.exercises.length); // 右下角  题目数量
}
// 试题渲染
function renderExe(index) {
    const exeData = GLOBAL.exercises[index];
    $("#numIndex").html( getTestCounts(index));
    if (exeData.type == 0) { //单选
        renderQuestion("radio", "单选题", exeData)
    } else if (exeData.type == 1) { //多选
        renderQuestion("checkbox", "多选题", exeData)
    }

    function renderQuestion(type, desc, exeData) {
        // console.log(exeData);
        let isAnswer = "";  // 记录学习答案
        if (GLOBAL.stuAnswers[index]) {
            isAnswer = GLOBAL.stuAnswers[index].join(); //已答题
        }
        let html = `<div class="question-title" id="questionTitle" data-index="${index}">
        <div class="question-type">${desc}</div>
        <div class="question-desc">${ getTestNo(index)+". "+exeData.topics}</div>
    </div>`
        $.each(exeData.options, function (indexInArray, valueOfElement) {
            let option = getABCD(indexInArray) + valueOfElement;
            html += ` <div class="question-items">
         <input disabled value="${indexInArray}"  ${(isAnswer != "") && (isAnswer.indexOf(indexInArray) > -1) ? "checked" : ""} type="${type}" name="question" id="id${indexInArray}"> <label for="id${indexInArray}">${option}</label>
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
    renderAnalysis(index); //解析渲染
}

// 解析渲染
function renderAnalysis(index) {
    const exeData = GLOBAL.exercises[index];
    if (!GLOBAL.stuAnswers[index]) {
        GLOBAL.stuAnswers[index] = [];
    }
    let html = `
        <div class="answer-row">
                <div class="${exeData.answer.join() == GLOBAL.stuAnswers[index].join() ? "icon" : "icon error"}"></div>
                <div  class="${exeData.answer.join() == GLOBAL.stuAnswers[index].join() ? "text" : "text error"}">
                ${exeData.answer.join() == GLOBAL.stuAnswers[index].join() ? "答对了" : "答错了"}
                </div>
            </div>
            <div class="answer-row">
            <div class="text">考生答案：</div>
            <div class="${exeData.answer.join() == GLOBAL.stuAnswers[index].join() ? "text" : "text error"}">${getABCDs(GLOBAL.stuAnswers[index])}</div>
        </div>
        <div class="answer-row">
            <div class="text">正确答案：</div>
            <div class="text">${getABCDs(exeData.answer)}</div>
        </div>    
        <div class="answer-row">
            <div class="text">查看解析：</div>
            <div class="text">${exeData.analysis}</div>
        </div>  
        `
    $("#answer").html(html);
}

// 底部试题卡片渲染
function renderFooterCard() {
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
            if (GLOBAL.stuAnswers[valueOfElement.exeIndex] == null) {
                GLOBAL.stuAnswers[valueOfElement.exeIndex] = [];
            }
            if (GLOBAL.stuAnswers[valueOfElement.exeIndex].join() != GLOBAL.exercises[valueOfElement.exeIndex].answer.join()) {
                className += " error"; //已答题
            }
            newHtml += `<button data-index="${valueOfElement.exeIndex}" class="${className}">${indexInArray + 1}</button>`

        });
        if (newHtml=="") {
            return ;
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
    function clickContainer(_this) {
        const exeIndex = _this.data("index");
        renderExe(exeIndex, `${getTestNo(exeIndex)}. `);
        $("#moreQuestions").click(); //自动调用底部题卡开关
    }
    $("#queContainer").on("click", ".model-tests-sub", function (e) {
        if (isImeGG) {
            isImeGG = false;
            const exeIndex = $(this).data("index");
            renderExe(exeIndex, ``);
            $("#moreQuestions").click(); //自动调用底部题卡开关
            setTimeout(() => {
                isImeGG = true;
            }, 300);
        }
    });

    $("button.collection").append(`
    <div class="collection-icon"></div>
    `)
}

// 格式化 题目选项
function getABCD(num) {
    let option = "";
    switch (num) {
        case 0:
            option = "A. "
            break;
        case 1:
            option = "B. "
            break;
        case 2:
            option = "C. "
            break;
        case 3:
            option = "D. "
            break;
        default:
            break;
    }
    return option
}
// 格式化 答案选项
function getABCDs(arr) {

    let rtn = "";
    $.each(arr, function (indexInArray, valueOfElement) {
        let temp = "";
        switch (valueOfElement) {
            case 0:
                temp = "A"
                break;
            case 1:
                temp = "B"
                break;
            case 2:
                temp = "C"
                break;
            case 3:
                temp = "D"
                break;
            default:
                break;
        }
        rtn = rtn == "" ? temp : rtn + "," + temp
    });
    return rtn
}

async function favoriteClick() {
    const index = $("#questionTitle").data("index");
    const exerciseId = GLOBAL.exercises[index]._id;
    let option = {
        url: "/collections/addCollection",
        data: {
            exerciseId
        }
    }
    // 删除收藏
    if ($(this).attr("class").indexOf("active") > -1) {
        option = {
            url: "/collections/delCollection",
            data: {
                exerciseId
            }
        }
    }
    const res = await $cn(option);
    let myExeTypeIndex = -1; // 更改的 GLOBAL.myExeType的下标
    if (res.code == 1) {
        // 成功之后更改样式
        if ($(this).attr("class").indexOf("active") > -1) {
            GLOBAL.exercises[index].isC = 0;
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
        $(this).toggleClass("active");
        $(this).children(".icon").toggleClass("active");
    }
    // confirm(res.msg)
}

function formatScore(score) {
    let rtn = score.toLocaleString('zh', { minimumFractionDigits: 1, minimumIntegerDigits: 2, useGrouping: false }); //2333.30
    return rtn;
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
// 根据试题下标 获取他第几
function getTestCounts(exeIndex) {
    const exeId = GLOBAL.exercises[exeIndex]._id;
    let testNo = 0;
    for (let index = 0; index < GLOBAL.myExeType.length; index++) {
        const element = GLOBAL.myExeType[index];
       
        const i = element.findIndex(items => items.id == exeId);
        if (i > -1) {
            testNo+=i+1;
            break
        }else{
            testNo+=element.length;
        }
    }
    return testNo ;
}
// 获取下一题的索引
function getNext(exeIndex) {
    const exeId = GLOBAL.exercises[exeIndex]._id;
    let testNo = 1;
    let nextIndex=-1;
    for (let index = 0; index < GLOBAL.myExeType.length; index++) {
        const element = GLOBAL.myExeType[index];
        const i = element.findIndex(items => items.id == exeId);
        if (i > -1) {
            if(testNo==GLOBAL.myExeType.length&&i==element.length-1){           
            }else{
                if (i==element.length-1) {
                    nextIndex= GLOBAL.myExeType[testNo][0].exeIndex;
                }else{
                    nextIndex=element[i+1].exeIndex;
                }   
            }
            break
        }else{
            testNo++;
        }
    }
    return nextIndex ;
}

// 获取上一题的索引
function getPre(exeIndex) {
    const exeId = GLOBAL.exercises[exeIndex]._id;
    let testNo = 0;
    let nextIndex=-1;
    for (let index = 0; index < GLOBAL.myExeType.length; index++) {
        const element = GLOBAL.myExeType[index];
        const i = element.findIndex(items => items.id == exeId);
        if (i > -1) {
            if(testNo==0&&i==0){
                
            }else{
                if (i==0) {
                    nextIndex= GLOBAL.myExeType[testNo-1][GLOBAL.myExeType[testNo-1].length-1].exeIndex;
                }else{
                    nextIndex=element[i-1].exeIndex;
                }  
            }
            break
        }else{
            testNo++;
        }
    }
    return nextIndex ;
}