const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')
const $categorySelect = document.querySelector('#select-category')
const $inputCategory = document.querySelector('#input-category')
const $inputURL = document.querySelector('#input-url')
const $inputCategoryWarning = document.querySelector('#input-category-warning')
const $inputURLWarningOverlap = document.querySelector('#input-url-warning-overlap')
const $inputURLWarningString = document.querySelector('#input-url-warning-string')
const $submitBtn = document.querySelector("#write-submit")

const finalSendObj = {
    category: '',
    url: '',
    main: {}
}

const xhr = new XMLHttpRequest()
const editor = new EditorJS({
    holder: 'editorjs',
    placeholder: "Let's write",
    tools: {
        header: Header,
        delimiter: Delimiter,
        paragraph: {
            class: Paragraph,
            inlineToolbar: true,
        },
        embed: Embed,
        image: SimpleImage,
    },
    onChange: async () => {
        try {
            const output = await editor.save()
            finalSendObj.main = output
        } catch(err) {
            console.error(err)
        } 
    }
})

const debounce = (callback, delay) => {
    let timerId

    return event => {
        if (timerId) clearTimeout(timerId)
        timerId = setTimeout(callback, delay, event)
    }
}

$inputCategory.addEventListener('input', debounce(event => {
    $inputCategoryWarning.classList.add('hidden')
    if (event.target.value !== "") $categorySelect.setAttribute('disabled', true)
    else $categorySelect.removeAttribute('disabled')

    finalSendObj.category = event.target.value
    const sendObj = {
        newCategory: event.target.value
    }
    const strSendObj = JSON.stringify(sendObj)
    xhr.open('POST', '/write/check-category')
    xhr.setRequestHeader('CSRF-Token', token)
    xhr.setRequestHeader('content-type', 'application/json')
    xhr.send(strSendObj)
    xhr.onload = () => {
        if (xhr.status === 200) {
            const { categoryValidity } = JSON.parse(xhr.responseText)

            if (categoryValidity) return
            else $inputCategoryWarning.classList.remove('hidden')
        } else {
            console.error('Error: ', xhr.status, xhr.statusText)
        }
    }
}, 1000))

$inputURL.addEventListener('input', debounce(event => {
    $inputURLWarningOverlap.classList.add('hidden')
    $inputURLWarningString.classList.add('hidden')
    finalSendObj.url = event.target.value
    const sendObj = {
        url: event.target.value
    }
    const strSendObj = JSON.stringify(sendObj)
    xhr.open('POST', '/write/check-url')
    xhr.setRequestHeader('CSRF-Token', token)
    xhr.setRequestHeader('content-type', 'application/json')
    xhr.send(strSendObj)
    xhr.onload = () => {
        if (xhr.status === 200) {
            const { overlapValidity, stringValidity } = JSON.parse(xhr.responseText)
            console.log(overlapValidity, stringValidity)

            if (overlapValidity) null
            else $inputURLWarningOverlap.classList.remove('hidden')

            if (stringValidity) null
            else $inputURLWarningString.classList.remove('hidden')
        } else {
            console.error('Error: ', xhr.status, xhr.statusText)
        }
    }

}, 1000))

$submitBtn.addEventListener('click', () => {
    if ($inputCategory.value !== '') {
        finalSendObj.category = $inputCategory.value
    }
    else finalSendObj.category = $categorySelect.value

    finalSendObj.url = $inputURL.value

    const strMain = JSON.stringify(finalSendObj)
    xhr.open('POST', '/write')
    xhr.setRequestHeader('CSRF-Token', token)
    xhr.setRequestHeader('content-type', 'application/json')
    xhr.send(strMain)
    xhr.onload = () => {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText)

            if (response.type === 'category validation fail') {
                alertWarning(response)
                // alert(response.intro)
                // alert(response.message)
            }
            else if (response.type === 'url validation fail') {
                alertWarning(response)
                // alert(response.intro)
                // alert(response.message)
            }

            console.log(response)
        } 
        else {
            console.error('Error: ', xhr.status, xhr.statusText)
        }
    }
})