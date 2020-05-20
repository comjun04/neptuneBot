// Step 1
const agreeAllChk = document.getElementById('agree-all'),
  tosChk = document.getElementById('tos-agree'),
  privacyChk = document.getElementById('privacy-agree')
if(agreeAllChk) {
  agreeAllChk.addEventListener('click', function() {
    tosChk.checked = this.checked
    privacyChk.checked = this.checked
  })
}
if(tosChk) {
  tosChk.addEventListener('click', function() {
    if(!this.checked) agreeAllChk.checked = false
  })
}
if(privacyChk) {
  privacyChk.addEventListener('click', function() {
    if(!this.checked) agreeAllChk.checked = false
  })
}

function regStep1() {
  if(tosChk.checked && privacyChk.checked) return true
  else {
    if(!tosChk.checked) alert('이용약관에 동의하셔야 가입이 가능합니다.')
    else if(!privacyChk.checked) alert('개인정보 취급방침에 동의하셔야 가입이 가능합니다.')
    return false
  }
}

// Step 3
// Username Checker
const uname = document.getElementById('uname')
if(uname) {
  var xhr = new XMLHttpRequest()
  xhr.onload = function() {
    if(xhr.status === 200) {
      if(xhr.responseText === 'Not Exist') ok()
      else no()
    } else alert('Server Error')
  }

  uname.addEventListener('focusout', function() {
    let r = true
    uname.value.split('').forEach(function(c) {
      if(!/[a-zA-Z0-9_-]/.test(c)) r = false
    })

    if(this.value.length < 4 || this.value.length > 16 || !r) no()
    else {
      xhr.open('GET', '/register/checkuser?name=' + this.value)
      xhr.send()
    }
  })

  var ok = function() {
    uname.classList.remove('error')
    uname.classList.add('success')
  }
  var no = function() {
    uname.classList.remove('success')
    uname.classList.add('error')
  }

}

// Password Checker
let otherchar = false
const specialChars = [' ', '!', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '9', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~']
const pw = document.getElementById('pw')
if(pw) {
  pw.addEventListener('input', function(e) {
    const r = pwCheck(pw.value)

    otherchar = r === 'other'
    if(r === true) { 
      this.classList.remove('error')
      this.classList.add('success')
    } else {
      this.classList.remove('success')
      this.classList.add('error')
    }
  })

  pw.addEventListener('focusout', function() {
    if(otherchar) alert('특수문자는 ' + specialChars.join(', ') + '만 허용됩니다.')
  })
}

const pwchk = document.getElementById('pwchk')
if(pwchk) pwchk.addEventListener('input', function(e) {
  if(this.value.length > 0 && this.value === pw.value) {
    this.classList.remove('error')
    this.classList.add('success')
  } else {
    this.classList.remove('success')
    this.classList.add('error')
  }
})

function pwCheck(psw) {
  if(psw.length < 8) return false

  let cap = false,
    low = false,
    num = false,
    ch = false,
    otherch = false
  psw.split('').forEach(function(c) {
    if(/^[0-9]$/.test(c)) num = true
    else if(/^[a-z]$/.test(c)) low = true
    else if(/^[A-Z]$/.test(c)) cap = true
    else if(specialChars.includes(c)) ch = true

    if(!/[a-zA-Z0-9]/.test(c) && !specialChars.includes(c)) otherch = true
  })

  if(!cap || !low || !num || !ch) return false
  else if(otherch) return 'other'
  else return true
}

function regStep3() {
  
}
