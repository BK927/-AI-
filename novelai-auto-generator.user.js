// ==UserScript==
// @name         NovelAI auto generator
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  nai로 무한 생성해보자.
// @author       BK927
// @match        https://novelai.net/image
// @icon         https://www.google.com/s2/favicons?sz=64&domain=novelai.net
// @grant        none
// @license MIT
// @updateURL https://openuserjs.org/meta/BK927/NovelAI_auto_generator.meta.js
// @downloadURL https://openuserjs.org/install/BK927/NovelAI_auto_generator.user.js
// ==/UserScript==


(function() {
    // 스타일링을 위한 CSS 추가
    const style = document.createElement('style');
    style.innerHTML = `
        #autoClickerCheckboxContainer {
            position: fixed;
            bottom: 10px;
            right: 10px;
            z-index: 1000;
            background-color: white;
            border: 1px solid black;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
            color: black;
            display: flex;
            align-items: center; /* 요소들을 세로 중앙에 정렬 */
            white-space: nowrap;
            -webkit-user-select:none;
            -moz-user-select:none;
            -ms-user-select:none;
            user-select:none
        }
        #autoClickerCheckboxContainer:hover {
            cursor: move;
        }
        #autoClickerCheckboxContainer:active {
            cursor: move;
        }
        #autoClickerCheckbox {
            margin-right: 5px;
        }
        #countdownContainer {
            margin-left: 10px;
            font-size: 0.9em;
            color: #666;
        }
    `;


    document.head.appendChild(style);

    // 체크박스 및 레이블 생성
    const checkboxContainer = document.createElement('div');
    checkboxContainer.id = 'autoClickerCheckboxContainer';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'autoClickerCheckbox';
    const label = document.createElement('label');
    label.htmlFor = 'autoClickerCheckbox';
    label.textContent = '자동생성';
    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);

    // 남은 시간 표시 요소 생성
    const countdownContainer = document.createElement('div');
    countdownContainer.id = 'countdownContainer';
    countdownContainer.textContent = '남은 시간: 0.0초';
    checkboxContainer.appendChild(countdownContainer);

    document.body.appendChild(checkboxContainer);

    let timeoutId; // setTimeout의 ID를 저장
    let countdownIntervalId; // 카운트다운 인터벌의 ID
    let countdown; // 남은 시간(초)
    let scheduledFlag = false;


    const dragItem = document.getElementById('autoClickerCheckboxContainer');
    let active = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;



    // 드래그 시작 함수
    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (dragItem.contains(e.target)) {
            active = true;
        }
    }

    // 드래그 중 함수
    function drag(e) {
        if (active) {
            e.preventDefault();

            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, dragItem);
        }
    }

    // 드래그 종료 함수
    function dragEnd() {
        initialX = currentX;
        initialY = currentY;

        active = false;
    }

    // 위치 설정 함수
    function setTranslate(xPos, yPos, el) {
        el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    }

    // 이벤트 리스너 추가
    dragItem.addEventListener("mousedown", dragStart, false);
    document.addEventListener("mouseup", dragEnd, false);
    document.addEventListener("mousemove", drag, false);

    // XPath를 사용하여 버튼을 선택하는 함수
    function getButtonByXPath(xpath) {
        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return result.singleNodeValue;
    }

    // 버튼 클릭 함수
    function clickButton() {
        const xpath = '//*[@id="__next"]/div[2]/div[4]/div[1]/div[5]/button';
        const button = getButtonByXPath(xpath);
        if (button && !button.disabled && checkbox.checked) {
            button.click();
            scheduledFlag = false;
        }
    }

    function scheduleNextClick(delay) {
        countdown = delay / 1000;
        updateCountdownDisplay();
        clearInterval(countdownIntervalId);
        countdownIntervalId = setInterval(updateCountdownDisplay, 100); // 0.1초마다 카운트다운 업데이트
        clearTimeout(timeoutId);
        timeoutId = setTimeout(clickButton, delay);
        setTimeout(clickButton, delay);
    }

    // 남은 시간을 표시하는 함수
    function updateCountdownDisplay() {
        countdown -= 0.1;
        if (countdown < 0) {
            clearInterval(countdownIntervalId);
            countdown = 0;
        }
        countdownContainer.textContent = `남은 시간: ${countdown.toFixed(1)}초`;
    }

    // 체크박스 이벤트 리스너
    checkbox.addEventListener('change', () => {
        const xpath = '//*[@id="__next"]/div[2]/div[4]/div[1]/div[5]/button';
        const button = getButtonByXPath(xpath);
        if (checkbox.checked) {
            clickButton(); // 첫 클릭 실행
            // 인터벌 설정
            setInterval(() => {
                if (checkbox.checked && !button.disabled && !scheduledFlag) {
                    scheduledFlag = true;
                    const delay = Math.random() * 6000 + 2000; // 2초에서 8초 사이의 랜덤 딜레이
                    scheduleNextClick(delay); // 다음 클릭 스케줄링 및 카운트다운 시작
                }
            }, 500); // 0.5초마다 반복
        }
    });
})();

