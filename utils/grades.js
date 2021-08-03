const { default: Cheerio } = require('cheerio');
const { Builder, By, Key } = require('selenium-webdriver');
const login = require('./common/initializeLogin')
const grades = async (rollNumber, password) => {
    let driver = await login.wrapper(rollNumber, password)

    // Opening the dropdown for Gradee
    let academics = driver.findElement(By.css('li[class="dropdown"]:nth-of-type(3) a'))
    await academics.sendKeys('1', Key.ENTER)

    // Selecting the Grade
    let tt = driver.findElement(By.css('a[href="/search/gradeSheet.htm"]'))
    await tt.sendKeys('1', Key.ENTER)

    for (let i = 1; i < 9; i++) {
        const selectSemester = async (index) => {
            document.getElementById('semester').selectedIndex = index
        }
        await driver.executeScript(selectSemester, i)
        await driver.findElement(By.css('input[type="submit"]')).sendKeys('1', Key.ENTER)
        await driver.executeScript("return document.documentElement.innerHTML").then(
            html => {
                gradeCalculator(html, i)
            }
        )
    }
    console.log(gradesObject)
}

const gradesObject = {}

const gradeCalculator = (grades, i) => {

    // Load the document in Cheerio
    let $ = Cheerio.load(grades);
    let numberOfSubjects = $('tbody tr').toArray().length
    gradesObject[`semester${i}`] = {}
    let currentSem = gradesObject[`semester${i}`]
    currentSem.subjects = {}
    // To avoid the additional CGPA, GPA and TotalCredits 
    numberOfSubjects = numberOfSubjects - 3
    for (let j = 1; j < numberOfSubjects; j++) {
        let subjectCode = $(`tbody tr:nth-of-type(${j}) td:nth-of-type(2)`).text()
        let marks = $(`tbody tr:nth-of-type(${j}) td:nth-of-type(5)`).text()
        currentSem.subjects[`${subjectCode}`] = marks
    }

    // GPA
    let gpaText = $(`tbody tr:nth-of-type(${numberOfSubjects}) th`).text()
    if (gpaText === "GPA") {
        let gpa = $(`tbody tr:nth-of-type(${numberOfSubjects}) td`).text()
        currentSem.gpa = gpa
    } else {
        currentSem.gp = null
    }

    // CGPA
    let cgpaText = $(`tbody tr:nth-of-type(${numberOfSubjects + 1}) th`).text()
    if (cgpaText === "CGPA") {
        let cgpa = $(`tbody tr:nth-of-type(${numberOfSubjects + 1}) td`).text()
        currentSem.cgpa = cgpa.split('/')[0]
    } else {
        currentSem.cgpa = null
    }
}


grades(18113075, 123456)