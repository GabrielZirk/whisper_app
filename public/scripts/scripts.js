function submitForm(formName) {
    document.getElementById(formName).submit(); return false;
}

function checkPassword() {
    if (document.getElementById('password').value ==
        document.getElementById('confirm-password').value) {
        document.getElementById('pw-verification-message').classList.add('pw-ok');
        document.getElementById('pw-verification-message').classList.remove('pw-notok');
        document.getElementById('pw-verification-message').innerHTML = 'Matching passwords';
        document.getElementById('register-button').disabled = false;
    } else {
        document.getElementById('pw-verification-message').classList.add('pw-notok');
        document.getElementById('pw-verification-message').classList.remove('pw-ok');
        document.getElementById('pw-verification-message').innerHTML = 'Passwords not matching';
        document.getElementById('register-button').disabled = true;
    }
}