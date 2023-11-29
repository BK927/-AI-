// ==UserScript==
// @name         NovelAI auto generator
// @namespace    http://tampermonkey.net/
// @version      2.0
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
        #autoClickerContainer {
            position: fixed;
            display:flex;
            flex-direction: column;
            bottom: 10px;
            right: 10px;
            z-index: 1000;
            background-color: white;
            border: 1px solid black;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
            white-space: nowrap;
            -webkit-user-select:none;
            -moz-user-select:none;
            -ms-user-select:none;
            user-select:none;

            font-size: 1rem;
            color: #666;
        }
        #autoClickerContainer:hover {
            cursor: move;
        }
        #autoClickerContainer:active {
            cursor: move;
        }
        #autoClickerContainer > * {
           margin : 5px;
        }
        #checkboxContainer {
            display: flex;
            justify-content: space-around;
        }
        #checkboxContainer > label > input {
            width:25px;
        }
        #checkboxContainer > label {
            font-size: 1rem;
        }
        #autoClickerCheckbox {
            margin-right: 5px;
        }
        #countdownContainer {

        }
        .inputField {
            margin-left: 10px;
            margin-right: 5px;
            width: 50px;
            padding: 3px;
            border: 1px solid #ccc;
            border-radius: 3px;
            font-size: 0.8em;
        }
    `;


    document.head.appendChild(style);

    // 체크박스 및 레이블 생성
    const autoClickerContainer = document.createElement('div');
    const checkboxContainer = document.createElement('div');
    checkboxContainer.id = 'checkboxContainer';
    autoClickerContainer.id = 'autoClickerContainer';

    const autoClickLabel = document.createElement('label');
    autoClickLabel.appendChild(document.createTextNode('🔄자동생성'));
    const autoClickInput = document.createElement('input');
    autoClickInput.setAttribute('type', 'checkbox');
    autoClickLabel.appendChild(autoClickInput);


    const autoSaveLabel = document.createElement('label');
    autoSaveLabel.appendChild(document.createTextNode('💾자동저장'));
    const autoSaveInput = document.createElement('input');
    autoSaveInput.setAttribute('type', 'checkbox');
    autoSaveLabel.appendChild(autoSaveInput);

    checkboxContainer.appendChild(autoClickLabel);
    checkboxContainer.appendChild(autoSaveLabel);
    autoClickerContainer.appendChild(checkboxContainer);

    // 남은 시간 표시 요소 생성
    const countdownContainer = document.createElement('div');
    const countdownText = document.createElement('span');
    countdownContainer.id = 'countdownContainer';
    countdownText.textContent = '남은 시간: 0.0초';
    countdownContainer.appendChild(countdownText);
    autoClickerContainer.appendChild(countdownContainer);

    const minDelayInput = document.createElement('input');
    minDelayInput.className = 'inputField';
    minDelayInput.type = 'number';
    minDelayInput.min = '0';
    minDelayInput.value = '4'; // Default min delay
    minDelayInput.placeholder = '최소 대기시간';

    const maxDelayInput = document.createElement('input');
    maxDelayInput.className = 'inputField';
    maxDelayInput.type = 'number';
    maxDelayInput.min = '0';
    maxDelayInput.value = '8'; // Default max delay
    maxDelayInput.placeholder = '최대 대기시간';

    countdownContainer.appendChild(minDelayInput);
    countdownContainer.appendChild(maxDelayInput);

    document.body.appendChild(autoClickerContainer);

    let timeoutId; // setTimeout의 ID를 저장
    let countdownIntervalId; // 카운트다운 인터벌의 ID
    let countdown; // 남은 시간(초)
    let scheduledFlag = false;


    const dragItem = document.getElementById('autoClickerContainer');
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

    minDelayInput.addEventListener('change', () => {
        const minDelay = parseFloat(minDelayInput.value);
        const maxDelay = parseFloat(maxDelayInput.value);

        if (minDelay > maxDelay) {
            maxDelayInput.value = minDelay;
        }
    });


    // 위치 설정 함수
    function setTranslate(xPos, yPos, el) {
        el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    }

    // 이벤트 리스너 추가
    dragItem.addEventListener("mousedown", dragStart, false);
    document.addEventListener("mouseup", dragEnd, false);
    document.addEventListener("mousemove", drag, false);

    // XPath를 사용하여 버튼을 선택하는 함수
    function getElementByXPath(xpath) {
        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return result.singleNodeValue;
    }

    // 버튼 클릭 함수
    function clickButton() {
        const xpath = '//*[@id="__next"]/div[2]/div[4]/div[1]/div[5]/button';
        const button = getElementByXPath(xpath);
        if (button && !button.disabled && autoClickInput.checked) {
            button.click();
            scheduledFlag = false;
        }
    }

    // 자동 클릭 타임아웃 함수
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
        countdownText.textContent = `남은 시간: ${countdown.toFixed(1)}초`;
    }



    // 자동크릭 이벤트 리스너
    autoClickInput.addEventListener('change', () => {
        const button = getElementByXPath('//*[@id="__next"]/div[2]/div[4]/div[1]/div[5]/button');
        if (autoClickInput.checked && button != null) {
            clickButton(); // 첫 클릭 실행
            // 인터벌 설정
            setInterval(() => {
                if (autoClickInput.checked && !button.disabled && !scheduledFlag && maxDelayInput.value !== '' && minDelayInput.value !== '') {
                    scheduledFlag = true;
                    const delay = Math.random() * parseFloat(maxDelayInput.value) * 1000 + parseFloat(minDelayInput.value) * 1000; // 4초에서 12초 사이의 랜덤 딜레이
                    scheduleNextClick(delay); // 다음 클릭 스케줄링 및 카운트다운 시작
                }
            }, 500); // 0.5초마다 반복
        }
    });


    // 자동저장 이벤트 리스터
    let observer = null;
    autoSaveInput.addEventListener('change', () => {
        const imgContainer = getElementByXPath('/html/body');
        if (imgContainer == null) {
            return;
        }

        // 자동 저장이 체크되었을시
        if (autoSaveInput.checked) {
            // 이미지 변화 감지
            observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    // 변화 디버깅을 위한 로그 출력
                    //console.log('Mutation detected:', mutation);

                    // 자식 노드 중에 img src가 변화하면 저장 버튼 클릭
                    if (mutation.type === 'attributes' && mutation.attributeName === 'src' && mutation.target.tagName === 'IMG') {
                        const button = getElementByXPath('//*[@id="__next"]/div[2]/div[4]/div[2]/div[2]/div[3]/div/div[3]/div/div[3]/button');
                        button.click();
                    }
                });
            });
            const config = {attributes: true, subtree: true};

            observer.observe(imgContainer, config);
        }
        else{
            // 사용하지 않으면 리소스 절약을 위해 해제.
            if(observer != null){
                observer.disconnect();
            }
            observer = null;
        }
    });
})();
