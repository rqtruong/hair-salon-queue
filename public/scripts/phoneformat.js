function phoneFormat(str){
    let numbersOnly = ('' + str).replace(/\D/g, '');
    //Check if the input is of correct length
    let match = numbersOnly.match(/^(\d{3})(\d{3})(\d{4})$/); 
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    };  
    return numbersOnly;
}

var phoneInput = document.querySelector("input[name='phone']");
phoneInput.addEventListener("blur",function(){
    phoneInput.value = phoneFormat(phoneInput.value);
});