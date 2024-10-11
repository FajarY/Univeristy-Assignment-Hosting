const helperAskHeading = document.getElementById('helper-ask');
const userInput = document.getElementById('user-input');
const chatScrollable = document.getElementById('chat-scrollable');
const chatContent = document.getElementById('chat-content');

const answerArr = [];

var currentChatAnswerSubstringIndex;
var currentChatAnswerString;
var currentChatAnswerNode;

var isInputFirstTime = false;
var canAddInput = true;

loadAnswers();

document.addEventListener('keydown', function(event)
{
    if(!canAddInput)
    {
        return;
    }

    if(event.key == 'Enter')
    {
        if(userInput.value != '')
        {
            listenFirstUserInput(userInput.value);
            ask(userInput.value);
        }
    }
});

async function loadAnswers()
{
    try
    {
        const response = await fetch('./answer.json');
        const data = await response.json();

        const dataMap = new Map(Object.entries(data));
        for(const [complaint, answer] of dataMap)
        {
            var complaintArr = splitString(complaint);

            const entry =
            {
                complaintArr:complaintArr,
                answer:answer
            };

            answerArr.push(entry);
        }
    }
    catch(error)
    {
        console.error(error);
    }
}

function splitString(value)
{
    var arr = [];
    var string = '';

    for(var i = 0; i < value.length; i++)
    {
        if(value[i] == ' ' || value[i] == ',' || value[i] == '.' || value[i] == '?' || value[i] == '!')
        {
            if(string.length > 0)
            {
                arr.push(string);
                string = '';
            }
        }
        else
        {
            string += value[i];
        }
    }

    if(string.length > 0)
    {
        arr.push(string);
    }

    return arr;
}

function listenFirstUserInput()
{
    if(isInputFirstTime)
    {
        return;
    }

    isInputFirstTime = true;

    helperAskHeading.classList.add('inactive');
    userInput.classList.add('chat-input-field-active');

    chatContent.classList.add('chat-content-active');
}

function ask(value)
{
    if(!canAddInput)
    {
        return;
    }

    canAddInput = false;
    userInput.value = '';
    userInput.disabled = true;
    userInput.placeholder = 'Waiting for answers...';

    if(!userInput.classList.contains('no-input'))
    {
        userInput.classList.add('no-input');
    }

    const askNode = document.createElement('div');
    askNode.classList.add('chat-ask');
    askNode.textContent = value;

    chatScrollable.appendChild(askNode);

    initializeAnswer(value);
}

function getAnswer(complaint)
{
    var splitComplaint = splitString(complaint);
    var greatestChoose = '';
    var greatestMatch = 0;

    for(var i = 0; i < answerArr.length; i++)
    {
        const matchTest = answerArr[i].complaintArr;
        var currentMatch = 0;

        for(var j = 0; j < splitComplaint.length; j++)
        {
            for(var k = 0; k < matchTest.length; k++)
            {
                if(splitComplaint[j] == matchTest[k])
                {
                    currentMatch++;
                }
            }
        }

        if(greatestMatch < currentMatch)
        {
            greatestMatch = currentMatch;
            greatestChoose = answerArr[i].answer;
        }
    }

    if(greatestMatch == 0)
    {
        return 'Sorry, i can\'t assist with your problem, please contact support email kppl@fajar.com.';
    }
    else
    {
        return greatestChoose;
    }
}
function initializeAnswer(value)
{
    currentChatAnswerString = getAnswer(value);
    currentChatAnswerSubstringIndex = 0;
    currentChatAnswerNode = document.createElement('div');
    currentChatAnswerNode.classList.add('chat-answer');

    chatScrollable.appendChild(currentChatAnswerNode);
    
    setTimeout(answerThinking, 500);
}
function answerThinking()
{
    currentChatAnswerNode.textContent += '.';
    if(currentChatAnswerNode.textContent === '...')
    {
        setTimeout(answerUpdate, 500);
    }
    else
    {
        setTimeout(answerThinking, 500);
    }
}
function answerUpdate()
{
    currentChatAnswerSubstringIndex++;

    currentChatAnswerNode.textContent = currentChatAnswerString.substring(0, currentChatAnswerSubstringIndex);

    if(currentChatAnswerSubstringIndex >= currentChatAnswerString.length)
    {
        finishAnswerCallback();
    }
    else
    {
        setTimeout(answerUpdate, 35);
    }
}

function finishAnswerCallback()
{
    userInput.disabled = false;
    userInput.placeholder = "Ask again...";

    if(!userInput.classList.contains('no-input'))
    {
        userInput.classList.add('no-input');
    }

    canAddInput = true;
}