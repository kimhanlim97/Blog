const $alert = document.querySelector('#alert')
const $alertIntro = document.querySelector('#alert-intro')
const $alertMsg = document.querySelector('#alert-msg')
const $alertBtn = document.querySelector('#alert-btn')

const alertWarning = msg => {
    $alertIntro.innerHTML = msg.intro
    $alertMsg.innerHTML = msg.message
    $alert.style.display = 'block'

    $alertBtn.addEventListener('click', e => {
        $alert.style.display = 'none'
    })
}