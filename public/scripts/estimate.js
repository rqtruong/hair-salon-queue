const workers = document.querySelector("#workers");
const appts = document.querySelector("#appts").getElementsByTagName("li").length;
const estimateValue = document.querySelector("#estimate");

function updateEstimate(){
    console.log(workers.value);
    var estimateValueLow = Math.max(0, appts*20 - workers.value*20);
    var estimateValueHigh = estimateValueLow + 10;
    estimateValue.innerHTML = estimateValueLow + " — " + estimateValueHigh;
}

workers.onkeydown = function(e) {
    if(!((e.keyCode > 95 && e.keyCode < 106)
      || (e.keyCode > 47 && e.keyCode < 58) 
      || e.keyCode == 8)) {
        return false;
    }
}

updateEstimate();
workers.addEventListener("change", updateEstimate);