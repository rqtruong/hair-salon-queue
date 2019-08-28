const workers = document.querySelector("#workers");
const appts = document.querySelector("#appts").getElementsByTagName("li").length;
const estimateValue = document.querySelector("#estimate");

function updateEstimate(){
    console.log(workers.value);
    var estimateValueLow = Math.max(0, appts*20 - workers.value*20);
    var estimateValueHigh = estimateValueLow + 10;
    estimateValue.innerHTML = estimateValueLow + " — " + estimateValueHigh;
}

workers.addEventListener("load", updateEstimate);
workers.addEventListener("change", updateEstimate);