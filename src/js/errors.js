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
import "../scss/errors.scss";
UI.autoSize(window, document); //宽度自适应
var ReqParam = getParma();
var GLOBAL = {
    exercises: [], //试题信息
    stuAnswer: [], //学生答案
    myExeType: [[], []]  //分析后端传过来的数据，灵活处理渲染顺序 
};
$(function () {
    main();
});
function main() {
    render();
    intEvent();
    UI.initUI();
}

async function render() {
    GLOBAL = {  //页面重新请求归零数据
        exercises: [], //试题信息
        stuAnswer: [], //学生答案
        myExeType: [[], []]  //分析后端传过来的数据，灵活处理渲染顺序
    };
    let option = {
        url: "/errors/find",
        method: "get"
    }
    const res = await $cn(option);
    if ((res.code == 1) && (res.data.length > 0)) {
        let exercises = [];
        $.each(res.data, function (indexInArray, valueOfElement) {
            exercises.push(valueOfElement.exerciseId);
        });
        GLOBAL = { ...GLOBAL, ...{ exercises } }
        $.each(GLOBAL.exercises, function (indexInArray, valueOfElement) {
            const type = valueOfElement.type; //试题类型 用作 myExeType下标
            const exeIndex = indexInArray;//试题索引下标
            const id = valueOfElement._id; //试题id
            const score = valueOfElement.score
            GLOBAL.myExeType[type].push({ exeIndex, id, score });
        });
        renderOther()
        renderExe(0,"1. ");
    } else {

    }
}

function renderOther() {
    $("#numCount").html(GLOBAL.exercises.length); // 右下角  题目数量
}


// 试题渲染
function renderExe(index,no = "") {
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
        <div class="question-desc">${no+exeData.topics}</div>
    </div>`
        $.each(exeData.options, function (indexInArray, valueOfElement) {
            let option = getABCD(indexInArray) + valueOfElement;
            html += ` <div class="question-items">
         <input  value="${indexInArray}"  ${(isAnswer != "") && (isAnswer.indexOf(indexInArray) > -1) ? "checked" : ""} type="${type}" name="question" id="id${indexInArray}"> <label for="id${indexInArray}">${option}</label>
     </div>`
        });
        $("#questionM").html(html);
    }
    renderAnalysis(index); //解析渲染
}

// 解析渲染
function renderAnalysis(index) {
    const exeData = GLOBAL.exercises[index];
    if (!GLOBAL.stuAnswer[index]) {
        GLOBAL.stuAnswer[index] = [];
    }
    let html = `
    <div class="answer-row">
                <div class="${exeData.answer.join() == GLOBAL.stuAnswer[index].join() ? "icon" : "icon error"}"></div>
                <div  class="${exeData.answer.join() == GLOBAL.stuAnswer[index].join() ? "text" : "text error"}">
                ${exeData.answer.join() == GLOBAL.stuAnswer[index].join() ? "答对了" : "答错了"}
                </div>
            </div>
        <div class="answer-row">
            <div class="text">正确答案：</div>
            <div class="text">${getABCDs(exeData.answer)}</div>
        </div>
        <div class="answer-row">
            <div class="text">查看解析：</div>
            <div class="text">${exeData.analysis ? exeData.analysis : "答非所问，词不达意。"}</div>
        </div> 
        `
    $("#answer").html(html);
    if (GLOBAL.stuAnswer[index].length==0) {
        $("#answer").hide(); //默认隐藏
    }else{
        $("#answer").show(); // 答过了就展示解析
    }
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
            if (!GLOBAL.stuAnswer[valueOfElement.exeIndex]) {
                GLOBAL.stuAnswer[valueOfElement.exeIndex] = [];
            }
            let className = "model-tests-sub";
            if (valueOfElement.isC == 1) { // 收藏
                className += " collection";
            }
            if (GLOBAL.stuAnswer[valueOfElement.exeIndex].length>0) {
                className += " fulfill"; //已答题
                if (GLOBAL.exercises[valueOfElement.exeIndex].answer.join() != GLOBAL.stuAnswer[valueOfElement.exeIndex].join()) { // 收藏
                    className += " error";
                }
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
    const fn = throttle(clickContainer, 10000);
    $("#queContainer").on("click", ".model-tests-sub", fn);
    function clickContainer(e, _this, _jqThis) {
        const exeIndex = _jqThis.data("index");
        renderExe(exeIndex,exeIndex+1+". ");
        $("#moreQuestions").click(); //自动调用底部题卡开关
    }
}

function intEvent() {
    $("#prevExe").on("click", function () {//上一题
        let index = $("#questionTitle").data("index");
        if (index == 0) {
            confirm("已经是第一题了")
        } else {
            renderExe(--index);
        }
    })
    $("#nextExe").on("click", function () {//下一题
        let index = $("#questionTitle").data("index");
        if (index == GLOBAL.exercises.length - 1) {
            confirm("已经是最后一题了")
        } else {
            renderExe(++index);
        }
    })
    $('#moreQuestions').on("mousedown", function (e) {//题库展开
        e.stopPropagation();
        if ($('.model-cover').css("display") == "none") {//滤镜
            renderFooterCard();
        } else {
        }
    });
    // 删除错题
    $("#del").on("click", delErr);
    //  重新复习
    $("#reReview").on("click", function () {
        GLOBAL.stuAnswer=[]; //学生答案清空
        renderExe(0);
    });
    // 解析显示
    $("#analysis").on("click", function () {
        $("#answer").fadeIn("slow");
    })
    // 确认答案
    $("#confirm").on("click",function(){
        let answer = [];
        const index = $("#questionTitle").data("index");
        $.each($("input:checked"), function (indexInArray, valueOfElement) {
            answer.push(valueOfElement.value);
        });
        GLOBAL.stuAnswer[index] = answer;
        renderExe(index,index+1+". ");//重新渲染试题
        $("#answer").fadeIn("slow");//解析显现
    })
}
// 删除错题
async function delErr() {
    const index = $("#questionTitle").data("index");
    const exerciseId = GLOBAL.exercises[index]._id;
    let option = {
        url: "/errors/del",
        method: "delete",
        data: {
            exerciseId
        }
    }
    if (confirm("是否确认删除？")) {
        const res = await $cn(option);
        confirm(res.msg);
        location.reload(true);
    }
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